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

        // Process the response data
        const time = responseData.hourly.time;
        const temperature = responseData.hourly.temperature_2m;
        const rain = responseData.hourly.rain;
        const showers = responseData.hourly.showers;
        const wind_speed_80m = responseData.hourly.wind_speed_80m;
        const wind_speed_120m = responseData.hourly.wind_speed_120m;

        data = temperature;
        graph_time = time;
        name = 'Temperature';
        backgroundColor = 'rgba(75, 192, 192, 0.2)';
        borderColor = 'rgba(75, 192, 192, 1)';
        type = 'line';

        // Render the index view with updated data
        res.render('index', {
            x_axis: data,
            y_axis: graph_time,
            label: name,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            graphType: type
        });

    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
