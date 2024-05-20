import express from 'express';
import { searchRestaurants, getRestaurantDetails } from '../utils/yelpclient'
const router = express.Router()

router.get("/", async (req, res) => {
    res.send("YO");
})

router.get("/explore", async (req, res) => {
    const { term, location } = req.query;

    if (!term || !location) {
        return res.status(400).json({ error: 'Term and location are required' });
    }

    try {
        const restaurants = await searchRestaurants(term, location);
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get("/search/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const restaurantDetails = await getRestaurantDetails(id);
        res.status(200).json(restaurantDetails);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post("/add", async (req, res) => {
    res.send("YO");
})

router.post("/random", async (req, res) => {
    res.send("YO");
})

export default router;