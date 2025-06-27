import express from "express";
import {
    getOwner,
    createOwner,
    updateOwner,
} from "../controllers/ownerController";

const router = express.Router();

router.get("/:cognitoId", getOwner);
router.put("/:cognitoId", updateOwner);
router.post("/", createOwner);

export default router;
