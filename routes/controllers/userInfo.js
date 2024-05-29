import express from 'express';
var router = express.Router();
import models from '../../models.js'


router.post("/", async (req, res, next) => {
    if (req.session.isAuthenticated) {
        let info = req.body;
        try {
            let existingUser = await req.models.Users.findOne({ username: req.session.account.username });
            if (!existingUser) {
                let newUser = new req.models.Users({
                    username: req.session.account.username,
                    name: info.name,
                    email: info.email,  
                    points: 25, 
                    friends: [],
                    created_date: new Date()
                });
                await newUser.save();
                res.json({ "status": "success" });
            }
            // if (existingUser) {
            //     if (info.points) { 
            //         existingUser.points = info.points;
            //     }
            //     await existingUser.save();
            // } else {
            //     let newUser = new req.models.Users({
            //         username: req.session.account.username,
            //         email: info.email,  
            //         points: info.points, 
            //         friends: info.friends || [],
            //         created_date: new Date()
            //     });
            //     await newUser.save();
            // }
            res.json({ "status": "success" });
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ "status": "error", "error": error.message });
        }
    } else {
        res.status(401).json({
            status: "error",
            error: "not logged in"
        });
    }
});

router.get("/", async (req, res) => {
    if (req.session.isAuthenticated) {
        try {
            let username = req.query.username;
            if (username === "null") {
                res.status(400).json({ "status": "error", "error": "Username is required" });
            } else {
                let user = await req.models.Users.findOne({ username: username });
                let userHistory = await req.models.UserHistory.find({ user_id: username });

                res.status(200).json({"status": "success", "user": user, "history": userHistory});
        
            }
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ "status": "error", "error": error.message });
        }
    } else {
        res.status(401).json({
            status: "error",
            error: "not logged in"
        });
    }
});


export default router;
