let socketio;
$(document).ready(function () {
    socketio = io.connect();

    $("#logInModal").modal("show")
    $("#send").click(sendMessage)

    socketio.on("create_user_response",function(users) {
        //console.log("create_user_success",users);
    });

    // this response broadcast to all sockets
    socketio.on("send_message_response",function(data) {
        socketio.emit("check_message_target", data);
    });

    socketio.on("check_message_target_response",function(data) {
        let content = '';
        if(data['type']=='content'){
            content = "<p>"+data['content']+"</p>";
        }
        else{
            content = "<img src='"+data['meme_url']+"' alt='meme'></img>";
        }
        if(data['self']){
            $("#chatLog").append(`
                <div class="msg msg-self rounded">
                <div class="col-10">
                    <b>${data['sender_name']}</b>
                    ${content}
                </div>
                <div class="col-2"><img class="avatar" src="/img/avatar-${data['avatar_id']}.png"/></div>
            </div>`);
        }
       else{
            $("#chatLog").append(`
                <div class="msg rounded">
                <div class="col-2"><img class="avatar" src="/img/avatar-${data['avatar_id']}.png"/></div>
                <div class="col-10">
                    <b>${data['sender_name']}</b>
                    ${content}
                </div>
            </div>`);
       }
    });
})

// log in modal
$("#logInModalSubmit").click(function () {
    $("#logInModal").modal("toggle")
    createUser();
})

function clearChatLog() {
    $("#chatLog").html("")
}

function sendMessage(){
    let msgInfo = {"room_id":0, "receiver_id":0, "content":document.getElementById("message_input").value, "meme_id":-1}
    socketio.emit("send_message", msgInfo);
}

