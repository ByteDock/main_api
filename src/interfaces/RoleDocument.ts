import { Document } from "mongodb";

export interface RoleDocument extends Document {
    name: string;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
    isProtected: boolean;
}