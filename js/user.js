let user_id = 1;
class User{
    constructor(user_name, avatar_id) {
        this.id = user_id;
        this.name = user_name;
        this.avatar_id = avatar_id;
        user_id++;
    }

    change_avatar(avatar_id){
        this.avatar_id = avatar_id;
    }

    send_message(room_id, sender_id, receiver_id, content, meme_id){
        const message = createMessage(room_id, sender_id, receiver_id, content, meme_id);
    }

    create_room(room_name, password, creator_id){
        rooms.push(new Room(room_name, password, creator_id));
    }

}

createUser();
function createUser(){
    // TODO: session
    $("#logInModalSubmit").click(function(){
        let user_name = $("#nickname").val();
        let avatar_id = parseInt($(".form-check-input:checked").attr("id").substring(7,));
        let new_user = new User(user_name, avatar_id)
        users.push(new_user);
        console.log(users);
    });
}