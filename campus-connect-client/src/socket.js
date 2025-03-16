import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://localhost:8080/ws';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.isConnected = false;
    }

    connect(callback) {
        if (this.isConnected) {
            console.warn("WebSocket already connected.");
            return;
        }

        const socket = new SockJS(SOCKET_URL);
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (str) => {
                console.log(str);
            },
        });

        this.stompClient.onConnect = () => {
            console.log("Connected to WebSocket");
            this.isConnected = true;

            if (callback) callback();
        };

        this.stompClient.onDisconnect = () => {
            console.log("Disconnected from WebSocket");
            this.isConnected = false;
        };

        this.stompClient.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.stompClient.activate();
    }

    on(topic, callback) {
        if (!this.stompClient || !this.isConnected) {
            console.warn("WebSocket is not connected yet.");
            return;
        }

        this.stompClient.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });
    }

    emit(destination, message) {
        if (!this.stompClient || !this.isConnected) {
            console.warn("Cannot send message, WebSocket is not connected.");
            return;
        }

        this.stompClient.publish({
            destination: destination,
            body: JSON.stringify(message),
        });
    }
}

const socket = new WebSocketService();
export default socket;