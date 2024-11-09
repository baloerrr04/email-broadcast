import express, { Application, Request } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from './common/errors/errorHandler';
import session from 'express-session';
import ejs from 'ejs';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { refreshUserData } from './middlewares/auth.middleware';
import multer from 'multer';
import expressLayouts from 'express-ejs-layouts';
import methodOverride from 'method-override';
import dotenv from 'dotenv';

import authApiRoutes from './modules/auth/auth.routes';
import mailerApiRoutes from './modules/mailer/mailer.routes'
import adminApiRoutes from './modules/admin/admin.routes'
import authViewRoutes from './modules/auth/auth.view.route';
import mailerViewRoutes from './modules/mailer/mailer.view.route';
import adminViewRoutes from './modules/admin/admin.view.route'
import { flashMessage } from './common/libs/flashMessage';

dotenv.config();

const app: Application = express();

app.engine("ejs", ejs.renderFile);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout.ejs");
app.set("layout extractScripts", true);



app.use(express.static(path.join(__dirname, '..', 'public')));


app.use(
    session({
        secret: "lekyhad",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errorHandler);
app.use(cookieParser());
app.use(refreshUserData);
app.use(methodOverride('_method'))
app.use(flashMessage);



app.use('/edit-email', express.static(path.join(__dirname, 'public')));
app.use('/send-email', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// app.use('/uploads', express.static(path.join('uploads')));

// Path absolut ke folder uploads
const uploadsPath = path.resolve(__dirname, '../uploads');

// Middleware untuk melayani file statis dari folder uploads
app.use('/uploads', express.static(uploadsPath));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });;

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ fileUrl: `/uploads/${req.file.filename}` }); // Sesuaikan ini dengan URL yang dapat diakses dari aplikasi Anda
});


app.use('/', authViewRoutes);
app.use('/', mailerViewRoutes);
app.use('/admin', adminViewRoutes);
app.use('/api', authApiRoutes);
app.use('/api', mailerApiRoutes);
app.use('/api', adminApiRoutes);

export default app;
