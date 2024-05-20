import 	React, { useRef, useState, useEffect  } from 'react';

const socketUrl = "ws://localhost:8080/wheelSocket"
let ws = new WebSocket(socketUrl);

const Wheel = () => {
	const nameInputRef = useRef(null);
	const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
			if (data.action === 'nameUpdated') {
				setLobby(prevLobby => [...prevLobby, data.name]);
				setNotifications(prev => [...prev, data.message]);
			} else if (data.action === 'nameDisconnected') {
                setLobby(prevLobby => prevLobby.filter(name => name !== data.name));
				setNotifications(prev => [...prev, data.message]);
			}
			
        };
    }, []);

	const [lobby, setLobby] = useState([]);

	const addName = () => {
        const name = nameInputRef.current.value;
        ws.send(JSON.stringify({
            action: 'updateName',
            name: name
        }));
    };

    return (
        <div>
            <h1>Let's Choose a Restaurant!</h1>
            <div>
                <h3>Name:</h3>
                <input ref={nameInputRef}></input><br />
                <button onClick={addName}>Join the Wheel!</button>
            </div>
			<h2>Lobby Notifications:</h2>
            <div>
                {notifications.map((notification, index) => (
                    <div key={index}>{notification}</div>
                ))}
            </div>
            <h2>People in lobby:</h2>
            <div>
                {lobby.map((name, index) => (
                    <div key={index}>{name}</div>
                ))}
            </div>
        </div>
    );
}

export default Wheel