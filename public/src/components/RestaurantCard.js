import React from 'react';
import '../styles/RestaurantCard.css';


const RestaurantCard = ({ restaurant }) => {
    return (
        <div className="restaurant-card">
            <h3>{restaurant.name}</h3>
            <p>{restaurant.address}</p>
            <p>{restaurant.cuisine}</p>
            <p>{restaurant.price_range}</p>
            <p>{restaurant.rating} Stars</p>
        </div>
    );
}

export default RestaurantCard;