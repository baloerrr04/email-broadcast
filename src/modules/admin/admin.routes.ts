import { Router } from 'express';
import AdminController from './admin.controller';
import { getAuthorization } from '../../middlewares/auth.middleware';

const router = Router()

router.post('/broadcasters/create', getAuthorization, AdminController.addBroadcaster);
router.post('/users/create', getAuthorization, AdminController.addUser);
router.put('/broadcasters/update/:id', getAuthorization, AdminController.updateBroadcaster);
router.put('/users/:id/update', getAuthorization, AdminController.updateUSer);
router.delete('/broadcasters/delete/:id', getAuthorization, AdminController.deleteBroadcaster);
router.delete('/users/delete/:id', getAuthorization, AdminController.deleteUser);
router.delete('/emails/delete/:id', getAuthorization, AdminController.deleteEmail);


export default router;