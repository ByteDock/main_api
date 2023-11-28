import { BaseHelper } from "../interfaces/BaseHelper";
import * as WebSocket from "websocket";
import { z, ZodTypeAny } from "zod";
import path from "path";
import fs from "fs";
import { SocketModule } from "../interfaces/SocketModule";
import server from "..";

interface SchemaIndex {
    [key: string]: ZodTypeAny;
}

let schemas: SchemaIndex = {};

let methods: Map<string, (ws: WebSocket.connection, args: ZodTypeAny) => void> = new Map();

fs.readdirSync(path.join(__dirname, '..', 'sockets')).forEach(file => {
    import(path.join(__dirname, '..', 'sockets', file)).then((socketModule: SocketModule) => {
        schemas[socketModule.EventName] = socketModule.EventSchema;
        methods.set(socketModule.EventName, socketModule.EventHandler);
    });
});

export declare namespace _Socket {
    type Listener = <T extends keyof Events>(
        event: T, 
        callback: (ws: WebSocket.connection, args: Events[T]) => void
    ) => void;

    type Emitter = <T extends keyof Events>(
        event: T,
        args: Events[T]
    ) => void;

    type Events = {
        [K in keyof typeof schemas]: z.infer<(typeof schemas)[K]>;
    };
}

export class SocketHelper implements BaseHelper {
    private server: WebSocket.server;

    private clients: WebSocket.connection[] = [];
    private listeners: Map<keyof _Socket.Events, ((ws: WebSocket.connection, args: ZodTypeAny) => void)[]> = new Map();

    constructor() {
        this.server = new WebSocket.server({httpServer: server});
        this.server.on('connect', (ws: WebSocket.connection) => {
            console.log(`${new Date()} Peer ${ws.remoteAddress} connected`);
            ws.on('message', (msg) => this.handleMessage(ws, msg));
            ws.on('close', (rC, d) => console.log(`${new Date()} Peer ${ws.remoteAddress} disconnected.`));
            this.clients.push(ws);
        });
    }

    initialize(): void {
        methods.forEach( (m, i) => this.addListener(i, m));
        console.log('Socket Helper initialized');
    }

    private handleMessage(ws: WebSocket.connection, msg: WebSocket.Message) {
        try {
            if (msg.type !== 'utf8') return;
            const data = JSON.parse(msg.utf8Data);
            const event = data.event as keyof _Socket.Events;
            const payload = data.payload;
            const schema: ZodTypeAny = schemas[event];

            if (schema) schema.parse(payload);

            const listener = this.listeners.get(event);
            if (!listener) return;
            listener.forEach((l) => l(ws, payload));
        } catch(error) {
            console.error(`Failed to handle socket event: ${error}`);
            throw error;
        }
    }

    emit: _Socket.Emitter = (ev, ...args) => {
        const msg = JSON.stringify({ ev, payload: args });
        this.clients.forEach((c) => c.sendUTF(msg));
    };

    addListener: _Socket.Listener = (ev, callback) => {
        if (!this.listeners.has(ev)) this.listeners.set(ev, []);
        this.listeners.get(ev)?.push(callback);
    };
    
}