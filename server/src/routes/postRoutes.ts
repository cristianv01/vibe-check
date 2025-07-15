import express from "express";
import {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost
} from "../controllers/postController";
import { authMiddleWare } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/:id", getPost);

// Protected routes (authenticated users)
router.post("/", authMiddleWare(["user"]), createPost);
router.put("/:id", authMiddleWare(["user"]), updatePost);
router.delete("/:id", authMiddleWare(["user", "admin"]), deletePost);

export default router; 