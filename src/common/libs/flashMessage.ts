import { Request, Response, NextFunction } from "express";

export function flashMessage(req: Request, res: Response, next: NextFunction) {
    if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message;
    }
    next();
}
