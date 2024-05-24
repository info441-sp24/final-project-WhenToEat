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
        let response;
        if (username != "null") {
          response = await axios.get(`/api/userInfo?username=${username}`);
          if (response.data.status === "success") {
            setUser(response.data);
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
        <div><h1>Please sign-in first</h1></div>
      )}
    </div>
  );
};

export default Profile;
