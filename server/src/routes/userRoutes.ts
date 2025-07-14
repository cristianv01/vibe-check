import express from "express";
import {
    getUser,
    createUser,
    updateUser,
    addFavoritePost,
    removeFavoritePost,
} from "../controllers/userController";

const router = express.Router();

router.get("/:cognitoId", getUser);
router.put("/:cognitoId", updateUser);
router.post("/:cognitoId/favorites/:postId", addFavoritePost);
router.delete("/:cognitoId/favorites/:postId", removeFavoritePost); 
router.post("/", createUser);



export default router;