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
exports.updateUser = exports.removeFavoritePost = exports.addFavoritePost = exports.createUser = exports.getUser = void 0;
const client_1 = require("@prisma/client");
const Prisma = new client_1.PrismaClient();
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const user = yield Prisma.user.findUnique({
            where: { cognitoId },
            include: {
                favoriteLocations: true,
                favoritePosts: {
                    include: {
                        post: true
                    }
                }
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
const addFavoritePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId, postId } = req.params;
        // Find the user
        const user = yield Prisma.user.findUnique({
            where: { cognitoId },
            include: {
                favoritePosts: {
                    include: {
                        post: true
                    }
                }
            }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if post exists
        const post = yield Prisma.post.findUnique({
            where: { id: Number(postId) }
        });
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        // Check if already favorited
        const existingFavorite = yield Prisma.postFavorite.findUnique({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: Number(postId)
                }
            }
        });
        if (existingFavorite) {
            res.status(400).json({ message: "Post already favorited" });
            return;
        }
        // Add to favorites
        yield Prisma.postFavorite.create({
            data: {
                userId: user.id,
                postId: Number(postId)
            }
        });
        // Return updated user with favorites
        const updatedUser = yield Prisma.user.findUnique({
            where: { cognitoId },
            include: {
                favoritePosts: {
                    include: {
                        post: true
                    }
                }
            }
        });
        res.status(201).json(updatedUser);
    }
    catch (err) {
        console.error("Error adding favorite post:", err);
        res.status(500).json({ message: `Error adding favorite post ${err.message}` });
    }
});
exports.addFavoritePost = addFavoritePost;
const removeFavoritePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId, postId } = req.params;
        // Find the user
        const user = yield Prisma.user.findUnique({
            where: { cognitoId }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Remove from favorites
        yield Prisma.postFavorite.delete({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: Number(postId)
                }
            }
        });
        // Return updated user with favorites
        const updatedUser = yield Prisma.user.findUnique({
            where: { cognitoId },
            include: {
                favoritePosts: {
                    include: {
                        post: true
                    }
                }
            }
        });
        res.json(updatedUser);
    }
    catch (err) {
        console.error("Error removing favorite post:", err);
        res.status(500).json({ message: `Error removing favorite post ${err.message}` });
    }
});
exports.removeFavoritePost = removeFavoritePost;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //We are sending it in the body, so it comes from the body
        const { cognitoId } = req.params;
        const { username, email, phoneNumber } = req.body;
        const user = yield Prisma.user.update({
            where: { cognitoId },
            data: {
                username,
                email,
                phoneNumber
            }
        });
        res.json(exports.updateUser);
        res.status(201).json(user);
    }
    catch (err) {
        res.status(500).json({ message: `Error creating user ${err.message}` });
    }
});
exports.updateUser = updateUser;
