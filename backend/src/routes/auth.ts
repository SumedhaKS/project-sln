// Handle user login logic
import 'dotenv/config'
import { Router, type Request, type Response } from "express";
import { userLoginSchema } from "../types";
import prisma from "../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response) => {
    const secret: string = process.env.JWT_SECRET || "secret";
    const jwtExpiry: string = process.env.JWT_EXPIRES_IN || '24h';

    try {
        const user = userLoginSchema.safeParse(req.body);

        if (!user.success) {
            return res.status(401).json({
                message: "Invalid inputs"
            })
        }
        const { username, password } = user.data;

        // validate user
        const existingUser = await prisma.user.findUnique({
            where: { username }
        })

        if (!existingUser) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }

        const valid = await bcrypt.compare(password, existingUser.password);
        if (!valid) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }

        // create auth token 
        const token = jwt.sign(
            { id: existingUser.id, username: existingUser.username },
            secret,
            { expiresIn: jwtExpiry as jwt.SignOptions["expiresIn"] }
        )

        return res.status(200).json({
            message: "User login successfull",
            token
        })
    }
    catch (err) {
        console.error("Error during login: ", err);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export default authRouter;