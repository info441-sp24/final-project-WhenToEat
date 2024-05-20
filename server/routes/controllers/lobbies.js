import express from 'express';
import enableWs from 'express-ws';

const router = express.Router()
enableWs(router);

let socketCounter = 1
let allSockets = {}

router.ws("/wheelSocket", (ws, res) => {
    let mySocketNum = socketCounter
    socketCounter++
    console.log("user " + mySocketNum + " connected via websocket")

    allSockets[mySocketNum] = {
        socket: ws,
        name: mySocketNum
    }

    ws.on('message', async msg => {
        try {
            const socketMsg = JSON.parse(msg);
            if (socketMsg.action === 'updateName') {
                console.log(socketMsg.name + ' has joined the lobby');
                allSockets[mySocketNum].name = socketMsg.name;
                broadcastNotification(`${socketMsg.name} has joined the lobby`, 'nameUpdated', `${socketMsg.name}`);
            }
        } catch (error) {
            console.error('Websocket message received error: ' + error);
        }
    });

    ws.on('close', () => {
        const disconnectedName = allSockets[mySocketNum].name;
        console.log(disconnectedName + ' has disconnected :(');
        delete allSockets[mySocketNum];
        broadcastNotification(`${disconnectedName} has disconnected`, 'nameDisconnected', `${disconnectedName}`);
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

function broadcastNotification(message, action, name) {
    const notification = JSON.stringify({
        action: action,
        message: message,
        name: name
    });
    
    for (let socketNum in allSockets) {
        allSockets[socketNum].socket.send(notification);
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
        return res.json({ "status": "Lobby name already exists" })
    } else {
        try {
            // console.log("BODY", req.body)
            const newLobby = new req.models.Lobbies({
                lobby_name: req.body.name,
                users: [],
                choices: [],
                status: false
            })
            await newLobby.save()
            res.json({"status": "success"})
        } catch (error) {
            console.log("Error:", error);
            res.status(500).json({"status": "error", "error": error});
        }
    }
})

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
        broadcastNotification(`Host (${allSockets[1].name}) has closed the lobby`, 'lobbyClosed', ``);
        res.json({"status": "success"})
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({"status": "error", "error": error});
    }
})

router.post("/addName", async (req, res) => {
    try {
        let lobbyNewUser = await req.models.Lobbies.findOne({ lobby_name: req.body.lobby_name });
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