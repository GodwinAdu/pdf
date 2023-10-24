import { fetchFileById } from "@/lib/actions/file.actions";
import { createMessage } from "@/lib/actions/message.actions";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { currentUser } from "@clerk/nextjs";
import { NextRequest } from "next/server"


export const POST = async (req:NextRequest) => {


    const body = await req.json();

    const user = await currentUser();

    const userId = user?.id
    if(!userId){
        return new Response('Unauthorized',{status: 401});
    }

    const {fileId, message}= SendMessageValidator.parse(body);

    const file =  await fetchFileById({
        id:fileId,
        userId
    })

    if(!file)
    return new Response('Not found',{status:404})

    await createMessage({
        userId,
        fileId,
        text:message
    })

    //



}