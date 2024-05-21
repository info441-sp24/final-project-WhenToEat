import express from 'express';
import models from '../../models.js'; // Ensure this path is correct


const router = express.Router();

router.get('/', async (req, res) => {

    const { searchQuery, selectedCuisine, selectedPriceRange, selectedRatings } = req.query;

    let query = {};

    if (searchQuery) {
        query.name = { $regex: searchQuery, $options: 'i' };
    }

    if (selectedCuisine) {
        query.cuisine = selectedCuisine;
    }

    if (selectedPriceRange) {
        query.price_range = { $in: selectedPriceRange.split(',') };
    }

    if (selectedRatings) {
        const ratings = selectedRatings.split(',').map(Number);
        query.rating = {
            $gte: Math.min(...ratings),
            $lt: Math.max(...ratings) + 1,
        };
    }

    try {
        const restaurants = await models.Restaurants.find(query);
        res.json(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).send('Server error');
    }
});

export default router;
