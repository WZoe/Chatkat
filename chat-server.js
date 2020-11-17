// Require the packages we will use:
const http = require("http"),
    fs = require("fs"),
    path = require("path");
let myData = require('./myData');

// create default lobby
let lobby = new myData.Room(myData.room_id, 0, "Lobby", "");
lobby.user_list = []; // no creator
myData.rooms[myData.room_id] = lobby;
myData.room_id++;

// all socket related operations are referenced from https://socket.io/docs/v3/

const port = 3456;
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html, on port 3456:
const server = http.createServer(function (req, res) {
    // This callback runs when a new connection is made to our HTTP server.
    // modified from https://stackoverflow.com/questions/24582338/how-can-i-include-css-files-using-node-express-and-ejs
    let file = path.join(
        __dirname,
        req.url === "/" ? "index.html" : req.url
    );
    fs.readFile(file, function (err, data) {
        // This callback runs when the client.html file has been read from the filesystem.

        if (err) return res.writeHead(500);
        res.writeHead(200);
        res.end(data);
    });
});
server.listen(port);

// Import Socket.IO and pass our HTTP server object to it.
const socketio = require("socket.io")(server, {
    wsEngine: 'ws'
});

// Attach our Socket.IO server to our HTTP server to listen
const io = socketio.listen(server);
io.sockets.on("connection", function (socket) {
    // This callback runs when a new Socket.IO connection is established.
    const id = socket.id;

    socket.on('create_user', function (data) {
        //console.log("create user");
        // create user
        let newUser = new myData.User(id, data["name"], parseInt(data["avatar_id"]) - 1, 1);
        myData.users[id] = newUser;
        //lobby.user_list.push(id);
        myData.rooms[1].user_in(id);
        socket.join(1);

        myData.users[id] = newUser;
        // broadcast to all lobby users to update online users
        io.to(1).emit("create_user_response", myData.rooms);
    });

    socket.on('create_room', function (data) {
        //console.log("create room");
        // create room
        let newRoom = new myData.Room(myData.room_id, id, data["name"], data["password"]);
        // leave room
        // socket leave room
        socket.leave(myData.users[id].current_room_id);
        myData.rooms[myData.users[id].current_room_id].user_out(id);
        myData.rooms[myData.room_id] = newRoom;
        // set user current room id
        myData.users[id].current_room_id = myData.room_id;
        // socket join room
        socket.join(myData.room_id);
        myData.room_id++;
        io.to(id).emit("create_room_response", {'operator': true, 'rooms': myData.rooms});
        socket.broadcast.emit("create_room_response", {'operator': false, 'rooms': myData.rooms}) // broadcast to every sockets but the sender
    });

    socket.on('get_current_room_id', function () {
        //console.log("get current room id");
        // respond to each sender
        if (id in myData.users) {
            let currentRoomId = myData.users[id].current_room_id;
            io.to(id).emit("get_current_room_id_response", currentRoomId);
        } else {
            io.to(id).emit("get_current_room_id_response");
        }
    });

    socket.on('get_room_info', function (room_id) {
        //console.log("get room info");
        let roomId = parseInt(room_id);
        let room = myData.rooms[roomId];
        let creator = room.creator_id != 0 ? myData.users[room.creator_id] : null;
        let onlineUsers = room.user_list.map(userId => myData.users[userId]);
        let banUsers = room.ban_list.map(userId => myData.users[userId]);
        let isCreator = (id == room.creator_id) ? true : false;
        // respond to each sender
        io.to(id).emit("get_room_info_response", {
            "room": room,
            "creator": creator,
            "isCreator": isCreator,
            "online_users": onlineUsers,
            "ban_users": banUsers,
            "avatars": myData.avatars
        });
    });

    socket.on('switch_room', function (data) {
        //console.log("switch room");
        let room_id = parseInt(data['room_id']);
        if (room_id) {
            let msg = '';
            // if room has password
            if (data['hasLock'] == true) {
                let passwordInput = data['password'];
                if (passwordInput != myData.rooms[room_id].password) {
                    msg = "Your password is not correct! Please try again.";
                }
            }
            // check if user is banned from this room
            if (myData.rooms[room_id].ban_list.includes(id)) {
                msg = "You're banned from this room!";
            }
            if (msg == '') {
                msg = "success"
            }
            data['msg'] = msg;
            // send to room joiner
            io.to(id).emit("switch_room_response", data); // respond just to this user
        }
    });

    socket.on('join_room', function (data) {
        //console.log("join room");
        let room_id = parseInt(data['room_id']);
        if (room_id) {
            // join room
            myData.rooms[room_id].user_in(id);
            myData.users[id].current_room_id = room_id;
            // socket join room
            socket.join(room_id);
            // send to room joiner
            io.to(id).emit("join_room_response", {'rooms': myData.rooms, 'operator': true}); // respond just to this user
            // send to other users in the same room
            socket.to(room_id).emit("join_room_response", {'rooms': myData.rooms, 'operator': false}); // send to all users in room except sender
        }
    });

    socket.on('leave_room', function (data) {
        //console.log("leave room");
        if (myData.users.hasOwnProperty(id)) {
            // current user leave current room
            let room_id = myData.users[id].current_room_id;
            // if user set current_room_id
            if (room_id) {
                // socket leave room
                socket.leave(room_id);
                myData.rooms[room_id].user_out(id);
                myData.users[id].current_room_id = null;
            }
            // send to room leaver
            io.to(id).emit("leave_room_response", {'room_id': data['room_id'], 'rooms': myData.rooms, 'operator': true}) // respond just to this user
            // send to other users in the same room
            socket.to(room_id).emit("leave_room_response", {
                'room_id': data['room_id'],
                'rooms': myData.rooms,
                'operator': false
            }); // send to all users in room except sender
        }
    });

    socket.on('send_message', function (data) {
        // sender is current socket user
        let msg = myData.createMessage(myData.msg_id, parseInt(data["room_id"]), id, data["receiver_id"], data["content"], parseInt(data["meme_id"]));
        myData.msg_id++;
        // only send message to current room
        let roomId = myData.users[id].current_room_id;
        if (data['receiver_id'] == 0) {
            io.to(roomId).emit("send_message_response", msg) // broadcast the message to other users
        } else {
            // console.log("sending to only 2 people")
            io.to(id).emit("send_message_response", msg);
            io.to(data['receiver_id']).emit("send_message_response", msg);
        }
    });

    socket.on("start_typing", function () {
        // console.log("start typing", id)
        if (id in myData.users) {
            let roomId = myData.users[id].current_room_id;
            let res = myData.rooms[roomId].user_start_typing(id);
            io.to(roomId).emit("start_typing_response", res);
        }
    })

    socket.on("stop_typing", function () {
        // console.log("stop typing", id)
        let roomId = myData.users[id].current_room_id;
        let res = myData.rooms[roomId].user_stop_typing(id);
        io.to(roomId).emit("stop_typing_response", res);
    })

    socket.on("request_current_users", function (data) {
        let room = myData.rooms[myData.users[id].current_room_id];
        let users = room.user_list;
        // console.log("userlist" + users)
        if (data["exclude_self"]) {
            let otherUsers = [];
            for (let i in users) {
                if (users[i] != id && users[i] != 0) {
                    // console.log(users[i])
                    otherUsers.push(myData.users[users[i]])
                }
            }
            let msg = {"users": otherUsers};
            io.to(id).emit("request_current_users_response", msg)
            // console.log(msg)
        } else {
            let allUsers = [];
            for (let i in users) {
                if (users[i] != 0) {
                    allUsers.push(myData.users[users[i]])
                }
            }
            let msg = {"users": allUsers};
            io.to(id).emit("request_current_users_response", msg)
            // console.log(msg)
        }
    })

    socket.on('check_message_target', function (data) {
        //console.log("check_message_target", id)
        // find sender name
        let sender = myData.users[data['sender_id']];
        let msg = {"sender_name": sender.name, "avatar_id": sender.avatar_id, "avatars": myData.avatars};
        // check if sender is myself
        if (sender.id == id) {
            msg["self"] = true;
        } else {
            msg["self"] = false;
        }
        if (data['meme_id'] != -1) {
            msg["type"] = "meme";
            msg["meme_url"] = myData.memes[data['meme_id']];
        } else {
            msg["type"] = "content";
            msg["content"] = data['content'];
        }
        // send private message to target user
        if (data['receiver_id'] != 0) {
            msg["private"] = true
            msg["receiver_name"] = myData.users[data['receiver_id']].name
            io.to(data['requester']).emit("check_message_target_response", msg)
        } else {  // broadcast the message to other users
            msg['private'] = false
            io.to(id).emit("check_message_target_response", msg)
        }
    });

    socket.on("disconnect", function () {
        if (myData.users.hasOwnProperty(id)) {
            //remove from currentRoom's user_list
            //console.log("destroying user"+id)
            if (myData.users[id].current_room_id) {
                let currentRoom = myData.rooms[myData.users[id].current_room_id]
                currentRoom.user_out(id)
                //remove from users
                delete myData.users[id]
                io.to(currentRoom.id).emit("disconnect_response", myData.rooms);
            }
        }
    })

    socket.on("kick_user", function (userId) {
        //console.log("kick user");
        if (myData.users.hasOwnProperty(userId)) {
            // kicked user leave current room
            let roomToLeave = myData.rooms[myData.users[userId].current_room_id];
            roomToLeave.user_out(userId);
            // kicked user's socket leave room
            io.sockets.sockets.get(userId).leave(roomToLeave.id);
            // kicked user back to lobby
            myData.users[userId].current_room_id = 1;
            // kicked user's socket join room
            io.sockets.sockets.get(userId).join(1);
            myData.rooms[1].user_in(userId);
            // send to kicked user = kicked user leave room
            socket.to(userId).emit("leave_room_response", {'operator': true, 'rooms': myData.rooms});
            // send to all current users in the room (after kicking out)
            io.to(roomToLeave.id).emit("leave_room_response", {'operator': false, 'rooms': myData.rooms});
        }
    })

    socket.on("ban_user", function (userId) {
        //console.log("ban user");
        if (myData.users.hasOwnProperty(userId)) {
            // ban user from this room (creator in)
            let roomToBan = myData.rooms[myData.users[id].current_room_id];
            roomToBan.ban_user(userId);
            //io.to(roomToLeave.id).emit("leave_room_response", {'operator':false, 'rooms':myData.rooms});
        }
    })
});


