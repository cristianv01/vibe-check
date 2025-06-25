import { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
    sub: string;
    "custom:role"?: string;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?:{
                id: string;
                role: string;
            }
        }
    }
}

export const authMiddleWare = (allowedRoles:string[]) =>{
    return (req:Request, res:Response, next:NextFunction): void =>{
        const token = req.headers.authorization?.split(" ")[1];

        if (!token){
            res.status(401).json({message: "Unauthorized"});
            return;
        }


        try{
            const decoded = jwt.decode(token) as DecodedToken;
            const userRole = decoded["custom:role"] || "";
            req.user = {
                id: decoded.sub,
                role: userRole
            }

            const hasAccess = allowedRoles.includes(userRole.toLowerCase());
            if(!hasAccess){
                res.status(403).json({message: "Forbidden"});
                return;
            }
        }catch(error){
            console.error("Error verifying token:", error);
            res.status(400).json({message: "Invalid token"});
            return;
        }

        next();
    }
}