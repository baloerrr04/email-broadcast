import { Router } from 'express';
import AdminViewController from './admin.view.controller';
import { authorizeRole, getAuthorization } from '../../middlewares/auth.middleware';

const router = Router()

router.get('/', getAuthorization, authorizeRole('ADMIN'),  AdminViewController.dashboardPage);
router.get('/users', getAuthorization, authorizeRole('ADMIN'),  AdminViewController.usersPage);
router.get('/emails', getAuthorization, authorizeRole('ADMIN'),  AdminViewController.emailsPage);
router.get('/users/create', getAuthorization, authorizeRole('ADMIN'),  AdminViewController.createUserPage);
router.get('/users/:id/edit', getAuthorization, authorizeRole('ADMIN'),  AdminViewController.editUserPage);
router.get('/broadcasters', getAuthorization, authorizeRole('ADMIN'),  AdminViewController.broadcasterPage);
router.get('/broadcasters/create', getAuthorization, authorizeRole('ADMIN'),  AdminViewController.createBrodacasterPage);
router.get('/broadcasters/edit/:id', getAuthorization, authorizeRole('ADMIN'),  AdminViewController.editBroadcasterPage);

export default router;