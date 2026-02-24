// The main express router

import dotenv from "dotenv";
import express from "express";
import mainRouter from "./routes";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 7002;

app.use(express.json())

app.use("/api/v1", mainRouter)


app.listen(PORT, () => console.log(`Server running on port ${PORT}`))