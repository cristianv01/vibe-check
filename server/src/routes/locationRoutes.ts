import express from "express";
import {
    getLocations,
    getLocation,
    verifyLocation,
    deleteLocation
} from "../controllers/locationController";
import { authMiddleWare } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.get("/", getLocations);
router.get("/:id", getLocation);

// Protected routes (admin/owner only)
router.put("/:id/verify", authMiddleWare(["admin", "owner"]), verifyLocation);
router.delete("/:id", authMiddleWare(["admin"]), deleteLocation);

export default router;
