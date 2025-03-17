import {useState} from "react";
import {useWebSocket} from "../../contexts/WebSocketContext";

const Test = () => {
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');

    const {isConnected, socket} = useWebSocket();

    const sendMessage = () => {
        console.log('Sending message:', name);
        if(!isConnected) return;
        socket.emit(
            '/app/hello',
            {name: name},
        );
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
            <p>{message}</p>
        </div>
    );
};

export default Test;
