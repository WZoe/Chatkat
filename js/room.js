function createRoom(){
    let roomName = $("#roomName").val();
    let password = $("#password").val();
    let newRoomInfo = {"name":roomName,"password":password};
    socketio.emit("create_room", newRoomInfo);
}

function createRoomSuccess(rooms){
    displayAllRooms(rooms);
    // automatically join the room he created, show chatbox
    displayChatBox();
}

function switchRoom(){
    console.log("switch room")
    $(".roomListItem").click(function(){
        console.log("click to switch to room", this.id)
        // leave current room
        leaveRoom();
        // join new room
        joinRoom();
    })
}

function joinRoom(){
    socketio.emit("join_room", {"room_id":this.id});
}

function leaveRoom(){
    $(".roomListItem").removeClass("selected");
    socketio.emit("leave_room", null);
}

function joinRoomSuccess(room){
    $(".roomListItem#"+room.id).addClass("selected");
    // display chatbox
    displayChatBox();
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
}

function getCurrentRoomId(){
    socketio.emit("get_current_room", null);
}

function displayChatBox(){
    $("#chatBox").empty();
    $("#chatBox").append(`<div class="ml-1 mr-1 p-3" id="chatLog">
            </div>
            <div class="color-primary rounded p-3 ">
            <div class="row ml-1 mr-1 mt-2">
            <!--modified from https://getbootstrap.com/docs/4.0/components/input-group/-->
                <div class="input-group">
                    <div class="input-group-prepend">
                        <button class="btn btn-secondary dropdown-toggle" value="0" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Everyone</button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item" value="0">Everyone</a>
                        </div>
                    </div>
                    <input type="text" class="form-control" id="message_input"/>
                    <div class="input-group-append">
                        <button class="btn btn-secondary" type="button" data-toggle="modal" data-target="#memeModal"><i class="far fa-laugh "></i></button>
                        <button class="btn btn-primary" type="button" id="send">Send</button>
                    </div>
                </div>
            </div>
            </div>`);
}