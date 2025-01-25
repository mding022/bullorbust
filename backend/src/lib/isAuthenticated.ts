import { NextFunction, Request, Response } from "express";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if(!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    next();
}