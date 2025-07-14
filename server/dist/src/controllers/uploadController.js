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
exports.generatePresignedUrl = void 0;
const s3Service_1 = require("../services/s3Service");
const generatePresignedUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileType, fileName, folder } = req.body;
        if (!fileType) {
            res.status(400).json({ message: 'fileType is required' });
            return;
        }
        const result = yield s3Service_1.S3Service.generatePresignedUrl({
            fileType,
            fileName,
            folder: folder || 'posts'
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error generating upload URL:', error);
        res.status(500).json({ message: 'Error generating upload URL', error: error.message });
    }
});
exports.generatePresignedUrl = generatePresignedUrl;
