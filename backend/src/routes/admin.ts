// Handle user creation logic
import 'dotenv/config'
import { Router, type Request, type Response } from "express";
import { createUserSchema } from '../types';
import prisma from '../db';
import bcrypt from "bcrypt";

const adminRouter = Router();

/*
    req.body => {
        username,
        password,
        adminPassword
    }
*/

adminRouter.post("/create-user", async (req: Request, res: Response) => {

    try {
        // get admin pass from the request -> validate admin pass if !adminPass return, check if (user already exists)? return : create new user in the db 
        if (!process.env.ADMIN_PASSWORD) {
            throw new Error("ADMIN_PASSWORD not defined");
        }

        const response = createUserSchema.safeParse(req.body);

        if (!response.success) {
            return res.status(400).json({ message: "Invalid inputs" })
        }

        const { username, password, adminPassword } = response.data;

        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        const existingUser = await prisma.user.findUnique({
            where: { username }
        })

        if (existingUser) {
            return res.status(409).json({ message: "Username already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })

        if (newUser) {
            return res.status(201).json({ message: "User created successfully" })
        }

    }
    catch (err) {
        // standard error 500 Internal server error display
        console.error("Error while creating new user: ", err);
        return res.status(500).json({ message: "Internal server error" })

    }
})

export default adminRouter;
