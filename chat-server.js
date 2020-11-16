// Require the packages we will use:
const http = require("http"),
    fs = require("fs"),
    url=require("url"),
    path=require("path");
let myData=require('./myData');

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
        let newUser = new myData.User(id, data["name"], data["avatar_id"])
        myData.users[id] = newUser;
        io.sockets.emit("create_user_response", myData.users) // broadcast the message to other users
    });

    socket.on('send_message', function (data) {
        // This callback runs when the server receives a new message from the client.
        console.log(data); // log it to the Node.JS output
        // sender is current socket user
        let msg = myData.createMessage(data["room_id"], id, data["receiver_id"], data["content"], data["meme_id"])
        io.sockets.emit("send_message_response", msg) // broadcast the message to other users
    });

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

