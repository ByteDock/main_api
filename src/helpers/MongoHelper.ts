import { getDb, getMongoClient } from "..";
import { BaseHelper } from "../interfaces/BaseHelper";
import { MongoClient, Db, OptionalId, Document, Filter, FindOptions, UpdateFilter, WithoutId } from "mongodb";
import { UserDocument } from "../interfaces/UserDocument";

export class MongoHelper implements BaseHelper {
    private client: MongoClient;
    private db: Db | undefined;

    constructor(client?: MongoClient, db?: Db) {
        this.client = client || getMongoClient();
        this.db = db || getDb();
    }

    async initialize(): Promise<void> {
        console.log('Mongo Helper intialized');
    }

    async getCollectionList() {
        try {
            return this.db?.listCollections().toArray();
        } catch(error) {
            console.error(`Error fetching the list of collections: ${error}`);
            throw error;
        }
    }

    async insertOne(collectionName: string, document: OptionalId<Document>) {
        try {
            return this.db?.collection(collectionName).insertOne(document);
        } catch(error) {
            console.error(`Error inserting the collection: ${error}`);
            throw error;
        }
    }

    async insertMany(collectionName: string, documents: OptionalId<Document>[]) {
        try {
            return this.db?.collection(collectionName).insertMany(documents);
        } catch(error) {
            console.error(`Error inserting the collections: ${error}`);
            throw error;
        }
    }

    async findOne(collectionName: string, query: Filter<Document | UserDocument>) {
        try {
            return this.db?.collection<Document | UserDocument>(collectionName).findOne(query);
        } catch(error) {
            console.error(`Error finding the document: ${error}`);
            throw error;
        }
    }

    async find(collectionName: string, query: Filter<Document | UserDocument>, options?: FindOptions<Document | UserDocument>) {
        try {
            return this.db?.collection<Document | UserDocument>(collectionName).find(query, options).toArray();
        } catch(error) {
            console.error(`Error finding the documents: ${error}`);
            throw error;
        }
    }

    async updateOne(collectionName: string, query: Filter<Document>, update: UpdateFilter<Document> | Partial<Document>) {
        try {
            return this.db?.collection(collectionName).updateOne(query, update);
        } catch(error) {
            console.error(`Error updating the document: ${error}`);
            throw error;
        }
    }

    async deleteOne(collectionName: string, query: Filter<Document>) {
        try {
            return this.db?.collection(collectionName).deleteOne(query);
        } catch(error) {
            console.error(`Error deleting the document: ${error}`);
            throw error;
        }
    }

    async deleteMany(collectionName: string, query: Filter<Document>) {
        try {
            return this.db?.collection(collectionName).deleteMany(query);
        } catch(error) {
            console.error(`Error deleting the documents: ${error}`);
            throw error;
        }
    }

    async replaceOne(collectionName: string, query: Filter<Document>, replace: WithoutId<Document>) {
        try {
            return this.db?.collection(collectionName).replaceOne(query, replace);
        } catch(error) {
            console.error(`Error replacing the document: ${error}`);
            throw error;
        }
    }

    async countDocuments(collectionName: string, query: Filter<Document>) {
        try {
            return this.db?.collection(collectionName).countDocuments(query);
        } catch(error) {
            console.error(`Error counting documents: ${error}`);
            throw error;
        }
    }

}
