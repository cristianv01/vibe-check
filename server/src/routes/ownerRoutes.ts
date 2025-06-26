import express from "express";
import {
    getOwner,
    createOwner,
} from "../controllers/ownerController";

const router = express.Router();

router.get("/:cognitoId", getOwner);
router.post("/", createOwner);

export default router;
