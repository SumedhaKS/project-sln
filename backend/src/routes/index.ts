import { Router } from "express";
import authRouter from "./auth";
import customerRouter from "./customers";

const mainRouter = Router();

mainRouter.use("/admin")
mainRouter.use("/auth", authRouter);
mainRouter.use("/customer", customerRouter);

// should add customer and jobs routers

export default mainRouter;