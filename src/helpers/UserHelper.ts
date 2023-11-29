import { ObjectId, WithId } from "mongodb";
import { UserDocument } from "../interfaces/UserDocument";
import { MongoHelper } from "./MongoHelper";
import bcrypt from "bcrypt";

export class UserHelper extends MongoHelper {
    private usersCollection: string = "users";

    constructor() {
        super();
    }

    async initialize(): Promise<void> {
        console.log('User Helper initialized');
    }

    private async hashPassword(password: string): Promise<string> {
        try {
            const saltRounds = 10;
            return bcrypt.hash(password, saltRounds);
        } catch(error) {
            console.error(`Error hashing password: ${error}`);
            throw error;
        }
    }

    async createUser(userData: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<ObjectId | undefined> {
        try {
            const hashedPassword = await this.hashPassword(userData.password);
            const newUser: Omit<UserDocument, '_id'> = {
                ...userData,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true
            };
            const result = await this.insertOne(this.usersCollection, newUser);
            return result?.insertedId;
        } catch(error) {
            console.error(`Error creating new user: ${error}`);
            throw error;
        }
    }

    async updateUserLastLogin(userId: ObjectId): Promise<void> {
        try {
            const lastLoginUpdate = { $set: { lastLogin: new Date() } };
            await this.updateOne(this.usersCollection, { _id: userId }, lastLoginUpdate);
        } catch(error) {
            console.error(`Error updating user last login: ${error}`);
            throw error;
        }
    }

    async deactivateUser(userId: ObjectId): Promise<void> {
        try {
            const deactivateUpdate = { $set: { isActive: false } };
            await this.updateOne(this.usersCollection, { _id: userId }, deactivateUpdate);
        } catch(error) {
            console.error(`Error deactivating user: ${error}`);
            throw error;
        }
    }

    async reactivateUser(userId: ObjectId): Promise<void> {
        try {
            const reactivateUpdate = { $set: { isActive: true } };
            await this.updateOne(this.usersCollection, { _id: userId }, reactivateUpdate);
        } catch(error) {
            console.error(`Error reactivating user: ${error}`);
            throw error;
        }
    }

    async findUserByUsername(username: string): Promise<WithId<UserDocument> | undefined> {
        try {
            return this.findOne(this.usersCollection, { username: username }) as Promise<WithId<UserDocument> | undefined>;
        } catch(error) {
            console.error(`Error finding user by username: ${error}`);
            throw error;
        }
    }

    async findUserByEmail(email: string): Promise<WithId<UserDocument> | undefined> {
        try {
            return this.findOne(this.usersCollection, { email: email }) as Promise<WithId<UserDocument> | undefined>;
        } catch(error) {
            console.error(`Error finding user by email: ${error}`);
            throw error;
        }
    }

    async deleteUser(userId: ObjectId): Promise<void> {
        try {
            await this.deleteOne(this.usersCollection, { _id: userId });
        } catch(error) {
            console.error(`Error deleting user: ${error}`);
            throw error;
        }
    }
    
}
