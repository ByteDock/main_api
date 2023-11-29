import { Document } from "mongodb";

export interface UserDocument extends Document {
    username: string;
    fullName: string;
    password: string; // This will be a hashed password
    email: string;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
    isActive: boolean;
    roles?: string[];
}