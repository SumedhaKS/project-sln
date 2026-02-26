// handles user authentication
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface AuthPayload extends JwtPayload {
    id: string;
    username: string;
}

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        username: string
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    //auth logic
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Missing or invalid token"
            })
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not found")
        }

        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Missing or invalid token" })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (typeof decoded !== "object" ||
            decoded === null ||
            !("id" in decoded) ||
            !("username" in decoded)
        ) {
            return res.status(401).json({
                message: "Invalid token"
            })
        }

        const payload = decoded as AuthPayload;
        (req as AuthenticatedRequest).user = {
            id: payload.id,
            username: payload.username
        }
        next();
    }
    catch (err) {
        console.error("Error during authentication: " + err);
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}
