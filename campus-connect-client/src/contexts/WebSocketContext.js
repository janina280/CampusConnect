import React, {createContext, useContext, useEffect, useState} from "react";
import socket from "../socket";

const WebSocketContext = createContext();

const WebSocketProvider = ({children}) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socket.connect().then(() => {
            setIsConnected(true);
        });

        return () => socket.disconnect();
    }, []);

    return (
        <WebSocketContext.Provider value={{isConnected, socket}}>
            {children}
        </WebSocketContext.Provider>
    );
};

const useWebSocket = () => {
    return useContext(WebSocketContext)
};

export {WebSocketProvider, useWebSocket};