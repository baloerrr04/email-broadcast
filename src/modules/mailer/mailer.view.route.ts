import { Router } from 'express';
import { authorizeRole, getAuthorization } from '../../middlewares/auth.middleware';
import MailerViewController from './mailer.view.controller';

const router = Router();

router.get('/', getAuthorization, authorizeRole('USER'), MailerViewController.sentMailPage);
router.get('/scheduled', getAuthorization, authorizeRole('USER'), MailerViewController.scheduledMailPage);
router.get('/send-email', getAuthorization, authorizeRole('USER'), MailerViewController.sendMailPage);
router.get('/emails/:id/edit', getAuthorization, authorizeRole('USER'), MailerViewController.editMailPage);

export default router;