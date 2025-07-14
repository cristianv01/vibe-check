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
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
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
const port = Number(process.env.port) || 8000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});
