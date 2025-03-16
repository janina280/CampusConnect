import {useState} from "react";
import socket from "../../socket";

const Test = () => {
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');

    const sendMessage = () => {
        console.log('Sending message:', name);
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
