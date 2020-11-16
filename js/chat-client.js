let socketio;
$(document).ready(function () {
    socketio = io.connect();

    $("#logInModal").modal("show")

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
            content = "<p><img class='meme' src='"+data['meme_url']+"' alt='meme'/></p>";
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
       // scroll to bottom
        $("#chatLog").scrollTop($("#chatLog")[0].scrollHeight);
    });
})

// log in modal
$("#logInModalSubmit").click(function () {
    // check empty nickname
    let nickname=$("#nickname").val()
    if (nickname == "") {
        console.log("yeah")
        // this is cited from https://getbootstrap.com/docs/4.0/components/alerts/#dismissing
        $("#logInModalBody").append(`<div class="mt-1 alert alert-danger alert-dismissible fade show" role="alert">
 Nickname cannot be empty!
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>`)
    } else {
        createUser();
        $("#logInModal").modal("toggle")
    }
})

// send msg
$("#send").click(sendMessage)

// send meme
$(".memebtn").click(function () {
    let msgInfo = {"room_id":0, "receiver_id":0, "content":"", "meme_id":this.value-1}
    socketio.emit("send_message", msgInfo);
    $("#memeModal").modal("toggle")
})

// send to js behavior
$(".dropdown-toggle").click(function () {
    // request current user list

    // change drop down item, bond value & bond dropdown toggle value
    // value=0 means everyone
})

$("#createRoomModalSubmit").click(function(){
    $("#createRoomModal").modal("toggle")
    createRoom();
})

function clearChatLog() {
    $("#chatLog").html("")
}

function sendMessage(){
    //check empty msg
    let msg = document.getElementById("message_input").value;
    if (msg) {
        let msgInfo = {"room_id":0, "receiver_id":0, "content":msg, "meme_id":-1};
        socketio.emit("send_message", msgInfo);
    }
}

