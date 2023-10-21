import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
    userId:String,
    name: String,
    uploadStatus: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'FAILED', 'SUCCESS'],
        default: 'PENDING'
    },
    url: String,
    key: String,
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date,
    
});

const File = mongoose.models.File || mongoose.model("File", FileSchema);

export default File;
