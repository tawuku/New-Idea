import { type Socket, io } from "socket.io-client";

type ServerToClientEvents = {
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

type ClientToServerEvents = {
  "channel:join": (channelId: string) => void;
  "channel:leave": (channelId: string) => void;
  "workspace:join": (workspaceId: string) => void;
  "user:join": (userId: string) => void;
};

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io(process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001", {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}
