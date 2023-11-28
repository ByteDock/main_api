import express, { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';
import { BaseHelper } from './interfaces/BaseHelper';
import { Path } from './interfaces/Path';

dotenv.config();

const app = express();
const port: number = process.env.PORT !== null ? parseInt(process.env.PORT as string) : 3000;
const host = process.env.HOST || 'localhost';

const s = http.createServer(app);

const server = s.listen(port, host, () => {
    console.log(`API running on http://${host}:${port}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Error: Port ${port} is already in use at host ${host}, please use another.`);
        process.exit(1);
    } else {
        console.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
});

export default server;

console.log('Initializing helpers...');
const helpers: BaseHelper[] = [];
const helpersDir = path.join(__dirname, 'helpers');
fs.readdirSync(helpersDir).forEach(file => {
    if (path.extname(file) === '.ts') {
        const { [path.basename(file, '.ts')]: HelperClass } = require(path.join(helpersDir, file));
        const helperInstance: BaseHelper = new HelperClass();
        helperInstance.initialize();
        helpers.push(helperInstance);
    }
});

function logRoutes(router: Router, routePrefix = '') {
    router.stack.forEach((layer) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods)
                .filter(method => layer.route.methods[method])
                .map(method => method.toUpperCase()).join(', ');
  
            console.log(`${methods} ${routePrefix}${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle.stack) {
            const nestedRoutePrefix = routePrefix + layer.regexp.source.replace(/^\/\^\\/, '').replace(/\\\//g, '/');
            logRoutes(layer.handle, nestedRoutePrefix);
        }
    });
}
  
function loadRoutes(dir: string, routePrefix = '') {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
        const fullPath = path.join(dir, file.name);
  
        if (file.isDirectory()) {
            loadRoutes(fullPath, `${routePrefix}/${file.name}`);
        } else if (file.isFile() && path.extname(file.name) === '.ts' && file.name !== 'index.ts') {
            const route = require(fullPath) as Path;
            if (route.setupHelpers) route.setupHelpers(helpers);
            const routerPath = `${routePrefix}/${path.basename(file.name, '.ts')}`;
            app.use(routerPath, route.default);
            logRoutes(route.default, routerPath);
        } else if (file.isFile() && file.name === 'index.ts') {
            const route = require(fullPath) as Path;
            if (route.setupHelpers) route.setupHelpers(helpers);
            app.use(routePrefix === '' ? '/' : routePrefix, route.default);
            logRoutes(route.default, routePrefix);
        }
    });
}

console.log('Loading routes...');
loadRoutes(path.join(__dirname, 'paths'));