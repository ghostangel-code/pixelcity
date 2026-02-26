import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

export interface WebSocketMessage {
  type: string;
  timestamp: number;
  agentId: string;
  [key: string]: unknown;
}

interface ClientConnection {
  ws: WebSocket;
  agentId: string | null;
  lastPing: number;
}

@Injectable()
@WebSocketGateway({
  port: 3002,
  path: '/ws',
})
export class WebSocketService
  implements OnModuleInit, OnModuleDestroy, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private connections: Map<WebSocket, ClientConnection> = new Map();
  private agentConnections: Map<string, Set<WebSocket>> = new Map();
  private messageQueue: Map<string, WebSocketMessage[]> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  onModuleInit() {
    this.pingInterval = setInterval(() => {
      this.handlePingCheck();
    }, 30000);
    console.log('WebSocket Gateway initialized on port 3002');
  }

  onModuleDestroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.connections.forEach((_, ws) => {
      ws.close();
    });
    this.connections.clear();
    this.agentConnections.clear();
  }

  handleConnection(ws: WebSocket) {
    this.connections.set(ws, {
      ws,
      agentId: null,
      lastPing: Date.now(),
    });
    console.log(`Client connected. Total connections: ${this.connections.size}`);
  }

  handleDisconnect(ws: WebSocket) {
    const connection = this.connections.get(ws);
    if (connection?.agentId) {
      const agentSockets = this.agentConnections.get(connection.agentId);
      if (agentSockets) {
        agentSockets.delete(ws);
        if (agentSockets.size === 0) {
          this.agentConnections.delete(connection.agentId);
        }
      }
    }
    this.connections.delete(ws);
    console.log(`Client disconnected. Total connections: ${this.connections.size}`);
  }

  @SubscribeMessage('register')
  handleRegister(ws: WebSocket, data: { agentId: string }): void {
    const connection = this.connections.get(ws);
    if (!connection) return;

    connection.agentId = data.agentId;
    connection.lastPing = Date.now();

    if (!this.agentConnections.has(data.agentId)) {
      this.agentConnections.set(data.agentId, new Set());
    }
    this.agentConnections.get(data.agentId)!.add(ws);

    this.sendQueuedMessages(data.agentId, ws);

    this.send(ws, {
      type: 'registered',
      timestamp: Date.now(),
      agentId: data.agentId,
    });
  }

  @SubscribeMessage('ping')
  handlePing(ws: WebSocket): void {
    const connection = this.connections.get(ws);
    if (connection) {
      connection.lastPing = Date.now();
      this.send(ws, { type: 'pong', timestamp: Date.now(), agentId: connection.agentId || '' });
    }
  }

  send(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  sendToAgent(agentId: string, message: WebSocketMessage): void {
    const sockets = this.agentConnections.get(agentId);
    if (sockets && sockets.size > 0) {
      sockets.forEach((ws) => {
        this.send(ws, message);
      });
    } else {
      this.queueMessage(agentId, message);
    }
  }

  broadcast(message: WebSocketMessage): void {
    this.connections.forEach((_, ws) => {
      this.send(ws, message);
    });
  }

  broadcastToRoom(roomId: string, message: WebSocketMessage): void {
    this.connections.forEach((connection, ws) => {
      this.send(ws, { ...message, roomId });
    });
  }

  private queueMessage(agentId: string, message: WebSocketMessage): void {
    if (!this.messageQueue.has(agentId)) {
      this.messageQueue.set(agentId, []);
    }
    const queue = this.messageQueue.get(agentId)!;
    queue.push(message);
    if (queue.length > 100) {
      queue.shift();
    }
  }

  private sendQueuedMessages(agentId: string, ws: WebSocket): void {
    const queue = this.messageQueue.get(agentId);
    if (queue) {
      queue.forEach((message) => {
        this.send(ws, message);
      });
      this.messageQueue.delete(agentId);
    }
  }

  private handlePingCheck(): void {
    const now = Date.now();
    const timeout = 60000;

    this.connections.forEach((connection, ws) => {
      if (now - connection.lastPing > timeout) {
        ws.close();
      }
    });
  }

  getConnectedAgents(): string[] {
    return Array.from(this.agentConnections.keys());
  }

  getConnectionCount(): number {
    return this.connections.size;
  }
}
