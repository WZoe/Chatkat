function createRoom(){
    let roomName = $("#roomName").val();
    let password = $("#password").val();
    let newRoomInfo = {"name":roomName,"password":password};
    socketio.emit("create_room", newRoomInfo);
}

function createRoomSuccess(rooms){
    displayAllRooms(rooms);
}

function switchRoom(){
    $(".roomListItem").click(function(){
        let newRoomId = this.id;
        let hasLock = false;
        if($(this).children().find('i').hasClass('fa-lock')){
            hasLock = true;
        }
        // leave current room
        leaveRoom();
        // join new room
        joinRoom(newRoomId, hasLock);
    })
}

function joinRoom(newRoomId, hasLock){
    if(hasLock==true){
        // remove previous alerts
        $(".alert").remove();
        // show modal
        $("#joinRoomModal").modal("show");
        $("#joinRoomModalSubmit").click(function (){
            let passwordInput = $("#joinRoomPassword").val();
            // remove previous alerts
            $(".alert").remove();
            // password can't be empty!
            if(passwordInput==''){
                $("#joinRoomModalBody").append(`<div class="mt-1 alert alert-danger alert-dismissible fade show" role="alert">
             Password cannot be empty!
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>`)
            }
            else{
                socketio.emit("join_room", {"room_id":newRoomId, "hasLock":hasLock, "password":passwordInput});
            }
        });
    }
    else{
        socketio.emit("join_room", {"room_id":newRoomId, "hasLock":hasLock});
    }
}

function leaveRoom(){
    $(".roomListItem").removeClass("selected");
    socketio.emit("leave_room", null);
}

function joinRoomSuccess(rooms){
    $("#joinRoomModal").modal("hide");
    displayAllRooms(rooms);
    //$(".roomListItem#"+room.id).addClass("selected");
}

// call when first login & every time creates a new room
function displayAllRooms(rooms){
    $("#roomList").empty();
    for(let roomId in rooms){
        let room = rooms[roomId];
        let lockClass = (room.password == null || room.password=='') ? "fa-lock-open":"fa-lock";
        $("#roomList").append(`
        <div class="ml-3 mr-3 mb-2 color-white rounded full-width p-2 roomListItem" id=${room.id}>
            <div class="row">
                <i class="ml-5 mr-2 fas ${lockClass} fa-2x"></i>
                <h4>${room.name}</h4>
            </div>
        </div>`);
    }
    getCurrentRoomId();
    // enable switch room
    switchRoom();
    // change "send to" to "everyone"
    $(".dropdown-toggle").text("Everyone")
    $(".dropdown-toggle").val(0)
}

function getCurrentRoomId(){
    socketio.emit("get_current_room_id", null);
}

function showRHSInfo(data){
    let room = data['room'];
    let creator_name = data['creator']!=null ? data['creator'].name:"Chatkat";
    let onlineUsers = data['online_users'];
    let banUsers = data['ban_users'];
    $("#showRoomInfoName").html(room.name);
    $("#creator").html(creator_name);
    $("#onlineUsers").empty();
    for(let i in onlineUsers){
        let user = onlineUsers[i];
        $("#onlineUsers").append(`<div class="user m-2">
                    <img class="avatar" src="${user.avatar_id}"/>
                    <p>${user.name}</p>
                    <div class="userControl btn-group-sm">
                        <button class="btn btn-secondary">Kick</button>
                        <button class="btn btn-danger">Ban</button>
                    </div>
                </div>`);
    }

}