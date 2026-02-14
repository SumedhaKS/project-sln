import { Router } from "express";
import authRouter from "./auth";

const mainRouter = Router();


mainRouter.use("/auth", authRouter);

// should add customer and jobs routers

export default mainRouter;