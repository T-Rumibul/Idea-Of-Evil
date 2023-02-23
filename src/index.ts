import './paths'
import { run as runApi } from './api/';
import { run as runBot } from './bot/';
import dotenv from 'dotenv';

dotenv.config();

runApi();
runBot();


