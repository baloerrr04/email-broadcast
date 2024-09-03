import { Router } from 'express';
import passport from '../../common/libs/passport'
import { getAuthorization, validationMiddleware } from './auth.middleware';
import AuthController from './auth.controller';
import { AppPasswordDTO } from './dtos/appPassword.dto';
import { LoginDTO } from './dtos/login.dto';
import { RegisterDTO } from './dtos/register.dto';

const router = Router();

router.post('/register',validationMiddleware(RegisterDTO), AuthController.register);
router.post('/login', validationMiddleware(LoginDTO), AuthController.login);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const { user, token } = req.user as any;

      res.cookie('authToken', token, { httpOnly: true, maxAge: 3600000 });
      req.login((user), (err) => {
        if (err) {
          console.log(err);
          res.redirect('/login');
        } else {
          res.redirect('/');
        }
      });
    } catch (err) {
      console.log(err);
      res.redirect('/login');
    }
  }
);

// router.get('/logout', (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.redirect('/login');
//     }
//   });
// });

router.get('/logout', (req,res) => {
  res.clearCookie('authToken'); // Hapus cookie authToken
    res.redirect('/login'); // Arahkan pengguna ke halaman login
})

router.post('/save-app-password', getAuthorization, validationMiddleware(AppPasswordDTO), AuthController.saveAppPassword);


export default router;
