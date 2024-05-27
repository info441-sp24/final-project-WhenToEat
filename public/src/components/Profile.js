import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userError, setUserError] = useState('')
  // const [isEditing, setIsEditing] = useState(false);
  // const [editedName, setEditedName] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const username = urlParams.get('user');

    const fetchUser = async () => {
      try {
        if (username !== null) {
          let response = await axios.get(`/api/userInfo?username=${username.current.value}`);
          if (response.data.status === "success") {
            setUser(response.data.user);
            console.log(user)
            // setEditedName(response.data.name);
          } else {
            setUserError('Failed to fetch user data');
          }
        } else {
          setUserError('Please sign in first');
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
        if (error.response && error.response.status === 404) {
          setUserError('User not found');
        } else {
          setUserError('An error occurred while fetching user data');
        }
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

  return (
    <div>
      {user ? (
        <div>
          <h1>{user.username}</h1>
          <p>Points: {user.points}</p>
          {/* <button onClick={handleEdit}>Edit Profile</button> */}
          <div>
            <h1>Restaurants Visited</h1>
          </div>
        </div>
      ) : (
        <div><h1>userError</h1></div>
      )}
    </div>
  );
};

export default Profile;
