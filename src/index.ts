import './paths';
import dotenv from 'dotenv';
import {run as runApi} from './api';
import {run as runBot} from './bot';
import LogManager from './utils/Logger';
dotenv.config();
const logger = new LogManager().getLogger('MAIN');
runApi();
runBot();
function anisleepRender() {
  fetch('https://io3.onrender.com', {
    method: 'get',
  }).then(response => {
    logger.log(`Self Request Status: ${response.status}`);
  });
}
setInterval(anisleepRender, 30000);
