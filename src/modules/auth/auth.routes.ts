import { Router } from 'express';
import { getAuthorization, validationMiddleware } from './auth.middleware';
import AuthController from './auth.controller';
import { LoginDTO } from './dtos/login.dto';
import { RegisterDTO } from './dtos/register.dto';

const router = Router();

router.post('/register',validationMiddleware(RegisterDTO), AuthController.register);
router.post('/login', validationMiddleware(LoginDTO), AuthController.login);
router.post('/add-broadcast', getAuthorization, AuthController.addBroadcast)
router.get('/logout', (req,res) => {
  res.clearCookie('authToken'); // Hapus cookie authToken
    res.redirect('/login'); // Arahkan pengguna ke halaman login
})


export default router;
