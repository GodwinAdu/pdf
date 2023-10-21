import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    id: String,
    email: {
        type: String,
        unique: true,
    },
    files: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'File',
        },
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
    ],
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    stripePriceId: String,
    stripeCurrentPeriodEnd: Date,
});


const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;