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
import locationRoutes from "./routes/locationRoutes";
import postRoutes from "./routes/postRoutes";
import uploadRoutes from "./routes/uploadRoutes";

//Config
dotenv.config();
const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow frontend origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser configuration with increased limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Helmet configuration
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(morgan("common"));

//Routes
app.get('/', (req,res) =>{
    res.send("Health check");
});

app.use("/users",authMiddleWare(["user"]),userRoutes);
app.use("/owners", authMiddleWare(["owner"]),ownerRoutes);
app.use("/locations", locationRoutes);
app.use("/posts", postRoutes);
app.use("/upload", uploadRoutes);

//Server
const port = Number(process.env.PORT) || 8000;
app.listen(port, "0.0.0.0", () =>{
    console.log(`Server running on port ${port}`);
});