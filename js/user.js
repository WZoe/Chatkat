function createUser(){
    let userName = $("#nickname").val();
    let avatarId = parseInt($(".form-check-input:checked").val());
    let newUserInfo = {"name":userName,"avatar_id":avatarId};
    socketio.emit("create_user", newUserInfo);
}

