import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { UserHelper } from "../helpers/UserHelper";
import { UtilityHelper } from "../helpers/UtilityHelper";
import { RoleHelper } from "../helpers/RoleHelper";

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const db_name = process.env.MONGO_DBNAME || 'ByteDock';

const client = new MongoClient(uri);

(async () => {
    await client.connect();
    const db = client.db(db_name);

    try {
        const roleHelper = new RoleHelper(client, db);

        let adminRole = await roleHelper.findRoleByName('admin');
        if (adminRole) throw new Error(`Admin role already exists.`);

        const adminRoleData = {
            name: 'admin',
            permissions: ['*'],
            isProtected: true
        };

        adminRole = await roleHelper.createRole(adminRoleData);
        if (!adminRole) throw new Error(`Error creating role.`);
        console.log(`Admin role created successfully with id: ${adminRole._id}`);
    } catch(error) {
        console.error(`Error creating admin role: ${error}`);
    } finally {
        try {
            const utilityHelper = new UtilityHelper();
            const userHelper = new UserHelper(client, db);
    
            const args = utilityHelper.parseArgs(process.argv);
    
            const adminUserData = {
                username: args['username'].toString() || 'admin',
                fullName: args['fullName'].toString() || 'Admin User',
                password: args['password'].toString() || 'default',
                email: args['email'].toString() || 'admin@example.com',
                roles: ['admin'],
                isProtected: typeof args['isProtected'] === 'boolean' ? args['isProtected'] : false
            };
    
            const resultUserEmail = await userHelper.findUserByEmail(adminUserData.email);
            if (resultUserEmail) throw new Error(`User with email already exists.`);
    
            const resultUserName = await userHelper.findUserByUsername(adminUserData.username);
            if (resultUserName) throw new Error(`User with username already exists.`);
    
            const adminUser = await userHelper.createUser(adminUserData);
            if (!adminUser) throw new Error(`Error creating admin user.`);
            console.log(`Admin user created successfully with id: ${adminUser.toString()}`);
        } catch(error) {
            console.error(`Error creating admin user: ${error}`);
        } finally {
            await client.close();
        }
    }
});
