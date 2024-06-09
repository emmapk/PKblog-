import mongoose, { Schema, Document } from "mongoose";

// Define the IUser interface that extends mongoose.Document
interface IUser extends Document {
    name: string;
    address: string;
    description: string;
    email: string;
    isEmailConfirmed: boolean;
    verificationToken?: string;
    password: string;
    image: {
        data: Buffer;
        type: string;
    };
    createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
    id: {
        type: Schema.Types.ObjectId,
        auto: true 
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    isEmailConfirmed: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
