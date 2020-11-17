let socketio;

$(document).ready(function () {
    socketio = io.connect();

    $("#roomList").empty();
    $("#logInModal").modal("show");
    $("#typing").hide();

    // user login
    socketio.on("create_user_response", function (rooms) {
        // display all rooms
        displayAllRooms(rooms);
    });

    // user logout
    socketio.on("disconnect_response", function (rooms) {
        // update all rooms
        displayAllRooms(rooms);
    });

    socketio.on("get_current_room_id_response", function (roomId) {
        if (roomId != null) {
            $(".roomListItem").removeClass("selected");
            $(".roomListItem#" + roomId).addClass("selected");
            // show RHS info
            socketio.emit("get_room_info", roomId);
        }
    });

    socketio.on("get_room_info_response", function (data) {
        // display all rooms
        console.log(data)
        showRHSInfo(data);
    });

    socketio.on("join_room_response", function (data) {
        console.log("join room response", data)
        if (data['operator'] == true) {
            if (data['msg'] == "success") {
                joinRoomSuccess(data['rooms']);  // include display all rooms
            } else {
                // join room failed, join back to lobby
                socketio.emit("join_room", {"room_id": 1, "hasLock": false});
                let modalBody;
                if ($("#joinRoomModal").hasClass('in')) {
                    modalBody = $("#joinRoomModalBody");
                } else {
                    $("#joinRoomAlertModal").modal("show");
                    modalBody = $("#joinRoomAlertModalBody");
                }
                // remove previous alerts
                $(".alert").remove();
                modalBody.append(`<div class="mt-1 alert alert-danger alert-dismissible fade show" role="alert">
             ${data['msg']}
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>`)
            }
        } else {
            displayAllRooms(data['rooms']);
        }
    });

    socketio.on("leave_room_response", function (data) {
        console.log("leave room response", data);
        if (data['operator'] == true) {
            clearChatLog();
        }
        displayAllRooms(data['rooms']);
    });

    socketio.on("create_room_response", function (data) {
        if (data['operator'] == true) {
            clearChatLog();
        }
        displayAllRooms(data['rooms']);
    });

    // this response broadcast to all sockets
    socketio.on("send_message_response", function (data) {
        data["requester"] = socketio.id;
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


    socketio.on("check_message_target_response", function (data) {
        console.log(data)
        let content = '';
        if (data['type'] == 'content') {
            content = "<p>" + data['content'] + "</p>";
        } else {
            content = "<p><img class='meme' src='" + data['meme_url'] + "' alt='meme'/></p>";
        }
        let avatars = data['avatars'];
        if (data['self']) {
            if (data["private"]) {
                $("#chatLog").append(`
                <div class="msg msg-self rounded">
                <div class="col-10">
                    <b>You said to ${data["receiver_name"]} in private</b>
                    ${content}
                </div>
                <div class="col-2"><img class="avatar" src="${avatars[data['avatar_id']]}"/></div>
            </div>`);
            } else {
                $("#chatLog").append(`
                <div class="msg msg-self rounded">
                <div class="col-10">
                    <b>${data['sender_name']}</b>
                    ${content}
                </div>
                <div class="col-2"><img class="avatar" src="${avatars[data['avatar_id']]}"/></div>
            </div>`);
            }
        } else {
            if (data["private"]) {
                $("#chatLog").append(`
                <div class="msg rounded">
                <div class="col-2"><img class="avatar" src="${avatars[data['avatar_id']]}"/></div>
                <div class="col-10">
                    <b>${data['sender_name']} said to you in private:</b>
                    ${content}
                </div>
            </div>`);
            } else {
                $("#chatLog").append(`
                <div class="msg rounded">
                <div class="col-2"><img class="avatar" src="${avatars[data['avatar_id']]}"/></div>
                <div class="col-10">
                    <b>${data['sender_name']}</b>
                    ${content}
                </div>
            </div>`);
            }

        }
        // scroll to bottom
        $("#chatLog").scrollTop($("#chatLog")[0].scrollHeight);
    });
})

// log in modal
$("#logInModalSubmit").click(function () {
    // check empty nickname
    let nickname = $("#nickname").val()
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
    let receiver_id = $(".dropdown-toggle").val()
    let msgInfo = {"room_id": 0, "receiver_id": receiver_id, "content": "", "meme_id": this.value - 1}
    socketio.emit("send_message", msgInfo);
    $("#memeModal").modal("toggle")
})

// send to js behavior
$(".dropdown-toggle").click(function () {
    // request current user list
    socketio.emit("request_current_users", {"exclude_self": true});

    socketio.on("request_current_users_response", function (data) {
        // change drop down item, bond value & bond dropdown toggle value
        let users = data["users"];
        $(".dropdown-menu").html(`<a class="dropdown-item" value="0">Everyone</a>`)
        let cnt = 1;
        for (let i in users) {
            let user = users[i]
            console.log(user)
            $(".dropdown-menu").append(`
            <a class="dropdown-item" value="${user.id}">${user.name}</a>
            `)
            cnt++;
        }

        $(".dropdown-item").click(function () {
            let id = this.getAttribute("value")
            let name = this.innerText
            $(".dropdown-toggle").text(name)
            $(".dropdown-toggle").val(id)
        })
        // value=0 means everyone
    });
})

$("#createRoomModalSubmit").click(function () {
    //check empty room name
    let roomname = $("#roomName").val()
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
        // scroll to bottom
        $("#roomList").scrollTop($("#roomList")[0].scrollHeight);
    }
})

function clearChatLog() {
    $("#chatLog").html("")
}

function sendMessage() {
    //check empty msg
    let msg = document.getElementById("message_input").value;
    let receiver_id = $(".dropdown-toggle").val()
    if (msg) {
        let msgInfo = {"room_id": 0, "receiver_id": receiver_id, "content": msg, "meme_id": -1};
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
