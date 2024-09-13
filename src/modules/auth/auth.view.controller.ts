import { Request, Response } from 'express';

class AuthViewController {

    static loginPage(req: Request, res: Response) {
        res.render('login.ejs', {
            title: 'Broadcast',
            layout: './layouts/guest.ejs',
        });
    }
    
}

export default AuthViewController;