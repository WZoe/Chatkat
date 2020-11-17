let socketio;
$(document).ready(function () {
    socketio = io.connect();

    $("#roomList").empty();
    $("#logInModal").modal("show");
    $("#typing").hide();

    // user logins in
    socketio.on("create_user_response",function(rooms) {
        // display all rooms
        displayAllRooms(rooms);
    });

    socketio.on("get_current_room_response",function(roomId) {
        if(roomId!=null){
            $(".roomListItem").removeClass("selected");
            $(".roomListItem#"+roomId).addClass("selected");
        }
    });

    socketio.on("join_room_response",function(data) {
        if(data['msg']=="success"){
            joinRoomSuccess(data['rooms']);
        }
        else{
            // remove previous alerts
            $(".alert").remove();
            $("#joinRoomModalBody").append(`<div class="mt-1 alert alert-danger alert-dismissible fade show" role="alert">
             ${data['msg']}
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>`)
        }
    });

    socketio.on("leave_room_response",function(rooms) {
        clearChatLog();
    });

    // only for room creator
    socketio.on("creator_create_room_response",function() {
        clearChatLog();
    });

    socketio.on("create_room_response",function(rooms) {
        createRoomSuccess(rooms);
    });

    // this response broadcast to all sockets
    socketio.on("send_message_response",function(data) {
        socketio.emit("check_message_target", data);
    });

    socketio.on("start_typing_response", function (data) {
        // change typing status
        if (data.show) {
            $("#typing").show()
        }
        $("#typingName").text(data.user.name)
    })

    socketio.on("stop_typing_response", function (data) {
        // change typing status
        if (data.fade) {
            $("#typing").hide()
        } else {
            $("#typingName").text(data.user.name)
        }
    })


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
    //check empty room name
    let roomname=$("#roomName").val()
    if (roomname == "") {
        // this is cited from https://getbootstrap.com/docs/4.0/components/alerts/#dismissing
        $("#createRoomModalBody").append(`<div class="mt-1 alert alert-danger alert-dismissible fade show" role="alert">
 Room name cannot be empty!
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>`)
    } else {
        $("#createRoomModal").modal("toggle")
        createRoom();
    }
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
        $("#message_input").val("")
    }
}

// user typing
$("#message_input").focus(function () {
    socketio.emit("start_typing");
})

// user end typing
$("#message_input").focusout(function () {
    socketio.emit("stop_typing");
})
