"use server"

import Message from "../models/message.models";
import { connectToDB } from "../mongoose"

interface CreateMessageProps{
    userId:string;
    fileId:string;
    text:string
}
export async function createMessage({userId,fileId,text}:CreateMessageProps){
    await connectToDB();

    try {

        const message = new Message({
            userId,
            fileId,
            text,
            isUserMessage:true
        })

        await message.save();
        
    } catch (error:any) {
        console.log("error occured while creating message",error)
        throw error
    }
}