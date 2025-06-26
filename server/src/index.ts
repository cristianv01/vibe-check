import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authMiddleWare } from "./middleware/authMiddleware";
//Routes Imports
import userRoutes from "./routes/userRoutes";
import ownerRoutes from "./routes/ownerRoutes";
//Config
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());


//Routes
app.get('/', (req,res) =>{
    res.send("Health check");
});

app.use("/users",authMiddleWare(["user"]),userRoutes);
app.use("/owners", authMiddleWare(["owner"]),ownerRoutes);

//Server
const port = process.env.port || 8000;
app.listen(port, () =>{
    console.log(`Server running on port ${port}`);
});