import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import mailerRoutes from './modules/mailer/mailer.routes'
import errorHandler from './common/errors/errorHandler';
import passport from './common/libs/passport';
import session from 'express-session';
import ejs from 'ejs';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { refreshUserData } from './modules/auth/auth.middleware';
import MailRepository from './modules/mailer/mailer.repository';


const app: Application = express();

app.engine("ejs", ejs.renderFile);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

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
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(refreshUserData);

app.use('/edit-email', express.static(path.join(__dirname, 'public')));


app.get('/login', (req, res) => {
    res.render('login.ejs', {
        title: 'Broadcast'
    });
});

app.get('/', async (req, res) => {
    if (req.isAuthenticated() && req.user) {

        res.render('index.ejs', { user: req.user, title: 'Broadcast' });
    } else {
        res.redirect('/login');
    }
});

// app.get('/', (req,res) => {
//     res.render('index.ejs', { user: req.user, title: 'Broadcast' });
// })

app.get('/input-app-password', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('input-app-password.ejs', { user: req.user, title: 'App Password' });
    } else {
        res.redirect('/login');
    }
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About'
    });
});

app.get('/send-email', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.render('add-email.ejs', { user: req.user, title: 'Send Email' });
    } else {
        res.redirect('/login');
    }
})

app.get('/edit-email/:id', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const emailId = parseInt(req.params.id);
        const email = await MailRepository.findById(emailId);
        if (!email) {
            return res.status(404).send('Email not found');
        }

        res.render('edit-email.ejs', { user: req.user, email: email, title: 'Edit Email' });
    } else {
        res.redirect('/login');
    }
})



app.use('/', authRoutes);
app.use('/api', mailerRoutes);

export default app;
