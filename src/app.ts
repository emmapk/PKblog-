import express from "express";
import http from "http";
import path from "path"; 
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import Route from "./routes/route.controller";
import ejs from "ejs";

const app = express();
const PORT: number = 8888;

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());
app.use(cors());
app.use(express.static(path.join(__dirname, "/public"))); 

app.use(Route);

app.listen(PORT, () => {
    console.log(`The server is running on Port ${PORT}`);
});
