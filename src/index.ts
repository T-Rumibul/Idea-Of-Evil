import './paths';
import dotenv from 'dotenv';
import { run as runApi } from './api';
import { run as runBot } from './bot';

dotenv.config();

runApi();
runBot();
