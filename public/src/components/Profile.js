import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RestaurantCard from './RestaurantCard';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userError, setUserError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  // const [isEditing, setIsEditing] = useState(false);
  // const [editedName, setEditedName] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const username = urlParams.get('user');

    const fetchUserData = async () => {
      try {
        if (username !== null) {
          let response = await axios.get(`/api/userInfo?username=${username.current.value}`);
          if (response.data.status === "success") {
            setUser(response.data.user);
            console.log(user)

            fetchUserRestaurants(username);
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

    const fetchUserRestaurants = async (username) => {
      try {
        console.log('Fetching user history for username:', username); // Debugging log
        const restaurantsResponse = await axios.get(`/api/userInfo/userHistory?username=${username}`);
        console.log('User history response:', restaurantsResponse.data); // Debugging log

        if (restaurantsResponse.data.status === 'success') {
          setRestaurants(restaurantsResponse.data.restaurants);
        } else {
          setUserError('Failed to fetch restaurants data');
        }
      } catch (error) {
        console.error('Failed to fetch user restaurants', error);
        setUserError('An error occurred while fetching restaurants data');
      }
    };

    fetchUserData();

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
            <div>
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div><h1>userError</h1></div>
      )}
    </div>
  );
};

export default Profile;
