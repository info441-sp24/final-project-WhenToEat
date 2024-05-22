import express from 'express';
import enableWs from 'express-ws';

const router = express();
enableWs(router);

let socketCounter = 0
let allSockets = []

router.ws("/wheelSocket", (ws, res) => {
    let mySocketNum;
    let myLobbyId;
    
    allSockets.push(ws);

    ws.on('message', async msg => {
        try {
            const socketMsg = JSON.parse(msg);
            switch (socketMsg.action) {
                case 'joinLobby':
                    myLobbyId = socketMsg.lobbyId;
                    console.log("Lobby id: ", myLobbyId)
                    if (!allSockets[myLobbyId]) {
                        allSockets[myLobbyId] = {};
                    }
                    mySocketNum = socketCounter++;
                    allSockets[myLobbyId][mySocketNum] = {
                        socket: ws,
                        name: mySocketNum,
                        restaurant: ""
                    };
                    console.log(`User ${mySocketNum} connected to lobby ${myLobbyId} via websocket`);
                    break;
                case 'updateName':
                    console.log(`name: ${socketMsg.name}  lobbyId: ${myLobbyId}`)
                    if (myLobbyId && allSockets[myLobbyId][mySocketNum]) {
                        allSockets[myLobbyId][mySocketNum].name = socketMsg.name;
                        allSockets[myLobbyId][mySocketNum].restaurant = socketMsg.restaurant;
                        console.log(`User ${mySocketNum} in lobby ${myLobbyId} updated name to ${socketMsg.name}`);
                        console.log(`User ${mySocketNum} in lobby ${myLobbyId} updated restaurant to ${socketMsg.restaurant}`);
                        broadcastNotification(myLobbyId, `${socketMsg.name} has joined the lobby (${socketMsg.restaurant})`, 'nameUpdated', socketMsg.name, socketMsg.restaurant);
                    }
                    break;
            }
        } catch (error) {
            console.error('Websocket message received error: ' + error);
        }
    });

    ws.on('close', () => {
        if (myLobbyId && mySocketNum && allSockets[myLobbyId] && allSockets[myLobbyId][mySocketNum]) {
            console.log(`User ${mySocketNum} from lobby ${myLobbyId} has disconnected`);
            broadcastNotification(myLobbyId, `${allSockets[myLobbyId][mySocketNum].name} has disconnected`, 'nameDisconnected', allSockets[myLobbyId][mySocketNum].name, "");
            delete allSockets[myLobbyId][mySocketNum];
            if (Object.keys(allSockets[myLobbyId]).length === 0) {
                delete allSockets[myLobbyId];
            }
        }
    });
})

function broadcastNotification(lobbyId, message, action, name, choice) {
    const notification = JSON.stringify({
        action: action,
        message: message,
        name: name,
        choice: choice
    });

    if (allSockets[lobbyId]) {
        for (let socketNum in allSockets[lobbyId]) {
            allSockets[lobbyId][socketNum].socket.send(notification);
        }
    }
}

router.get("/", async (req, res) => {
    try {
        let lobbyName = req.query.lobbyName
        const existingLobby = await req.models.Lobbies.findOne({ lobby_name: lobbyName });
        if (existingLobby && existingLobby.status) {
            existingLobby.save()
            return res.json({ "status": "success", "users": existingLobby.users, "lobbyId": existingLobby._id, "choices": existingLobby.choices})
        } else if (existingLobby && !existingLobby.status) {
            return res.json({ "status": "closed" })
        } else {
            return res.json({ "status": "no lobby" })
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({"status": "error", "error": error});
    } 
})

router.post("/", async (req, res) => {
    const lobbyName = req.body.name.trim();
    const existingLobby = await req.models.Lobbies.findOne({ lobby_name: lobbyName });
    if (existingLobby) {
        return res.json({ "status": "Lobby name already exists" });
    } else {
        const newLobby = new req.models.Lobbies({
            lobby_name: lobbyName,
            users: [],
            choices: [],
            status: true 
        });
        await newLobby.save();
        res.json({"status": "success", "lobbyId": newLobby._id});
    }
});

router.post("/spinWheel", async (req, res) => {
    try {
        // get the winner
        const lobbyToSpin = await req.models.Lobbies.findOne({ lobby_name: req.body.name });
        console.log("users in lobby:", lobbyToSpin.users, "notification list:", req.body.notis);
        let choices = lobbyToSpin.choices
        if (choices.length < 2) {
            res.json({"status" : "not enough"})
            return
        }
        let randomNum = Math.floor(Math.random() * choices.length)
        res.json({"status": "success", "winner": choices[randomNum].restaurant })
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({"status": "error", "error": error});
    }
})

router.post("/close", async (req, res) => {
    try {
        const lobbyToClose = await req.models.Lobbies.findOne({ lobby_name: req.body.name });
        if (lobbyToClose.users.length < 2) {
            await req.models.Lobbies.deleteOne({ lobby_name: lobbyToClose.lobby_name });
        } else {
            lobbyToClose.status = false
            await lobbyToClose.save()
        }
        broadcastNotification(lobbyToClose._id, `Host (${lobbyToClose.users[0]}) has closed the lobby`, 'lobbyClosed', "", "");
        res.json({"status": "success"})
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({"status": "error", "error": error});
    }
})

router.post("/addName", async (req, res) => {
    try {
        let lobbyNewUser = await req.models.Lobbies.findOne({ lobby_name: req.body.lobby_name });
        lobbyNewUser.users.push(req.body.name)
        const newChoice = {
            user_added: req.body.name,
            restaurant_id: "placeholder",
            restaurant: req.body.restaurant,
            weight: 1
        };
        lobbyNewUser.choices.push(newChoice)
        lobbyNewUser.save()
        res.json({"status": "success"})
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({"status": "error", "error": error});
    }
})

router.post("/addRestaurant", async (req, res) => {
    try {
        // const { lobby_name, user_added, restaurant_id, restaurant } = req.body;
        const { lobby_name, restaurant } = req.body;

        // if (!lobby_name || !user_added || !restaurant_id || !restaurant) {
        //     return res.status(400).json({ error: "All fields are required" });
        // }

        if (!lobby_name || !restaurant) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const Lobby = req.models.Lobbies;

        const lobby = await Lobby.findOne({ lobby_name });

        if (!lobby) {
            return res.status(404).json({ error: "Lobby not found" });
        }

        const newChoice = {
            // user_added,
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

export default router;