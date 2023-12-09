import { Db, MongoClient, ObjectId, WithId } from "mongodb";
import { MongoHelper } from "./MongoHelper";
import { RoleDocument } from "../interfaces/RoleDocument";
import { UserDocument } from "../interfaces/UserDocument";

export class RoleHelper extends MongoHelper {
    private rolesCollection = 'roles';
    private usersCollection = 'users';

    constructor(client?: MongoClient, db?: Db) {
        super(client, db);
    }

    async initialize(): Promise<void> {
        console.log('Role Helper intialized');
    }

    async createRole(roleData: Omit<RoleDocument, '_id'>): Promise<WithId<RoleDocument> | undefined> {
        try {
            const newRole = {
                ...roleData,
                createdAt: new Date(),
                updatedAt: new Date(),
                isProtected: false,
            };
            const result = await this.insertOne(this.rolesCollection, newRole);
            return result as WithId<RoleDocument> | undefined;
        } catch(error) {
            console.error(`Error creating new role: ${error}`);
            throw error;
        }
    }

    async findRoleByName(name: string): Promise<WithId<RoleDocument> | undefined> {
        try {
            return this.findOne(this.rolesCollection, { name }) as Promise<WithId<RoleDocument> | undefined>;
        } catch(error) {
            console.error(`Error finding role by name: ${error}`);
            throw error;
        }
    }

    async findRoleById(roleId: ObjectId): Promise<WithId<RoleDocument> | undefined> {
        try {
            return this.findOne(this.rolesCollection, { _id: roleId }) as Promise<WithId<RoleDocument> | undefined>;
        } catch(error) {
            console.error(`Error finding role by id: ${error}`);
            throw error;
        }
    }

    async updateRole(roleId: ObjectId, updateData: Partial<Omit<RoleDocument, '_id' | 'isProtected'>>): Promise<void> {
        try {
            const role = await this.findRoleById(roleId);
            if (!role) throw new Error('Role not found');
            if (role.isProtected) throw new Error('This role is protected and cannot be modified');
            await this.updateOne(this.rolesCollection, { _id: roleId }, { $set: updateData });
        } catch(error) {
            console.error(`Error updating the role: ${error}`);
            throw error;
        }
    }

    async deleteRole(roleId: ObjectId): Promise<void> {
        try {
            const role = await this.findRoleById(roleId);
            if (!role) throw new Error('Role not found');
            if (role.isProtected) throw new Error('This role is protected and cannot be deleted');
            await this.deleteOne(this.rolesCollection, { _id: roleId });
        } catch(error) {
            console.error(`Error deleting role: ${error}`);
            throw error;
        }
    }

    async addPermissionToRole(roleId: ObjectId, permission: string): Promise<void> {
        try {
            const update = { $addToSet: { permissions: permission } };
            await this.updateOne(this.rolesCollection, { _id: roleId }, update);
        } catch(error) {
            console.error(`Error to add permission to role: ${error}`);
            throw error;
        }
    }

    async removePermissionFromRole(roleId: ObjectId, permission: string): Promise<void> {
        try {
            const update = { $pull: { permissions: permission } };
            await this.updateOne(this.rolesCollection, { _id: roleId }, update);
        } catch(error) {
            console.error(`Error removing permission from role: ${error}`);
            throw error;
        }
    }

    async assignRoleToUser(userId: ObjectId, roleName: string): Promise<void> {
        try {
            const update = { $addToSet: { roles: roleName } };
            await this.updateOne(this.rolesCollection, { _id: userId }, update);
        } catch(error) {
            console.error(`Error adding role to user: ${error}`);
            throw error;
        }
    }

    async bulkAssignRoleToUser(userId: ObjectId, roleNames: string[]): Promise<void> {
        try {
            await this.updateOne(this.usersCollection, { _id: userId }, { $addToSet: { roles: { $each: roleNames } } });
        } catch(error) {
            console.error(`Error bulk adding role to user: ${error}`);
            throw error;
        }
    }

    async revokeRoleFromUser(userId: ObjectId, roleName: string): Promise<void> {
        try {
            const update = { $pull: { roles: roleName } };
            await this.updateOne(this.usersCollection, { _id: userId }, update);
        } catch(error) {
            console.error(`Error removing role from user: ${error}`);
            throw error;
        }
    }

    async bulkRevokeRolesFromUser(userId: ObjectId, roleNames: string[]): Promise<void> {
        try {
            await this.updateOne(this.usersCollection, { _id: userId }, { $pullAll: { roles: roleNames } });
        } catch(error) {
            console.error(`Error bulk removing role to user: ${error}`);
            throw error;
        }
    }

    async checkUserRole(userId: ObjectId, roleName: string): Promise<boolean> {
        try {
            const user = await this.findOne(this.usersCollection, { _id: userId });
            if (!user) return false;

            const roles = await this.find(this.rolesCollection, { _id: { $in: user.roles } });
            if (!roles) return false;
            return roles.some(role => role.name === roleName);
        } catch(error) {
            console.error(`Error checking user role: ${error}`);
            throw error;
        }
    }

    async listUsersWithRole(roleName: string): Promise<WithId<UserDocument>[] | undefined> {
        try {
            return this.find(this.usersCollection, { roles: roleName }) as Promise<WithId<UserDocument>[] | undefined>;
        } catch(error) {
            console.error(`Error retrieving users: ${error}`);
            throw error;
        }
    }

    private async findUserRoles(userId: ObjectId): Promise<WithId<RoleDocument>[] | undefined> {
        try {
            const user = await this.findOne(this.usersCollection, { _id: userId });
            if (!user || !user.roles) return [];
            return this.find(this.rolesCollection, { _id: { $in: user.roles } }) as Promise<WithId<RoleDocument>[] | undefined>;
        } catch(error) {
            console.error(`Error finding user roles: ${error}`);
            throw error;
        }
    }

    async checkUserPermission(userId: ObjectId, permission: string): Promise<boolean> {
        try {
            const userRoles = await this.findUserRoles(userId);
            if (!userRoles) return false;
            for (let role of userRoles) {
                if (role.permissions.includes(permission) || role.permissions.includes('*')) return true;
            }
            return false;
        } catch(error) {
            console.error(`Error checking user permission: ${error}`);
            throw error;
        }
    }

    async updateRolePermissions(roleId: ObjectId, permissions: string[]): Promise<void> {
        try {
            await this.updateOne(this.rolesCollection, { _id: roleId }, { $set: { permissions } });
        } catch(error) {
            console.error(`Error updating role permissions: ${error}`);
            throw error;
        }
    }

    async listAllRoles(): Promise<WithId<RoleDocument>[] | undefined> {
        try {
            const roles = this.find(this.rolesCollection, {}) as Promise<WithId<RoleDocument>[] | undefined>;
            if (!roles) return [];
            return roles;
        } catch(error) {
            console.error(`Error listing roles: ${error}`);
            throw error;
        }
    }

    async isRoleProtected(roleId: ObjectId): Promise<boolean> {
        try {
            const role = await this.findRoleById(roleId);
            return role ? role.isProtected : false;
        } catch(error) {
            console.error(`Error checking role for protection: ${error}`);
            throw error;
        }
    }

}