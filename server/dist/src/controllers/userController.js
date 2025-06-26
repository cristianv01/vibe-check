"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getUser = void 0;
const client_1 = require("@prisma/client");
const Prisma = new client_1.PrismaClient();
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const user = yield Prisma.user.findUnique({
            where: { cognitoId },
            include: {
                favoriteLocations: true,
            }
        });
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching user", error: err.message });
    }
});
exports.getUser = getUser;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //We are sending it in the body, so it comes from the body
        const { cognitoId, username, email, profilePictureUrl } = req.body;
        const user = yield Prisma.user.create({
            data: {
                cognitoId,
                username,
                email,
                profilePictureUrl: null
            }
        });
        res.status(201).json(user);
    }
    catch (err) {
        res.status(500).json({ message: `Error creating user ${err.message}` });
    }
});
exports.createUser = createUser;
