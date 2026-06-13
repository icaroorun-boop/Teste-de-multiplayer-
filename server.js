const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// servir frontend
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);

    socket.on("entrar", (nick) => {
        nick = String(nick || "").trim().slice(0, 20);
        if (!nick) return;

        socket.data.nick = nick;

        io.emit("chat message", {
            system: true,
            text: `${nick} entrou no chat`
        });
    });

    socket.on("chat message", (msg) => {
        const nick = socket.data.nick;
        if (!nick) return;

        const text = String(msg || "").trim();
        if (!text) return;

        io.emit("chat message", {
            system: false,
            nick,
            text: text.slice(0, 500)
        });
    });

    socket.on("disconnect", () => {
        const nick = socket.data.nick;

        if (nick) {
            io.emit("chat message", {
                system: true,
                text: `${nick} saiu do chat`
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Servidor rodando na porta", PORT);
});
