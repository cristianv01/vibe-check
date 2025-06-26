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
exports.createOwner = exports.getOwner = void 0;
const client_1 = require("@prisma/client");
const Prisma = new client_1.PrismaClient();
const getOwner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const owner = yield Prisma.owner.findUnique({
            where: { cognitoId },
            include: {
                claimedLocations: true,
            }
        });
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching owner", error: err.message });
    }
});
exports.getOwner = getOwner;
const createOwner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId, username, email } = req.body;
        const owner = yield Prisma.owner.create({
            data: {
                cognitoId,
                username,
                email,
                profilePictureUrl: null
            }
        });
        res.status(201).json(owner);
    }
    catch (err) {
        res.status(500).json({ message: `Error creating owner ${err.message}` });
    }
});
exports.createOwner = createOwner;
