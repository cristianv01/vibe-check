"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const authMiddleware_1 = require("./middleware/authMiddleware");
//Routes Imports
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const ownerRoutes_1 = __importDefault(require("./routes/ownerRoutes"));
const locationRoutes_1 = __importDefault(require("./routes/locationRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
//Config
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'https://vibecheck.community',
        'https://www.vibecheck.community'
    ], // Allow frontend origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Body parser configuration with increased limits for image uploads
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Helmet configuration
app.use((0, helmet_1.default)({
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
app.use((0, morgan_1.default)("common"));
//Routes
app.get('/', (req, res) => {
    res.send("Health check");
});
app.use("/users", (0, authMiddleware_1.authMiddleWare)(["user"]), userRoutes_1.default);
app.use("/owners", (0, authMiddleware_1.authMiddleWare)(["owner"]), ownerRoutes_1.default);
app.use("/locations", locationRoutes_1.default);
app.use("/posts", postRoutes_1.default);
app.use("/upload", uploadRoutes_1.default);
//Server
const port = Number(process.env.PORT) || 8000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});
