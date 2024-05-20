import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Assuming the username is stored in session or local storage
        const username = sessionStorage.getItem('username'); // or localStorage
        const response = await axios.get(`/api/user?username=${username}`);
        if (response.data) {
          setUser(response.data);
          setEditedName(response.data.name);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };

    fetchUser();
  }, []);

  const handleNameChange = (event) => {
    setEditedName(event.target.value);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post('/api/user', {
        username: user.username, 
        name: editedName
      });
      if (response.data.status === "success") {
        setUser(prevState => ({ ...prevState, name: editedName }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save changes', error);
    }
  };

  if (!user) return <div>Please sign-in first</div>;

  return (
    <div>
      {isEditing ? (
        <div>
          <label>Name:</label>
          <input type="text" value={editedName} onChange={handleNameChange} />
          <p>Points: {user.points}</p>
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div>
          <h1>{user.name}</h1>
          <p>Points: {user.points}</p>
          <button onClick={handleEdit}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
