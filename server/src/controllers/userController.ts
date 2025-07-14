import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient();

export const getUser = async(req: Request, res:Response): Promise<void> => {
    try{
        const {cognitoId} = req.params;
        const user = await Prisma.user.findUnique({
            where: {cognitoId},
            include: {
                favoriteLocations: true,
                favoritePosts: {
                    include: {
                        post: true
                    }
                }
            }
        })

        if (user){
            res.json(user)
        }else{
            res.status(404).json({message: "User not found"})
        }
    }catch(err:any){
        res.status(500).json({message: "Error fetching user", error: err.message})
    }
}

export const createUser = async(req: Request, res: Response): Promise<void> =>{
    try{
        //We are sending it in the body, so it comes from the body
        const {cognitoId, username, email, profilePictureUrl} = req.body;

        const user = await Prisma.user.create({
            data: {
                cognitoId,
                username,
                email,
                profilePictureUrl: null
            }
        })

        res.status(201).json(user);
    }catch(err:any){
        res.status(500).json({message: `Error creating user ${err.message}`})
    }
}

export const addFavoritePost = async(req: Request, res: Response): Promise<void> =>{
    try{
        const {cognitoId, postId} = req.params
        
        // Find the user
        const user = await Prisma.user.findUnique({
            where: {cognitoId},
            include: {
                favoritePosts: {
                    include: {
                        post: true
                    }
                }
            }
        })

        if (!user) {
            res.status(404).json({message: "User not found"})
            return
        }

        // Check if post exists
        const post = await Prisma.post.findUnique({
            where: {id: Number(postId)}
        })

        if (!post) {
            res.status(404).json({message: "Post not found"})
            return
        }

        // Check if already favorited
        const existingFavorite = await Prisma.postFavorite.findUnique({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: Number(postId)
                }
            }
        })

        if (existingFavorite) {
            res.status(400).json({message: "Post already favorited"})
            return
        }

        // Add to favorites
        await Prisma.postFavorite.create({
            data: {
                userId: user.id,
                postId: Number(postId)
            }
        })

        // Return updated user with favorites
        const updatedUser = await Prisma.user.findUnique({
            where: {cognitoId},
            include: {
                favoritePosts: {
                    include: {
                        post: true
                    }
                }
            }
        })

        res.status(201).json(updatedUser)
    }catch(err:any){
        console.error("Error adding favorite post:", err)
        res.status(500).json({message:`Error adding favorite post ${err.message}`})
    }
}

export const removeFavoritePost = async(req: Request, res: Response): Promise<void> =>{
    try{
        const {cognitoId, postId} = req.params
        
        // Find the user
        const user = await Prisma.user.findUnique({
            where: {cognitoId}
        })

        if (!user) {
            res.status(404).json({message: "User not found"})
            return
        }

        // Remove from favorites
        await Prisma.postFavorite.delete({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: Number(postId)
                }
            }
        })

        // Return updated user with favorites
        const updatedUser = await Prisma.user.findUnique({
            where: {cognitoId},
            include: {
                favoritePosts: {
                    include: {
                        post: true
                    }
                }
            }
        })

        res.json(updatedUser)
    }catch(err:any){
        console.error("Error removing favorite post:", err)
        res.status(500).json({message:`Error removing favorite post ${err.message}`})
    }
}
export const updateUser = async(req: Request, res: Response): Promise<void> =>{
    try{
        //We are sending it in the body, so it comes from the body
        const {cognitoId} = req.params;
        const {username, email, phoneNumber} = req.body;
        const user = await Prisma.user.update({
            where: {cognitoId},
            data: {
                username,
                email,
                phoneNumber
            }
        })
        res.json(updateUser);
        res.status(201).json(user);
    }catch(err:any){
        res.status(500).json({message: `Error creating user ${err.message}`})
    }
}

