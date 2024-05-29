import React, { useRef, useState, useEffect } from 'react';
import '../styles/Wheel.css';
import axios from 'axios';

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const hostname = window.location.hostname;
const port = window.location.port ? `:${window.location.port}` : "";
const socketUrl = `${protocol}//${hostname}${port}/api/lobbies/wheelSocket`;
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
    const [points, setPoints] = useState({});
    const [restaurants, setRestaurants] = useState([]);
    const [noNameError, setNoNameError] = useState('');
    const [noRestaurantError, setNoRestaurantError] = useState('');
    const [spinError, setSpinError] = useState('');
    const [existLobbyError, setExistLobbyError] = useState('');
    const [lastLobbyName, setLastLobbyName] = useState('');
    const [joinLobbyError, setJoinLobbyError] = useState('');
    const [winner, setWinner] = useState("");
    const [currentName, setCurrentName] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const handleWebSocketMessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.action === 'nameUpdated') {
                setRestaurants(prevRestaurants => [...prevRestaurants, data.choice]);
                setUsers(prevLobby => [...prevLobby, data.name]);
                setNotifications(prev => [...prev, data.message]);
                setPoints(p => ({...p, [data.choice]: (p[data.choice] + 1 || 1)}));
            } else if (data.action === 'nameDisconnected') {
                setRestaurants(prevRestaurants => prevRestaurants.filter(name => name !== data.choice));
                setUsers(prevLobby => prevLobby.filter(name => name !== data.name));    
                setPoints(p => {
                    const newPoints = { ...p };
                    delete newPoints[data.choice];
                    return newPoints;
                });
                setNotifications(prev => [...prev, data.message]);
                try {
                    const response = await axios.delete(`/api/lobbies/removeUser`, {
                        data: {
                            lobbyName: lastLobbyName,
                            username: data.name
                        }
                    });
                    console.log('User removed from lobby:', response.data);
                } catch (error) {
                    console.error('Error removing user from lobby:', error);
                }
            } else if (data.action === 'lobbyClosed') {
                setNotifications(prev => [...prev, data.message]);
                setShowSpinBtn(false);
            } else if (data.action === 'winnerDecided') {
                setNotifications(prev => [...prev, data.message])
            }
        };

        ws.onmessage = handleWebSocketMessage;

        return () => {
            ws.onmessage = null;
        };
    }, [lastLobbyName]);

    const createLobby = async () => {
        if (lobbyNameRef.current.value.trim().length === 0) {
            setExistLobbyError('Must enter lobby name');
            return;
        }
        try {
            let response = await axios.post('/api/lobbies', {
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
        } catch (error) {
            console.error('Error creating lobby:', error);
        }
    }

    const joinLobby = async () => {
        if (joinLobbyRef.current.value.trim().length === 0) {
            setJoinLobbyError('Must enter lobby name');
            return;
        }
        
        try {
            let response = await axios.get(`/api/lobbies?lobbyName=${joinLobbyRef.current.value}`);
            if (response.data.status === "success") {
                setUsers(response.data.users);
                setRestaurants(response.data.choices);
                setShowSpinBtn(false);
                setJoinedLobby(true);
                setCurrentName(response.data.sessionName)
                if (response.data.sessionName !== "") {
                    setLoggedIn(true)
                } else {
                    setLoggedIn(false)
                }
                setLastLobbyName(joinLobbyRef.current.value.trim());
                setPoints(response.data.weights)
                ws.send(JSON.stringify({
                    action: 'joinLobby',
                    lobbyId: response.data.lobbyId
                }));
            } else if (response.data.status === "closed") {
                setJoinLobbyError('Lobby has not been opened yet or was already closed');
            } else {
                setJoinLobbyError('Lobby name does not exist');
            }
        } catch (error) {
            console.error('Error joining lobby:', error);
        }
    };

    const addRestaurant = async () => {
        const restaurant = restaurantInputRef.current.value.trim();
        if (restaurant.length < 1) {
            setNoRestaurantError("Restaurant cannot be empty!");
            return;
        }
        await axios.post('/api/lobbies/addRestaurant', {
            lobby_name: lastLobbyName,
            restaurant: restaurant
        })
    }

    const addName = async (num) => {
        const restaurant = restaurantInputRef.current.value.trim();
        let name
        if (num === 1) {
            name = currentName
            if (restaurant.length < 1) {
                setNoNameError("Restaurant input must be filled out!");
                return;
            }
        } else {
            name = nameInputRef.current.value.trim();
            if (name.length < 1 || restaurant.length < 1) {
                setNoNameError("Both inputs must be filled out!");
                return;
            }
        }
        ws.send(JSON.stringify({
            action: 'updateName',
            name: name,
            restaurant: restaurant
        }));
        await axios.post('/api/lobbies/addName', {
            lobby_name: lastLobbyName,
            name: name,
            restaurant: restaurant
        });
        setJoinedWheel(true);
    };

    const spinWheel = async () => {
        let response = await axios.post('/api/lobbies/spinWheel', {
            name: lastLobbyName
        });
        // setShowSpinBtn(false)
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
        let response = await axios.post('/api/lobbies/close', {
            name: lastLobbyName
        });

        if (response.data.status === "success") {
            ws.send(JSON.stringify({
                action: 'lobbyClosed',
                lobbyName: lastLobbyName
            }));
            handleLobbyClosed();
        } else {
            console.log('could not close lobby')
        }
    };

    const handleLobbyClosed = () => {
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

    const increasePoints = async (restaurant) => {
        console.log("Inc")
        const currentPoints = (points[restaurant] || 0) + 1;
        setPoints({ ...points, [restaurant]: currentPoints });
        let response = await axios.post('/api/lobbies/increase', {
            name: lastLobbyName,
            restaurant: restaurant
        });
    };

    const decreasePoints = async (restaurant) => {
        console.log("Dec")
        const currentPoints = Math.max((points[restaurant] || 0) - 1, 0);
        setPoints({ ...points, [restaurant]: currentPoints });
        let response = await axios.post('/api/lobbies/decrease', {
            name: lastLobbyName,
            restaurant: restaurant
        });
    };

    return (
        <div className="wheel-container">
            {showWinnerPopup && <div class="overlay" />}
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
                        <div>Lobby Name: <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>{lastLobbyName}</span></div>
                        {showCloseLobby && (
                            <button onClick={closeLobby} class="close-lobby">Close Lobby</button>
                        )}
                    </div>
                    {!joinedWheel && (
                        <div className="join-wheel">
                            { loggedIn ? (
                                <div>
                                    <h2>Name: {currentName}</h2>
                                    <input ref={restaurantInputRef} placeholder='Choose a Restaurant' /><br />
                                    <button onClick={() => addName(1)}>Join the Wheel!</button>
                                    <p className="wheel-error">{noNameError}</p>
                                </div>
                                ) : 
                                <div>
                                    <input ref={nameInputRef} placeholder='Your Name' /><br />
                                    <input ref={restaurantInputRef} placeholder='Choose a Restaurant' /><br />
                                    <button onClick={() => addName(2)}>Join the Wheel!</button>
                                    <p className="wheel-error">{noNameError}</p>
                                </div>
                            }
                        </div>
                    )}
                    <h2>Lobby Notifications:</h2>
                    <div className="lobby-notifications">
                        {notifications.map((notifications, index) => (
                            <div key={index} className={`lobby-notification ${
                                notifications.includes("joined") ? "join" :
                                notifications.includes("winner") ? "winner" :
                                "leave"}`}>
                                {notifications}
                            </div>
                        ))}
                    </div>
                    <h2>People in lobby:</h2>
                    <div className="lobby-names">
                        {users.map((name, index) => (
                            <div key={index} className="lobby-name">
                                <div>{name}'s Restaurant : <span style={{ textDecoration: 'underline' }}>{restaurants[index] ? restaurants[index] : 'No choice selected'}</span></div>
                                <div className="points-controls">
                                    <button onClick={() => increasePoints(restaurants[index])}>∧</button>
                                    <span>{points[restaurants[index]] || 0}</span>
                                    <button onClick={() => decreasePoints(restaurants[index])}>∨</button>
                                </div>
                            </div>
                        ))}
                    </div><br />
                    {showSpinBtn && (
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
