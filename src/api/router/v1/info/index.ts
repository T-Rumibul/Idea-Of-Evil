import { Router } from 'express';
import controller from '@api/controllers/v1/'


const router = Router();

router.get('/', controller.info)
router.post('/', controller.spizditInfu)
export default router;
