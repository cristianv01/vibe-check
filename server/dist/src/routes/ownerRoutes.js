"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ownerController_1 = require("../controllers/ownerController");
const router = express_1.default.Router();
router.get("/:cognitoId", ownerController_1.getOwner);
router.post("/", ownerController_1.createOwner);
exports.default = router;
