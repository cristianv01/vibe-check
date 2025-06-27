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


export const updateOwner = async(req: Request, res: Response): Promise<void> =>{
    try{
        //We are sending it in the body, so it comes from the body
        const {cognitoId} = req.params;
        const {username, email, phoneNumber} = req.body;
        const user = await Prisma.owner.update({
            where: {cognitoId},
            data: {
                username,
                email,
                phoneNumber
            }
        })
        res.json(updateOwner);
        res.status(201).json(user);
    }catch(err:any){
        res.status(500).json({message: `Error creating user ${err.message}`})
    }
}

