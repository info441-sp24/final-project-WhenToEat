import express from 'express';
import models from '../../models.js'; 
const router = express.Router();
router.get("/explore", async (req, res) => {
    const { searchQuery, selectedCuisine, selectedPriceRange, selectedRating } = req.query;
    try {
        let query = {};
        if (searchQuery) {
            query.$or = [
                { name: { $regex: new RegExp(searchQuery, 'i') } },
                { address: { $regex: new RegExp(searchQuery, 'i') } }
            ];
        }
        if (selectedCuisine) {
            query.cuisine = selectedCuisine;
        }
        if (selectedPriceRange) {
            query.price_range = { $in: selectedPriceRange.split(',') };
        }
        if (selectedRating) {
            query.rating = { $in: selectedRating.split(',').map(Number) };
        }
        let restaurants;

        if (Object.keys(query).length === 0) {
            restaurants = await models.Restaurants.find({});
        } else {
            restaurants = await models.Restaurants.find(query);
        }
        res.status(200).json(restaurants);
    } catch (error) {
        console.error('Error fetching or filtering restaurants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;


