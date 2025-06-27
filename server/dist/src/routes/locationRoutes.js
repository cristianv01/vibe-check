"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const locationController_1 = require("../controllers/locationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Public routes
router.get("/", locationController_1.getLocations);
router.get("/:id", locationController_1.getLocation);
// Protected routes (admin/owner only)
router.put("/:id/verify", (0, authMiddleware_1.authMiddleWare)(["admin", "owner"]), locationController_1.verifyLocation);
router.delete("/:id", (0, authMiddleware_1.authMiddleWare)(["admin"]), locationController_1.deleteLocation);
exports.default = router;
