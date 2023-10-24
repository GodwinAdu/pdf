import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    text: String,
    isUserMessage: Boolean,
    updatedAt: Date,
    userId:String,
    fileId: String ,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;