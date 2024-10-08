import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "https://api.open-meteo.com/v1/forecast?";

// Ensure that API_URL is defined
if (!API_URL) {
    console.error('API_URL is not defined in environment variables');
    process.exit(1);
}

// Set up view engine and directory for views
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Placeholder variables
let data;
let graph_time;
let name;
let backgroundColor;
let borderColor;
let type;

// Route to render the index view
app.get('/', (req, res) => {
    res.render('index', {
        x_axis: data,
        y_axis: graph_time,
        label: name,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        graphType: type
    });
});

// Route to handle form submission and fetch weather data
app.post('/graph', async (req, res) => {
    const lat = '11.83';
    const lng = '99.85';
    const params = 'hourly=temperature_2m,rain,showers,wind_speed_80m,wind_speed_120m&timezone=Asia%2FBangkok';
    
    try {
        console.log(`Fetching weather data for coordinates: (${lat}, ${lng}) with params: ${params}`);
        const result = await axios.get(`${API_URL}latitude=${lat}&longitude=${lng}&${params}`);
        const responseData = result.data;
        console.log(`Received data: ${JSON.stringify(responseData)}`);

        if (!responseData || !responseData.hourly) {
            throw new Error('Invalid response data structure');
        }

        const time = responseData.hourly.time;
        const rain = responseData.hourly.rain;
        const showers = responseData.hourly.showers;
        const windspeed80m = responseData.hourly.wind_speed_80m;
        const windspeed120m = responseData.hourly.wind_speed_120m;

        switch (req.body.select) {
            case "rain":
                data = rain;
                graph_time = time;
                name = "Rain";
                backgroundColor = 'rgba(30, 155, 255, 0.2)';
                borderColor = 'rgba(30, 155, 255, 1)';
                type = "line";
                break;
            case "showers":
                data = showers;
                graph_time = time;
                name = "Showers";
                backgroundColor = 'rgba(127, 17, 224, 0.2)';
                borderColor = 'rgba(127, 17, 224, 1)';
                type = "bar";
                break;
            case "windspeed80m":
                data = windspeed80m;
                graph_time = time;
                name = "Windspeed at 80m";
                backgroundColor = 'rgba(110, 255, 62, 0.2)';
                borderColor = 'rgba(110, 255, 62, 1)';
                type = "line";
                break;
            case "windspeed120m":
                data = windspeed120m;
                graph_time = time;
                name = "Windspeed at 120m";
                backgroundColor = 'rgba(255, 24, 103, 0.2)';
                borderColor = 'rgba(255, 24, 103, 1)';
                type = "line";
                break;
            default:
                throw new Error('Invalid data selection');
        }

        res.redirect('/');

    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send('Error fetching weather data');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
