import { Router } from "express";
import authRouter from "./auth";
import customerRouter from "./customers";
import jobsRouter from "./jobs";
import adminRouter from "./admin";

const mainRouter = Router();

mainRouter.use("/admin", adminRouter);
mainRouter.use("/auth", authRouter);
mainRouter.use("/customer", customerRouter);
mainRouter.use("/job", jobsRouter);

export default mainRouter;