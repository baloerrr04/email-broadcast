import { Router } from 'express';
import MailController from './mailer.controller'; // Sesuaikan dengan lokasi EmailController
import { getAuthorization } from '../../middlewares/auth.middleware';import multer from 'multer';
;

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Tentukan folder penyimpanan
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

router.post('/send-email', getAuthorization, MailController.sendEmail);
router.delete('/emails/:id', getAuthorization, MailController.deleteEmail);
router.post('/generate-email-template', getAuthorization, upload.single('file'),MailController.generateEmailTemplate);
router.post('/cancel-scheduled-email/:id', getAuthorization, MailController.cancelScheduledEmail);


export default router;
