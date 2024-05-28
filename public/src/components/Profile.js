import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Notification from './Notification';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userError, setUserError] = useState('')
  const [friendUsername, setFriendUsername] = useState('');
  const [notification, setNotification] = useState(null);
  // const [isEditing, setIsEditing] = useState(false);
  // const [editedName, setEditedName] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const username = urlParams.get('user');

    const fetchUser = async () => {
      try {
        let response;
        if (username != "null") {
          response = await axios.get(`/api/userInfo?username=${username}`);
          if (response.data.status === "success") {
            setUser(response.data.user);
            console.log(response.data)
            // setEditedName(response.data.name);
          }
        } else {
          setUserError('Please sign in first')
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };

    fetchUser();
  }, []);

  // const handleNameChange = (event) => {
  //   setEditedName(event.target.value);
  // };

  // const handleEdit = () => {
  //   setIsEditing(true);
  // };

  // const handleSave = async () => {
  //   try {
  //     const response = await axios.put('/api/users', {
  //       username: user.username, 
  //       name: editedName
  //     });
  //     if (response.data.status === "success") {
  //       setUser(prevState => ({ ...prevState, name: editedName }));
  //       setIsEditing(false);
  //     }
  //   } catch (error) {
  //     console.error('Failed to save changes', error);
  //   }
  // };

  const handleAddFriend = async () => {
    try {
        const response = await axios.post('/api/friends/add', {
            username: user.username,
            friendname: friendUsername
        });
        if (response.data.message) {
            setNotification(response.data.message);
            setUser(prevUser => ({
              ...prevUser,
              friends: [...prevUser.friends, friendUsername]
            }));
        }
        setFriendUsername('');
    } catch (error) {
        console.error('Failed to add friend', error);
        setNotification('Failed to add friend');
    }
};

const handleRemoveFriend = async (friendUsername) => {
  try {
    const response = await axios.post('/api/friends/remove', {
      username: user.username,
      friendname: friendUsername
    });
    if (response.data.message) {
      setNotification(response.data.message);
      setUser(prevUser => ({
        ...prevUser,
        friends: prevUser.friends.filter(f => f !== friendUsername)
      }));
    }
  } catch (error) {
    console.error('Failed to remove friend', error);
    setNotification('Failed to remove friend');
  }
};

  return (
    <div>
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      {user ? (
        <div className="profile-container">
          <div className="profile-info">
            <h1>{user.username}</h1>
            <p>Points: {user.points}</p>
          {/* <button onClick={handleEdit}>Edit Profile</button> */}
            
            <div>
              <h1>Restaurants Visited</h1>
            </div>
          </div>
          <div>
            <div className="addFriend">
              <h1>Add a Friend!</h1>
              <input 
                type="text"
                placeholder="Enter a username/email..."
                value={friendUsername}
                onChange={(event) => setFriendUsername(event.target.value)}/>
              <button type="submit" onClick={handleAddFriend}>Add Friend</button>
            </div>
            <div className="friendsList">
              <h1>Friends List</h1>
              {user.friends.map((friend) => (
                <div className="friendCard">
                  <p>{friend}</p>
                  <button onClick={() => handleRemoveFriend(friend)}>Remove Friend</button>
                </div>
              ))}
            </div>
          </div>
        </div>
       ) : (
        <div><h1>{userError}</h1></div>
      )} 
    </div>
  );
};

export default Profile;
