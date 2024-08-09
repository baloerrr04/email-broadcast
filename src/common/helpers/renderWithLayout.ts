import { Response } from 'express';

export const renderWithLayout = (res: Response, view: string, options: object = {}): void => {
    res.render(view, options, (err, html) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        const newOptions = { ...options, body: html };
        res.render('layout', newOptions);
    });
};
