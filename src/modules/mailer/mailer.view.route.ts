import { Router } from 'express';
import { getAuthorization } from '../../middlewares/auth.middleware';
import MailerViewController from './mailer.view.controller';

const router = Router();

router.get('/', getAuthorization, MailerViewController.sentMailPage);
router.get('/scheduled', getAuthorization, MailerViewController.scheduledMailPage);
router.get('/send-email', getAuthorization, MailerViewController.sendMailPage);

export default router;