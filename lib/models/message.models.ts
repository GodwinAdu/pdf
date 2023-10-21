import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    id: String,
    text: String,
    isUserMessage: Boolean,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    },
});


const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;