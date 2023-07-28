import {Router} from 'express';

import cors from 'cors';
import infoRoutes from './v1/info';
import setRoutes from './v1/set';
import messageRoutes from './v1/message';

const router = Router();
router.use(
  cors({
    origin: '*',
  })
);

router.use('/api/v1/info', infoRoutes);
router.use('/api/v1/set', setRoutes);
router.use('/api/v1/message', messageRoutes);
export default router;
