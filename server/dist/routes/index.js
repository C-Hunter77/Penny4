import { Router } from 'express';
import userRouter from './api/user-routes.js';
import thoughtRouter from './api/thought-routes.js';
const router = Router();
// These routes are all public (no JWT middleware)
router.use('/users', userRouter);
router.use('/thoughts', thoughtRouter);
export default router;
