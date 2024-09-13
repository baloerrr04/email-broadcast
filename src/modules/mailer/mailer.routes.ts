import { Router } from 'express';
import MailController from './mailer.controller'; // Sesuaikan dengan lokasi EmailController
import { getAuthorization } from '../../middlewares/auth.middleware';;

const router = Router();

router.post('/send-email', getAuthorization, MailController.sendEmail);
router.delete('/emails/:id', getAuthorization, MailController.deleteEmail);


export default router;
