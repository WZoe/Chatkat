function createRoom(){
    let roomName = $("#roomName").val();
    let password = $("#password").val();
    let newRoomInfo = {"name":roomName,"password":password};
    socketio.emit("create_room", newRoomInfo);
}

function joinRoom(){
    
}