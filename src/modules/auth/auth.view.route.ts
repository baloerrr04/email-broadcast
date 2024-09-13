import { Router } from 'express';
import { redirectIfAuthenticated } from '../../middlewares/auth.middleware';
import AuthViewController from './auth.view.controller';

const router = Router();

router.get('/login',redirectIfAuthenticated, AuthViewController.loginPage);

export default router;