import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://localhost:8080/ws";
class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = {};
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
                resolve();
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

        const subscription = this.stompClient.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });

        this.subscriptions[topic] = subscription;
    }

    off(topic) {
        const subscription = this.subscriptions[topic];
        if (subscription) {
            subscription.unsubscribe();
            delete this.subscriptions[topic];
            console.log(`Unsubscribed from ${topic}`);
        } else {
            console.warn(`No active subscription for topic: ${topic}`);
        }
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
        Object.values(this.subscriptions).forEach((sub) => sub.unsubscribe());
        this.subscriptions = {};
        if (this.stompClient) {
            this.stompClient.deactivate();
            console.log("WebSocket connection closed.");
        }
    }
}

const socket = new WebSocketService();
export default socket;