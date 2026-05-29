import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { createChildLogger } from "./logger.js";

const log = createChildLogger({ service: "realtime" });

export type ServerToClientEvents = {
  "message:created": (payload: {
    id: string;
    channelId: string;
    workspaceId: string;
    body: string;
    userId: string;
    parentId: string | null;
    createdAt: string;
    author: { id: string; name: string; avatarUrl?: string | null };
  }) => void;
  "message:edited": (payload: { id: string; body: string; updatedAt: string }) => void;
  "message:deleted": (payload: { id: string; channelId: string }) => void;
  "channel:created": (payload: { id: string; name: string | null; type: string }) => void;
  "user:presence": (payload: { userId: string; status: "online" | "offline" }) => void;
  "notification:new": (payload: {
    id: string;
    type: string;
    title: string;
    body: string | null;
    createdAt: string;
  }) => void;
  "page:created": (payload: {
    id: string;
    workspaceId: string;
    parentId: string | null;
    title: string;
    icon: string | null;
    slug: string;
    sortOrder: number;
  }) => void;
  "page:updated": (payload: {
    id: string;
    workspaceId: string;
    parentId: string | null;
    title: string;
    icon: string | null;
    slug: string;
    sortOrder: number;
  }) => void;
  "page:deleted": (payload: { id: string; workspaceId: string }) => void;
};

export type ClientToServerEvents = {
  "channel:join": (channelId: string) => void;
  "channel:leave": (channelId: string) => void;
  "workspace:join": (workspaceId: string) => void;
  "user:join": (userId: string) => void;
};

export function createSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    log.debug({ socketId: socket.id }, "Socket connected");

    socket.on("workspace:join", (workspaceId) => {
      void socket.join(`workspace:${workspaceId}`);
    });

    socket.on("channel:join", (channelId) => {
      void socket.join(`channel:${channelId}`);
    });

    socket.on("channel:leave", (channelId) => {
      void socket.leave(`channel:${channelId}`);
    });

    // Personal room for notifications and presence
    socket.on("user:join", (userId) => {
      void socket.join(`user:${userId}`);
      io.emit("user:presence", { userId, status: "online" });
    });

    socket.on("disconnect", (reason) => {
      log.debug({ socketId: socket.id, reason }, "Socket disconnected");
    });
  });

  return io;
}

export type SocketIOInstance = ReturnType<typeof createSocketServer>;
