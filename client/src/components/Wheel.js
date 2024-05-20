import 	React, { useRef, useState, useEffect  } from 'react';
import '../styles/Wheel.css';
import axios from 'axios';

const socketUrl = "ws://localhost:8080/api/lobbies/wheelSocket"
let ws = new WebSocket(socketUrl);

const Wheel = () => {
    
	const nameInputRef = useRef(null);
    const joinLobbyRef = useRef(null);
    const lobbyNameRef = useRef(null);
	const [notifications, setNotifications] = useState([]);
    const [joinedLobby, setJoinedLobby] = useState(false);
    const [joinedWheel, setJoinedWheel] = useState(false);
    const [lobby, setLobby] = useState([]);
    const [noNameError, setNoNameError] = useState('');
    const [existLobbyError, setExistLobbyError] = useState('');
    const [lastLobbyName, setLastLobbyName] = useState('');
    const [joinLobbyError, setJoinLobbyError] = useState('');

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

	const createLobby = async () => {
        if (lobbyNameRef.current.value.trim().length === 0) {
            setExistLobbyError('Must enter lobby name')
            return
        }
        let response = await axios.post('http://localhost:8080/api/lobbies', {
            name: lobbyNameRef.current.value
        })
        if (response.data.status === "success") {
            setJoinedLobby(true);
        } else {
            setExistLobbyError('Lobby name already used');
        }
        setLastLobbyName(lobbyNameRef.current.value.trim())
    }

    const joinLobby = async () => {
        if (joinLobbyRef.current.value.trim().length === 0) {
            setJoinLobbyError('Must enter lobby name')
            return
        }
        let response = await axios.get(`http://localhost:8080/api/lobbies?lobbyName=${joinLobbyRef.current.value}`)
        if (response.data.status === "success") {
            setLobby(response.data.users)
            setJoinedLobby(true)
        } else if (response.data.status === "closed") {
            setJoinLobbyError('Lobby has been closed')
        } else {
            setJoinLobbyError('Lobby name does not exist')
        }
        setLastLobbyName(joinLobbyRef.current.value)
    }

	const addName = async () => {
        const name = nameInputRef.current.value.trim();
        if (name.length < 1) {
            setNoNameError("Name cannot be empty!")
            return
        }
        ws.send(JSON.stringify({
            action: 'updateName',
            name: name,
            lobbyName: lastLobbyName
        }));
        let response = await axios.post('http://localhost:8080/api/lobbies/addName', {
            lobby_name: lastLobbyName,
            name: name
        })
        setJoinedWheel(true);
    };

    const spinWheel = async () => {
        let response = await axios.post('http://localhost:8080/api/lobbies/close', {
            name: lastLobbyName
        })
    }

    return (
        <div>
            {joinedLobby && (
                <h1>Let's Choose a Restaurant!</h1>
            )}
            {!joinedLobby && (
                <div>
                    <div>
                        <h2>Create a New Lobby:</h2>
                        <h3>Lobby Name:</h3>
                        <input ref={lobbyNameRef}></input><br />
                        <button onClick={createLobby}>Create Lobby</button>
                        <p>{existLobbyError}</p>
                    </div>
                    <div>
                        <h2>Or Join Your Friend's Lobby:</h2>
                        <input ref={joinLobbyRef} placeholder="Enter Lobby ID"></input><br />
                        <button onClick={joinLobby}>Join Lobby</button>
                        <p>{joinLobbyError}</p>
                    </div>
                </div>
            )}
            {joinedLobby && (
                <div>
                    {!joinedWheel && (
                        <div>
                            <h3>Lobby Name: {lastLobbyName}</h3>
                            <h3>Name:</h3>
                            <input ref={nameInputRef}></input><br />
                            <button onClick={addName}>Join the Wheel!</button>
                            <p>{noNameError}</p>
                        </div>
                    )}
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
                    </div><br />
                    <button onClick={spinWheel}>Spin The Wheel!</button>
                </div>
            )}
        </div>
    );
}

export default Wheel