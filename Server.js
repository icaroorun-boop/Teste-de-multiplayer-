const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve os arquivos da pasta public
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);

    // entra no chat
    socket.on("entrar", (nick) => {
        socket.data.nick = nick;

        io.emit("chat message", {
            system: true,
            text: `${nick} entrou no chat`
        });
    });

    // mensagem normal
    socket.on("chat message", (msg) => {
        const nick = socket.data.nick || "Anon";

        io.emit("chat message", {
            system: false,
            nick,
            text: msg
        });
    });

    // saiu
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

// IMPORTANTE pro Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Servidor rodando na porta", PORT);
});
