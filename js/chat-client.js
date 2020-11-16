$(document).ready(function () {
    $("#logInModal").modal("show")
    $("#send").click(sendMessage)
})

// log in modal
$("#logInModalSubmit").click(function () {
    $("#logInModal").modal("toggle")
})

function clearChatLog() {
    $("#chatLog").html("")
}


var socketio = io.connect();
socketio.on("message_to_client",function(data) {
    //Append an HR thematic break and the escaped HTML of the new message
    console.log(data)
    $("#chatLog").append(`
                    <div class="msg msg-self rounded">
                    <div class="col-10">
                        <b>${data['sender_id']}</b>
                        <p>${data['content']}</p>
                    </div>
                    <div class="col-2"><img class="avatar" src="/img/avatar-1.png"/></div>
                </div>`)
});

function sendMessage(){
    let msg = currentUser.create_message(0, 0, document.getElementById("message_input").value, 0)

    socketio.emit("message_to_server", msg);
    console.log(msg);
}

