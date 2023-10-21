"use server"

import File from "../models/file.models";
import User from "../models/user.models";
import { connectToDB } from "../mongoose"

interface createFileProps {
    key: string;
    name: string;
    userId: string;
    url: string;
    uploadStatus: string;
}

export async function createFile(data: createFileProps) {
    await connectToDB();

    const { key, name, userId, url, uploadStatus } = data

    try {
        const existingFile = await File.findOne({ key });

        if (existingFile) {
            throw new Error("File already exist is DB")
        }
        const file = new File({
            key,
            name,
            userId,
            url,
            uploadStatus
        })

        await file.save();
        return file;

    } catch (error: any) {
        console.log("Unable to create file to DB", error)
        return;
    }
}


interface Props {
    userId: string,
}
export async function fetchUserFiles({ userId }: Props) {
    await connectToDB();

    try {
        console.log(userId)
        const files = await File.find({ userId })
        if (!files) {
            console.log("no files exist ");
            
        }
        return files

    } catch (error: any) {
        console.error("Error fetching files from the database:", error);
    throw new Error("Unable to fetch user files from the database");
    }
}

interface FetchFileKeyProps {
    key: string;
    userId: string
}

export async function fetchFileByKey({ key, userId }: FetchFileKeyProps) {
    await connectToDB();
    try {
        const file = await File.findOne({ key, userId })
        if (!file) {
            throw new Error("File doesnt exist")
        }
        return file;
    } catch (error: any) {
        console.log("cannot fetch file by key", error)
    }
}

interface fetchPdfProps{
    id:string;
    userId:string
}

export async function fetchPDF({ id, userId }:fetchPdfProps) {
    await connectToDB();
    try {
        console.log(id, userId)
        const getFile = await File.findOne({
            _id: id,
            userId
        });

        if (!getFile) {
            throw new Error("File not found or not authorized.");
        }

        return getFile;

    } catch (error: any) {
        console.log("Couldnt fetch file from DB",error);
        throw error;
    }
}



interface deleteFileProps {
    id: string;
    userId: string
}



export async function deleteFile({ userId, id }: deleteFileProps) {
    await connectToDB();

    try {

        // Find the file by both id and userId and delete it.
        const deletedFile = await File.findOneAndDelete({ _id: id, userId });

        if (!deletedFile) {
            throw new Error("File not found or not authorized for deletion.");
        }

        return deletedFile; // Return the deleted file or a success message.

    } catch (error: any) {
        console.error("Error while deleting the file:", error);
        throw error; // Rethrow the error or handle it as needed.
    }
}