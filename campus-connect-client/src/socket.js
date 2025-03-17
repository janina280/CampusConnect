import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://localhost:8080/ws";

class WebSocketService {
    constructor() {
        this.stompClient = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.stompClient?.connected) {
                console.warn("WebSocket already connected.");
                return resolve();
            }

            const socket = new SockJS(SOCKET_URL);
            this.stompClient = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
                debug: (str) => console.log(str),
            });

            this.stompClient.onConnect = () => {
                console.log("Connected to WebSocket");
                resolve(); // ✅ Rezolvă promisiunea doar după ce STOMP s-a conectat
            };

            this.stompClient.onDisconnect = () => {
                console.log("Disconnected from WebSocket");
            };

            this.stompClient.onStompError = (frame) => {
                console.error("Broker reported error: " + frame.headers["message"]);
                console.error("Additional details: " + frame.body);
                reject(new Error("STOMP connection error"));
            };

            this.stompClient.activate();
        });
    }

    async on(topic, callback) {
        if (!this.stompClient || !this.stompClient.connected) {
            console.warn("WebSocket is not connected yet. Waiting...");
            await this.connect();
        }

        this.stompClient.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });
    }

    async emit(destination, message) {
        if (!this.stompClient || !this.stompClient.connected) {
            console.warn("Cannot send message, WebSocket is not connected. Waiting...");
            await this.connect();
        }

        this.stompClient.publish({
            destination: destination,
            body: JSON.stringify(message),
        });
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
            console.log("WebSocket connection closed.");
        }
    }
}

const socket = new WebSocketService();
export default socket;