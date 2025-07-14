"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.get("/:cognitoId", userController_1.getUser);
router.put("/:cognitoId", userController_1.updateUser);
router.post("/:cognitoId/favorites/:postId", userController_1.addFavoritePost);
router.delete("/:cognitoId/favorites/:postId", userController_1.removeFavoritePost);
router.post("/", userController_1.createUser);
exports.default = router;
