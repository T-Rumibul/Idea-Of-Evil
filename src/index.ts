import { run as runApi } from './api/';
import { run as runBot } from './bot/'
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config()
runApi();
runBot()
herokuAntiSleep()

// Keeps heroku dyno awake
function herokuAntiSleep() {
    const port = process.env.PORT || 5001
    const herokuhost = process.env.HEROKU_HOST || `http://localhost:${port}`
    console.log(port)
    setInterval(() => {
        axios.get(`${herokuhost}`);
        axios.get(`http://localhost:${port}`)
        axios.post(`http://localhost:${port}`, {
            'adsadasda': 'adsadasd'
        })
    }, 1200000)
}