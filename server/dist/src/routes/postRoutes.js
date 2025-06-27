"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Public routes
router.get("/", postController_1.getPosts);
router.get("/:id", postController_1.getPost);
// Protected routes (authenticated users)
router.post("/", postController_1.createPost);
router.put("/:id", (0, authMiddleware_1.authMiddleWare)(["user"]), postController_1.updatePost);
router.delete("/:id", (0, authMiddleware_1.authMiddleWare)(["user", "admin"]), postController_1.deletePost);
exports.default = router;
