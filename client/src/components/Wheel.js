import React, { useRef, useState, useEffect } from 'react';
import '../styles/Wheel.css';
import axios from 'axios';

const socketUrl = "ws://localhost:8080/api/lobbies/wheelSocket";
let ws = new WebSocket(socketUrl);

const Wheel = () => {
    const nameInputRef = useRef(null);
    const joinLobbyRef = useRef(null);
    const lobbyNameRef = useRef(null);
    const restaurantInputRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [joinedLobby, setJoinedLobby] = useState(false);
    const [joinedWheel, setJoinedWheel] = useState(false);
    const [showWinnerPopup, setShowWinnerPopup] = useState(false);
    const [showCloseLobby, setShowCloseLobby] = useState(false);
    const [showSpinBtn, setShowSpinBtn] = useState(true);
    const [users, setUsers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [noNameError, setNoNameError] = useState('');
    const [spinError, setSpinError] = useState('');
    const [existLobbyError, setExistLobbyError] = useState('');
    const [lastLobbyName, setLastLobbyName] = useState('');
    const [joinLobbyError, setJoinLobbyError] = useState('');
    const [winner, setWinner] = useState("");

    useEffect(() => {
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.action === 'nameUpdated') {
                setRestaurants(prevRestaurants => [...prevRestaurants, data.choice])
                setUsers(prevLobby => [...prevLobby, data.name]);
                setNotifications(prev => [...prev, data.message]);
            } else if (data.action === 'nameDisconnected') {
                console.log(data.name, data.message)
                setRestaurants(prevRestaurants => prevRestaurants.filter(name => name !== data.choice))
                setUsers(prevLobby => prevLobby.filter(name => name !== data.name));
                setNotifications(prev => [...prev, data.message]);
            } else if (data.action === 'lobbyClosed') {
                setNotifications(prev => [...prev, data.message]);
                setShowSpinBtn(false);
            }
        };
    }, []);

    const createLobby = async () => {
        if (lobbyNameRef.current.value.trim().length === 0) {
            setExistLobbyError('Must enter lobby name');
            return;
        }
        let response = await axios.post('http://localhost:8080/api/lobbies', {
            name: lobbyNameRef.current.value
        });
        if (response.data.status === "success") {
            setNotifications([])
            setLastLobbyName(lobbyNameRef.current.value.trim());
            setJoinedLobby(true);
            setShowCloseLobby(true);
            setShowSpinBtn(true);
            ws.send(JSON.stringify({
                action: 'joinLobby',
                lobbyId: response.data.lobbyId
            }));
        } else {
            setExistLobbyError('Lobby name already used');
        }
    }

    const joinLobby = async () => {
        if (joinLobbyRef.current.value.trim().length === 0) {
            setJoinLobbyError('Must enter lobby name');
            return;
        }
        let response = await axios.get(`http://localhost:8080/api/lobbies?lobbyName=${joinLobbyRef.current.value}`);
        if (response.data.status === "success") {
            setNotifications([]);
            setUsers(response.data.users);
            setRestaurants(response.data.choices);
            console.log(users)
            setShowSpinBtn(false);
            setJoinedLobby(true);
            setLastLobbyName(joinLobbyRef.current.value);
            ws.send(JSON.stringify({
                action: 'joinLobby',
                lobbyId: response.data.lobbyId
            }));
        } else if (response.data.status === "closed") {
            setJoinLobbyError('Lobby has not been opened yet or was already closed');
        } else {
            setJoinLobbyError('Lobby name does not exist');
        }
    };

    const addName = async () => {
        const name = nameInputRef.current.value.trim();
        const restaurant = restaurantInputRef.current.value.trim();
        if (name.length < 1 || restaurant.length < 1) {
            setNoNameError("Both inputs must be filled out!");
            return;
        }
        ws.send(JSON.stringify({
            action: 'updateName',
            name: name,
            restaurant: restaurant
        }));
        await axios.post('http://localhost:8080/api/lobbies/addName', {
            lobby_name: lastLobbyName,
            name: name,
            restaurant: restaurant
        });
        setJoinedWheel(true);
    };

    const spinWheel = async () => {
        let response = await axios.post('http://localhost:8080/api/lobbies/spinWheel', {
            name: lastLobbyName
        });
        if (response.data.status === "not enough") {
            setSpinError("Need at least 2 participants!")
        } else {
            setWinner(response.data.winner);
            setShowWinnerPopup(true);
        }
    };

    const closeWinnerPopup = () => {
        setShowWinnerPopup(false);
        setWinner('');
    };

    const closeLobby = async () => {
        let response = await axios.post('http://localhost:8080/api/lobbies/close', {
            name: lastLobbyName
        });

        if (response.data.status === "success") {
            console.log("CLOSE WORKED")
            ws.send(JSON.stringify({
                action: 'lobbyClosed',
                lobbyName: lastLobbyName
            }));
            handleLobbyClosed();
        } else {
            console.log('could not close lobby')
        }
    };

    const handleLobbyClosed = () => {;
        setNotifications([])
        setUsers([])
        setJoinedLobby(false);
        setJoinedWheel(false);
        setShowWinnerPopup(false);
        setShowCloseLobby(false);
        setShowSpinBtn(false);
        setNoNameError('');
        setSpinError('');
        setExistLobbyError('');
        setLastLobbyName('');
        setJoinLobbyError('');
        setWinner("");
    };

    return (
        <div className="container">
            {showWinnerPopup && <div className="overlay" />}
            {joinedLobby && (
                <h1>Let's Choose a Restaurant!</h1>
            )}
            {!joinedLobby && (
                <div className="lobby-setup">
                    <div className="create-lobby">
                        <h2>Create a New Lobby:</h2>
                        <input ref={lobbyNameRef} placeholder="Enter New Lobby Name" /><br />
                        <button onClick={createLobby}>Create Lobby</button>
                        <p className="wheel-error">{existLobbyError}</p>
                    </div>
                    <div className="join-lobby">
                        <h2>Or Join Your Friend's Lobby:</h2>
                        <input ref={joinLobbyRef} placeholder="Enter Friend's Lobby Name" /><br />
                        <button onClick={joinLobby}>Join Lobby</button>
                        <p className="wheel-error">{joinLobbyError}</p>
                    </div>
                </div>
            )}
            {joinedLobby && (
                <div className="lobby">
                    <div className="lobby-name-display">
                        <div>Lobby Name: <span style={{fontStyle: 'italic', fontWeight: 'bold' }}>{lastLobbyName}</span></div>
                        { showCloseLobby &&  (
                            <button onClick={closeLobby} className="close-lobby">Close Lobby</button>
                        )}
                    </div>
                    {!joinedWheel && (
                        <div className="join-wheel">
                            <input ref={nameInputRef} placeholder='Your Name' /><br />
                            <input ref={restaurantInputRef} placeholder='Choose a Restaurant' /><br />
                            <button onClick={addName}>Join the Wheel!</button>
                            <p className="wheel-error">{noNameError}</p>
                        </div>
                    )}
                    <h2>Lobby Notifications:</h2>
                    <div className="notifications">
                        {notifications.map((notification, index) => (
                            <div key={index} className={`notification ${notification.includes("joined") ? "join" : "leave"}`}>
                                {notification}
                            </div>
                        ))}
                    </div>
                    <h2>People in lobby:</h2>
                    <div className="lobby-names">
                        {users.map((name, index) => (
                            <div key={index} className="lobby-name">
                                {name}'s Restaurant : <span style={{ textDecoration: 'underline' }}>{restaurants[index] || 'No choice selected'}</span>
                            </div>
                        ))}
                    </div><br />
                    { showSpinBtn && (
                        <button onClick={spinWheel} className='spin-wheel'>Spin The Wheel!</button>
                    )}
                    <p className='wheel-error'>{spinError}</p>
                </div>
            )}
            <div className={`popup ${showWinnerPopup ? 'show' : ''}`}>
                <h2>The winner is {winner}</h2>
                <button onClick={closeWinnerPopup}>Close</button>
            </div>
        </div>
    );
}

export default Wheel;
