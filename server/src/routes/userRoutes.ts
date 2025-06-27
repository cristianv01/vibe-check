import express from "express";
import {
    getUser,
    createUser,
    updateUser,
} from "../controllers/userController";

const router = express.Router();

router.get("/:cognitoId", getUser);
router.put("/:cognitoId", updateUser);
router.post("/", createUser);



export default router;