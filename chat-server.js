// Require the packages we will use:
const http = require("http"),
    fs = require("fs"),
    url=require("url"),
    path=require("path");

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

    socket.on('message_to_server', function (data) {
        // This callback runs when the server receives a new message from the client.

        console.log(data); // log it to the Node.JS output
        io.sockets.emit("message_to_client", data) // broadcast the message to other users
    });
});