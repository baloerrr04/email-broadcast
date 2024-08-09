import { Router } from 'express';
import passport from '../../common/libs/passport'
import { getAuthorization, validationMiddleware } from './auth.middleware';
import AuthController from './auth.controller';
import { AppPasswordDTO } from './dtos/appPassword.dto';

const router = Router();

// router.post('/register', AuthController.register);
// router.post('/login', AuthController.login);

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

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/login');
    }
  });
});

router.post('/save-app-password', getAuthorization, validationMiddleware(AppPasswordDTO), AuthController.saveAppPassword);


export default router;
