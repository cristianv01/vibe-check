import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient();


export const getOwner = async(req: Request, res: Response): Promise<void> =>{
    try{
        const {cognitoId} = req.params;
        const owner = await Prisma.owner.findUnique({
            where: {cognitoId},
            include: {
                claimedLocations: true,
            }
        })
    }catch(err:any){
        res.status(500).json({message: "Error fetching owner", error: err.message})
    }
}


export const createOwner = async(req: Request, res: Response): Promise<void> =>{
    try{
        const {cognitoId, username, email} = req.body;
        const owner = await Prisma.owner.create({
            data: {
                cognitoId,
                username,
                email,
                profilePictureUrl: null
            }
        })

        res.status(201).json(owner);
    }catch(err:any){
        res.status(500).json({message: `Error creating owner ${err.message}`})
    }
}