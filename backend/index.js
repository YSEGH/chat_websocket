const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: "*",
});

let users = [];

io.on("connection", (socket) => {
  socket.on("user connected", (data) => {
    let user = {
      id: data.id,
      name: data.name,
      socketId: socket.id,
    };
    users.push(user);
    io.sockets.emit("get users online", users);
  });

  socket.on("user disconnected", (data) => {
    users = users.filter((user) => user.id !== data.id);
    io.sockets.emit("get users online", users);
  });

  socket.on("create room", (data) => {
    let currentUserId = socket.id;
    let selectedUserId;
    let selectedUserSocket;
    let room;
    console.log(data);

    if (!data.isGroup) {
      selectedUserId = data.users[0].socketId;
      selectedUserSocket = io.sockets.sockets.get(selectedUserId);
      room = `${selectedUserId}-${currentUserId}`;

      if (selectedUserSocket) {
        if (
          io.sockets.adapter.rooms.has(`${selectedUserId}-${currentUserId}`) ||
          io.sockets.adapter.rooms.has(`${currentUserId}-${selectedUserId}`)
        ) {
          console.log("La salle existe déjà");
        } else {
          console.log(`Vous ouvrez une discussion avec ${data.users[0].name}`);

          socket.join(room);
          selectedUserSocket.join(room);

          io.to(room).emit("room created", {
            roomId: room,
            users: [
              {
                id: data.users[0].id,
                name: data.users[0].name,
                socketId: selectedUserId,
              },
              {
                id: data.users[1].id,
                name: data.users[1].name,
                socketId: currentUserId,
              },
            ],
            messages: [],
            createdBy: {
              id: data.users[1].id,
              name: data.users[1].name,
              socketId: currentUserId,
            },
          });
        }
      }
    } else {
      for (let i = 0; i < data.users.length - 2; i++) {
        const user = data.users[i];
        console.log(user);
      }
    }

    /* let selectedUserId = data.selectedUser.socketId;
    let selectedUserSocket = io.sockets.sockets.get(selectedUserId);
    let currentUserId = socket.id;
    let room = `${selectedUserId}-${currentUserId}`;

    if (selectedUserSocket) {
      if (
        io.sockets.adapter.rooms.has(`${selectedUserId}-${currentUserId}`) ||
        io.sockets.adapter.rooms.has(`${currentUserId}-${selectedUserId}`)
      ) {
        console.log("la room existe déjà");
      } else {
        console.log(
          `Vous avez ouvert une discussion avec ${data.selectedUser.name}`
        );
        socket.join(room);
        selectedUserSocket.join(room);

        io.to(room).emit("room created", {
          roomId: room,
          users: {
            currentUser: {
              id: data.currentUser.id,
              name: data.currentUser.name,
              socketId: socket.id,
            },
            selectedUser: {
              id: data.selectedUser.id,
              name: data.selectedUser.name,
              socketId: selectedUserId,
            },
          },
          messages: [],
        });
      }
    } else {
      console.log("L'utilisateur est déconnecté.");
    } */
  });

  socket.on("send message", (data) => {
    io.to(data.roomId).emit("send message", data);
  });

  socket.on("user is writing", (data) => {
    socket.broadcast.to(data.room.roomId).emit("user is writing", data.user);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
