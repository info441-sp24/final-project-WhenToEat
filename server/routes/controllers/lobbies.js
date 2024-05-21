import express from 'express';
import enableWs from 'express-ws';

const router = express.Router()
enableWs(router);

let socketCounter = 0
let allSockets = {}

router.ws("/wheelSocket", (ws, res) => {
    let mySocketNum;
    let myLobbyId;
    ws.on('message', async msg => {
        try {
            const socketMsg = JSON.parse(msg);
            switch (socketMsg.action) {
                case 'joinLobby':
                    myLobbyId = socketMsg.lobbyId;
                    if (!allSockets[myLobbyId]) {
                        allSockets[myLobbyId] = {};
                    }
                    mySocketNum = socketCounter++;
                    allSockets[myLobbyId][mySocketNum] = {
                        socket: ws,
                        name: undefined
                    };
                    console.log(`User ${mySocketNum} connected to lobby ${myLobbyId} via websocket`);
                    break;
                case 'updateName':
                    if (myLobbyId && allSockets[myLobbyId][mySocketNum]) {
                        allSockets[myLobbyId][mySocketNum].name = socketMsg.name;
                        console.log(`User ${mySocketNum} in lobby ${myLobbyId} updated name to ${socketMsg.name}`);
                        broadcastNotification(myLobbyId, `${socketMsg.name} has joined the lobby`, 'nameUpdated', socketMsg.name);
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
            delete allSockets[myLobbyId][mySocketNum];
            if (Object.keys(allSockets[myLobbyId]).length === 0) {
                delete allSockets[myLobbyId];
            }
        }
    });
})

// async function showLobby(lobbyName) {
//     try {
//         let response = await fetch(`/api/lobbies/users?lobbyName=${lobbyName}`);
//         console.log(response.users);
//         return response.users;
//     } catch (error) {
//         console.error('Error fetching lobby:', error);
//         throw error;
//     }
// }
function broadcastNotification(lobbyId, message, action, name) {
    const notification = JSON.stringify({
        action: action,
        message: message,
        name: name
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
            return res.json({ "status": "success", "users": existingLobby.users })
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
        const lobbyToClose = await req.models.Lobbies.findOne({ lobby_name: req.body.name });
        let users = lobbyToClose.users
        if (users.length < 2) {
            res.json({"status" : "not enough"})
            return
        }
        let randomNum = Math.floor(Math.random() * users.length)
        res.json({"status": "success", "winner": users[randomNum] })
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({"status": "error", "error": error});
    }
})

router.post("/close", async (req, res) => {
    try {
        const lobbyToClose = await req.models.Lobbies.findOne({ lobby_name: req.body.name });
        if (lobbyToClose.users.length < 2) {
            await req.models.Lobbies.deleteOne({ lobby_name: lobbyToClose });
        } else {
            lobbyToClose.status = false
            await lobbyToClose.save()
        }
        broadcastNotification(lobbyToClose._id, `Host has closed the lobby`, 'lobbyClosed', ``);
        res.json({"status": "success"})
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({"status": "error", "error": error});
    }
})

router.post("/addName", async (req, res) => {
    try {
        let lobbyNewUser = await req.models.Lobbies.findOne({ lobby_name: req.body.lobby_name });
        console.log(lobbyNewUser);
        if (lobbyNewUser.users.length == 0) {
            lobbyNewUser.status = true
        }
        lobbyNewUser.users.push(req.body.name)
        lobbyNewUser.save()
        res.json({"status": "success"})
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({"status": "error", "error": error});
    }
})

export default router;