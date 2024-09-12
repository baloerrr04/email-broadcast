import express, { Application, Request } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import mailerRoutes from './modules/mailer/mailer.routes'
import errorHandler from './common/errors/errorHandler';
import session from 'express-session';
import ejs from 'ejs';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { getAuthorization, redirectIfAuthenticated, refreshUserData } from './modules/auth/auth.middleware';
import MailRepository from './modules/mailer/mailer.repository';
import multer from 'multer';
import expressLayouts from 'express-ejs-layouts'
import moment from 'moment';
import methodOverride from 'method-override'


const app: Application = express();

app.engine("ejs", ejs.renderFile);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout.ejs");
app.set("layout extractScripts", true);


app.use(express.static(path.join(__dirname, "public")));

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

app.use('/edit-email', express.static(path.join(__dirname, 'public')));
app.use('/send-email', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
app.use('/uploads', express.static(path.join('uploads')));

app.get('/login', redirectIfAuthenticated, (req, res) => {

    res.render('login.ejs', {
        title: 'Broadcast',
        layout: './layouts/guest.ejs',
    });
});

app.get('/', getAuthorization, async (req, res) => {
    if (req.user) {
        const userId = (req.user as { id: number }).id;
        const status = "Terkirim";
        const emails = await MailRepository.findByUserIdAndStatus(userId, status)
        const emailsModified = emails.map((email) => {
            let displayDate;
            if(email.schedules.length > 0) {
                displayDate = moment(email.schedules[0].scheduleDate).add(17, 'hours').format('DD/MM/YYYY HH:mm');
            } else {
                displayDate = moment(email.createdAt).format('DD/MM/YYYY HH:mm');  
            }
            console.log(email);

            return {
                ...email,
                displayDate,
            };

            
        })
        const currentRoute = '/';

        res.render('index.ejs',
            {
                user: req.user,
                title: 'Broadcast',
                emails: emailsModified,
                currentRoute
            });
    } else {
        res.redirect('/login');
    }
});


app.get('/scheduled', getAuthorization, async (req, res) => {
    if (req.user) {
        const userId = (req.user as { id: number }).id;
        const status = "Menunggu";
        const emails = await MailRepository.findByUserIdAndStatus(userId, status)
        const currentRoute = '/scheduled';

        res.render('scheduled-email.ejs',
            {
                user: req.user,
                title: 'Broadcast',
                emails,
                currentRoute
            });
    } else {
        res.redirect('/login');
    }
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About'
    });
});

app.get('/send-email', getAuthorization, async (req, res) => {
    if (req.user) {
        const broadcasters = await MailRepository.findBroadcaster()
        console.log("broadcaster:", broadcasters);
        const currentRoute = '/send-email';
        res.render('add-email.ejs', { user: req.user, title: 'Send Email', broadcasters, currentRoute });
    } else {
        res.redirect('/login');
    }
});

app.get('/edit-email/:id', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const emailId = parseInt(req.params.id);
        const email = await MailRepository.findEmailById(emailId);
        if (!email) {
            return res.status(404).send('Email not found');
        }

        res.render('edit-email.ejs', { user: req.user, email: email, title: 'Edit Email' });
    } else {
        res.redirect('/login');
    }
})

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


app.use('/', authRoutes);
app.use('/api', mailerRoutes);

export default app;
