const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.on('connection', (socket) => {
    console.log("User connected");
});

app.get("/", (req, res) => {
    res.send("Nexus Backend Running Successfully");
});

// Real-time announcement route
app.post("/announce", (req, res) => {
    io.emit("announcement", req.body.message);
    res.json({ status: "sent" });
});
app.use("/ai", require("./ai"));

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
