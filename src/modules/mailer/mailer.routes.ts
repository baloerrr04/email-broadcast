import { Router } from 'express';
import MailController from './mailer.controller'; // Sesuaikan dengan lokasi EmailController
import { getAuthorization } from '../auth/auth.middleware';

const router = Router();

router.get('/emails', getAuthorization, MailController.getEmails);
router.post('/send-email', getAuthorization, MailController.sendEmail);
router.post('/emails/:id/edit', MailController.updateEmail);
router.delete('/emails/:id', getAuthorization, MailController.deleteEmail);



export default router;
