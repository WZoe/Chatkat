$(document).ready(function () {
    $("#logInModal").modal("show")
    $("#send").click(sendMessage)
})

// log in modal
$("#logInModalSubmit").click(function () {
    $("#logInModal").modal("toggle")
})


var socketio = io.connect();
socketio.on("message_to_client",function(data) {
    //Append an HR thematic break and the escaped HTML of the new message
    $("#chatLog").append(`
                    <div class="msg msg-self rounded">
                    <div class="col-10">
                        <b>USERNAME</b>
                        <p>${data['message']}</p>
                    </div>
                    <div class="col-2"><img class="avatar" src="/img/avatar-1.png"/></div>
                </div>`)
});

function sendMessage(){
    var msg = document.getElementById("message_input").value;
    socketio.emit("message_to_server", {message:msg});
}

