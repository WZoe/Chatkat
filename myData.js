// variables
let msg_id = 1;
let room_id = 1;

// arrays
let memes = ["/img/emoji-1.png", "/img/emoji-2.png","/img/emoji-3.png","/img/emoji-4.png","/img/emoji-5.png","/img/emoji-6.png","/img/emoji-7.png","/img/emoji-8.png","/img/emoji-9.png","/img/emoji-10.png","/img/emoji-11.png","/img/emoji-12.png",];
let avatars = ["/img/avatar-1.png","/img/avatar-2.png","/img/avatar-3.png","/img/avatar-4.png","/img/avatar-5.png","/img/avatar-6.png","/img/avatar-7.png","/img/avatar-8.png"];
let users = {};
let rooms = {};

// classes
class User{
    constructor(id, user_name, avatar_id, current_room_id) {
        this.id = id;
        this.name = user_name;
        this.avatar_id = avatar_id;
        this.current_room_id = current_room_id;
    }

    create_message(room_id, receiver_id, content, meme_id){
        const message = createMessage(room_id, this.id, receiver_id, content, meme_id);
        return message;
    }

    create_room(room_name, password, creator_id){
        rooms.push(new Room(room_name, password, creator_id));
    }

}

class Room{
    constructor(room_id, creator_id, room_name, password) {
        this.id = room_id;
        this.name = room_name;
        this.password = password;
        this.creator_id = creator_id;
        this.user_list = [];
        this.ban_list = [];
    }

    getRoom(){
        return this;
    }

    user_in(user_id){
        this.user_list.push(user_id);
    }

    user_out(user_id){
        let remove_idx = this.user_list.indexOf(user_id);
        this.user_list.splice(remove_idx,1);
    }

    ban_user(user_id){
        this.user_out(user_id);
        this.ban_list.push(user_id);
    }
}

// functions
function createMessage(msg_id, room_id, sender_id, receiver_id, content, meme_id){
    const message = {
        "id":msg_id,
        "room_id":room_id,
        "sender_id":sender_id,
        "receiver_id":receiver_id,
        "content":content,
        "meme_id":meme_id
    };
    return message;
}

// exports as module
// variables
exports.msg_id = msg_id;
// arrays
exports.memes = memes;
exports.avatars = avatars;
exports.users = users;
exports.rooms = rooms;
// classes
exports.User = User;
exports.Room = Room;
// functions
exports.createMessage = createMessage;