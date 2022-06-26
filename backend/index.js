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
      job: data.job,
      socketId: socket.id,
    };
    users.push(user);
    io.sockets.emit("get users online", users);
  });

  socket.conn.on("close", (reason) => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.sockets.emit("get users online", users);
  });

  socket.on("user disconnected", (data) => {
    users = users.filter((user) => user.id !== data.id);
    io.sockets.emit("get users online", users);
  });

  socket.on("create room", (data) => {
    let userSocketId;
    let userSocket;
    let roomId;
    let roomUsers = [];

    /* On créé l'ID de la room */
    if (!data.isGroup) {
      /* Si conversation entre deux personnes, on vérifie si la room existe déjà */
      if (
        io.sockets.adapter.rooms.has(
          `${data.users[0].id}-${data.users[1].id}`
        ) ||
        io.sockets.adapter.rooms.has(`${data.users[1].id}-${data.users[0].id}`)
      ) {
        console.log("La conversation existe déjà");
        return;
      } else {
        roomId = `${data.users[1].id}-${data.users[0].id}`;
      }
    } else {
      roomId = `${data.groupName}-${data.users[1].id}`;
    }
    /* On loop pour ajouter chaque utilisateur (groupe ou non) dans la room */
    for (let i = 0; i < data.users.length; i++) {
      const user = data.users[i];
      userSocketId = i === data.users.length - 1 ? socket.id : user.socketId;
      userSocket = io.sockets.sockets.get(userSocketId);

      roomUsers.push({
        id: user.id,
        name: user.name,
        job: user.job,
        socketId: userSocketId,
      });
      userSocket.join(roomId);
    }

    io.to(roomId).emit("room created", {
      roomId: roomId,
      users: roomUsers,
      messages: [],
      createdBy: {
        id: data.users[data.users.length - 1].id,
        name: data.users[data.users.length - 1].name,
        job: data.users[data.users.length - 1].job,
        socketId: socket.id,
      },
      isGroup: data.isGroup,
      groupName: data.groupName,
    });
  });

  socket.on("update room", (data) => {
    let userSocketId;
    let userSocket;

    switch (data.type) {
      case "remove user":
        userSocketId = socket.id;
        userSocket = io.sockets.sockets.get(userSocketId);
        userSocket.leave(data.room.roomId);
        data = {
          ...data,
          room: {
            ...data.room,
            users: data.room.users.filter((user) => user.id !== data.user.id),
          },
        };
        if (data.room.users.lenth === 0) {
          data = undefined;
        }
        break;
      case "add users":
        for (let i = 0; i < data.users.length; i++) {
          const user = data.users[i];
          userSocketId = user.socketId;
          userSocket = io.sockets.sockets.get(userSocketId);
          userSocket.join(data.room.roomId);
          data.room.users.push({
            id: user.id,
            name: user.name,
            job: user.job,
            socketId: userSocketId,
          });
        }
        break;
      case "change group name":
        data = {
          ...data,
          room: {
            ...data.room,
            groupName: data.groupName,
          },
        };
        break;
      default:
        console.log("Erreur");
        break;
    }

    io.to(data.room.roomId).emit("room updated", data.room);
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
