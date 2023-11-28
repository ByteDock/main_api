import * as WebSocket from "websocket";
import { z } from "zod";

const EventName = "testEvent";

const EventSchema = z.object({
    message: z.string(),
});

type Event = z.infer<typeof EventSchema>;

const EventHandler = (ws: WebSocket.connection, args: Event) => {
    console.log(`Message received: ${args.message}`);
};

export {
    EventName,
    EventSchema,
    EventHandler
};