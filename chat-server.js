// Require the packages we will use:
const http = require("http"),
    fs = require("fs"),
    url=require("url"),
    path=require("path");
let myData=require('./myData');

// create default lobby
let lobby = new myData.Room(myData.room_id, 0, "Lobby", "");
myData.rooms[myData.room_id] = lobby;
myData.room_id++;

const port = 3456;
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html, on port 3456:
const server = http.createServer(function (req, res) {
    // This callback runs when a new connection is made to our HTTP server.
    // modified from https://stackoverflow.com/questions/24582338/how-can-i-include-css-files-using-node-express-and-ejs
    let file = path.join(
        __dirname,
        req.url === "/" ? "index.html" : req.url
    );
    console.log(file)
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
        // This callback runs when the server receives a new message from the client.
        console.log(data); // log it to the Node.JS output
        // create user
        let newUser = new myData.User(id, data["name"], data["avatar_id"], 1);

        lobby.user_list.push(newUser);
        socket.join(1);

        myData.users[id] = newUser;
        io.sockets.sockets.get(id).emit("create_user_response", myData.rooms) // broadcast the message to other users

        //todo: update Lobby current Users for non-new user
    });

    socket.on('create_room', function (data) {
        // This callback runs when the server receives a new message from the client.
        console.log(data); // log it to the Node.JS output
        // create room
        let newRoom = new myData.Room(myData.room_id, id, data["name"], data["password"]);
        // leave room
        socket.leave(myData.users[id].current_room_id);
        // add creator to user list
        newRoom.user_list.push(myData.users[id]);
        myData.rooms[myData.room_id] = newRoom;
        // set user current room id
        myData.users[id].current_room_id = myData.room_id;
        // socket join room
        socket.join(myData.room_id);
        myData.room_id++;
        io.sockets.sockets.get(id).emit("create_room_response", newRoom) // broadcast the message to other users

        // todo: update room list for other non-creator users
    });

    socket.on('send_message', function (data) {
        // This callback runs when the server receives a new message from the client.
        console.log(data); // log it to the Node.JS output
        // sender is current socket user
        let msg = myData.createMessage(myData.msg_id, data["room_id"], id, data["receiver_id"], data["content"], data["meme_id"]);
        myData.msg_id++;
        // only send message to current room
        let roomId = myData.users[id].current_room_id;
        io.to(roomId).emit("send_message_response", msg) // broadcast the message to other users
    });
    
    socket.on("start_typing", function () {
        let roomId = myData.users[id].current_room_id;
        let res = myData.rooms[roomId].user_start_typing(id);
        io.to(roomId).emit("start_typing_response", res);
    })

    socket.on("stop_typing", function () {
        let roomId = myData.users[id].current_room_id;
        let res = myData.rooms[roomId].user_stop_typing(id);
        io.to(roomId).emit("stop_typing_response", res);
    })

    socket.on('check_message_target', function (data) {
        // This callback runs when the server receives a new message from the client.
        console.log(data); // log it to the Node.JS output
        // find sender name
        let sender = myData.users[data['sender_id']];
        let msg={"sender_name":sender.name, "avatar_id":sender.avatar_id};
        // check if sender is myself
        if(sender.id == id){
            msg["self"] = true;
        }
        else{
            msg["self"] = false;
        }
        if(data['meme_id']!=-1){
            msg["type"] = "meme";
            msg["meme_url"] = myData.memes[data['meme_id']];
        }
        else{
            msg["type"] = "content";
            msg["content"] = data['content'];
        }
        // send private message to target user
        if(data['receiver_id']!=null){
            data['receiver_id'] = id;  // just for test purpose
            // io.sockets.sockets is a map object
            io.sockets.sockets.get(data['receiver_id']).emit("check_message_target_response", msg)
        }
        else{  // broadcast the message to other users
            io.sockets.emit("check_message_target_response", msg)
        }
    });
});


