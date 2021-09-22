import { run as runApi } from './api/';
import { run as runBot } from './bot/';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

runApi();
runBot();
herokuAntiSleep();

// Keeps heroku dyno awake
function herokuAntiSleep() {
	const port = process.env.PORT || 5001;
	const herokuhost = process.env.HEROKU_HOST || `http://localhost:${port}`;
	setInterval(() => {
		axios.get(`${herokuhost}`).catch(() => {});
		axios.get(`http://localhost:${port}`).catch(() => {});
		axios
			.post(`http://localhost:${port}`, {
				adsadasda: 'adsadasd',
			})
			.catch(() => {});
	}, 300000);
}
