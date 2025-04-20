import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


// routes import
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser())

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
	res.send("Hello Welcome to leetlab 🔥");
});

app.use("/api/v1/auth", authRoutes);

app.listen(port, () => {
	console.log("server is listening at port:", port);
});
