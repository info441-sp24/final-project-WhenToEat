import express from 'express';
import models from '../../models.js'; // Import the models object
const router = express.Router();

router.get("/", async (req, res) => {
    const { term, location, cuisine, priceRange, rating } = req.query;

    try {
        let query = {};

        // Check if any filters are provided
        if (term && location) {
            query = {
                ...query,
                $or: [
                    { name: { $regex: new RegExp(term, 'i') } }, 
                    { address: { $regex: new RegExp(location, 'i') } } 
                ]
            };
        }
        if (cuisine) {
            query.cuisine = cuisine;
        }
        if (priceRange) {
            query.price_range = priceRange; 
        }
        if (rating) {
            query.rating = { $gte: parseInt(rating) }; 
        }

        let restaurants;

        // Check if any filters are applied
        if (Object.keys(query).length === 0) {
            // No filters applied, fetch all restaurants
            restaurants = await models.Restaurants.find({});
        } else {
            // Apply filters and fetch restaurants
            restaurants = await models.Restaurants.find(query);
        }

        res.status(200).json(restaurants);
    } catch (error) {
        console.error('Error fetching or filtering restaurants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/add", async (req, res) => {
    // Logic to add a new restaurant
});

router.post("/random", async (req, res) => {
    // Logic to get a random restaurant
});

export default router;
