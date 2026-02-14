// Handle user login logic

import { Router, type Request, type Response } from "express";
import { userLoginSchema, type userLogin } from "../types/loginType";
import prisma from "../db";

const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response)=>{
    const {username, password}: userLogin = req.body;
    const user = userLoginSchema.safeParse(req.body);
    if(!user.success){
        return res.status(401).json({
            message: "Invalid inputs"
        })
    }
    //check if user is valid 
    const validUser = await prisma.User.findOne({
        username,
        password
    })
    if(!validUser){
        return res.status(404).json({
            message: "User not found"
        })
    }
    //  create a tokena and send it
})

export default authRouter;