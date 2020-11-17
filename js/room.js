function createRoom(){
    let roomName = $("#roomName").val();
    let password = $("#password").val();
    let newRoomInfo = {"name":roomName,"password":password};
    socketio.emit("create_room", newRoomInfo);
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
    socketio.emit("leave_room");
}

function joinRoomSuccess(rooms){
    $("#joinRoomModal").modal("hide");
    displayAllRooms(rooms);
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
    // get current room id
    getCurrentRoomId();
    // enable switch room
    switchRoom();
    // change "send to" to "everyone"
    $(".dropdown-toggle").text("Everyone")
    $(".dropdown-toggle").val(0)
}

function getCurrentRoomId(){
    socketio.emit("get_current_room_id");
}

function showRHSInfo(data){
    let room = data['room'];
    let creator_name = data['creator']!=null ? data['creator'].name:"Chatkat";
    let onlineUsers = data['online_users'];
    let bannedUsers = data['ban_users'];
    let avatars = data['avatars'];
    let isCreator = data['isCreator'];
    $("#showRoomInfoName").html(room.name);
    $("#creator").html(creator_name);
    $("#onlineUsers").empty();
    for(let i in onlineUsers){
        let user = onlineUsers[i];
        let creatorContent = '';
        if(isCreator==true && user.id!=data['creator'].id){
            creatorContent = `<div class=\"userControl btn-group-sm\">\n 
                <button class=\"btn btn-secondary kick-user\" id='${user.id}'>Kick</button>\n
                <button class=\"btn btn-danger ban-user\" id='${user.id}'>Ban</button>\n </div>`;
        }
        $("#onlineUsers").append(`<div class="user m-2">
                    <p class="text-center m-0"><img class="avatar" src="${avatars[user.avatar_id]}"/></p>
                    <p class="text-center m-0">${user.name}</p>
                    ${creatorContent}
                </div>`);
    }
    // give creator rights to kick and ban user
    if(isCreator==true){
        kickUser();
        banUser();
    }
    $("#bannedUsers").empty();
    for(let i in bannedUsers){
        let user = bannedUsers[i];
        $("#bannedUsers").append(`<div class="user m-2">
                    <img class="avatar" src="${avatars[user.avatar_id]}"/>
                    <p>${user.name}</p>
                </div>`);
    }
}

function kickUser(){
    $(".kick-user").click(function(){
        socketio.emit("kick_user", this.id);
    })
}

function banUser(){
    $(".ban-user").click(function(){
        socketio.emit("kick_user", this.id);
        socketio.emit("ban_user", this.id);
    })
}