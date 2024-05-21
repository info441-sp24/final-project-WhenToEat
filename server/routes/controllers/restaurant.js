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

router.post("/add", async (req, res) => {
    try {
        // const { lobby_name, user_added, restaurant_id, restaurant } = req.body;
        const { lobby_name, user_added, restaurant } = req.body;

        // if (!lobby_name || !user_added || !restaurant_id || !restaurant) {
        //     return res.status(400).json({ error: "All fields are required" });
        // }

        if (!lobby_name || !restaurant || !user_added) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const Lobby = req.models.Lobbies;

        const lobby = await Lobby.findOne({ lobby_name });

        if (!lobby) {
            return res.status(404).json({ error: "Lobby not found" });
        }

        const newChoice = {
            user_added,
            // restaurant_id,
            restaurant_id: "placeholder",
            restaurant,
            weight: 1 // Default weight
        };

        lobby.choices.push(newChoice);

        await lobby.save();

        return res.status(200).json({ message: "Restaurant added to the lobby successfully", lobby });
    } catch (error) {
        console.error("Error adding restaurant to the lobby:", error);
        return res.status(500).json({ error: "An error occurred while adding the restaurant to the lobby" });
    }
});

router.post("/random", async (req, res) => {
    // Logic to get a random restaurant
});

export default router;


