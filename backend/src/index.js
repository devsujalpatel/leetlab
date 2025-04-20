import express from "express";
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})

const app = express()
app.use(express.json())

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.listen(port, () => {
    console.log("server is listening at port:", port);
})
