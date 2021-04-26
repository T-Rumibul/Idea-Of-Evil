import { Router } from 'express';
import controller from '@api/controllers/v1/'


const router = Router();

router.post('/send', controller.sendMessage)

export default router;
