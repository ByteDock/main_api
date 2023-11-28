import * as WebSocket from "websocket";
import { z } from "zod";

export interface SocketModule {
    EventName: string;
    EventSchema: z.ZodTypeAny;
    EventHandler: (ws: WebSocket.connection, args: z.ZodTypeAny) => void;
}