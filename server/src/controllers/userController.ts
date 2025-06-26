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