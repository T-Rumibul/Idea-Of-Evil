import express from 'express';

import dotenv from 'dotenv';
import cors from 'cors';
import router from './router/index';
import { getLogger } from './helpers';
import bodyParser from 'body-parser';
const log = getLogger('API');
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(
	cors({
		origin: '*',
	})
);
app.use(router);

app.get('/', function (req, res) {
	log('Recived get request');
	res.send('hello world');
});

app.post('/', function (req, res) {
	log('Recived post request');
	res.status(200).json({ 'hello world': 'hello world' });
});

export function run() {
	const port = process.env.PORT || 5001;
	app.listen(port, () => {
		log(`Api is listening on port ${port}.`);
	});
}
export default app;
