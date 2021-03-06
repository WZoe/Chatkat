// variables
let msg_id = 1;
let room_id = 1;

// arrays
let memes = ["/img/emoji-1.png", "/img/emoji-2.png", "/img/emoji-3.png", "/img/emoji-4.png", "/img/emoji-5.png", "/img/emoji-6.png", "/img/emoji-7.png", "/img/emoji-8.png", "/img/emoji-9.png", "/img/emoji-10.png", "/img/emoji-11.png", "/img/emoji-12.png",];
let avatars = ["/img/avatar-1.png", "/img/avatar-2.png", "/img/avatar-3.png", "/img/avatar-4.png", "/img/avatar-5.png", "/img/avatar-6.png", "/img/avatar-7.png", "/img/avatar-8.png"];
let users = {};
let rooms = {};

// classes
class User {
    constructor(id, user_name, avatar_id, current_room_id) {
        this.id = id;
        this.name = user_name;
        this.avatar_id = avatar_id;
        this.current_room_id = current_room_id;
    }
}

class Room {
    constructor(room_id, creator_id, room_name, password) {
        this.id = room_id;
        this.name = room_name;
        this.password = password;
        this.creator_id = creator_id;
        // lists that store user_ids
        this.user_list = [creator_id];
        this.ban_list = [];
        this.typing = [];
    }

    user_start_typing(user_id) {
        this.typing.push(user_id);
        let last = this.typing[this.typing.length - 1];
        // console.log(this.typing)
        if (this.typing.length === 1) {
            // return true when it's the first user typing
            return {"show": true, "fade": false, "user": users[last]};
        }
        return {"show": false, "fade": false, "user": users[last]};
    }

    user_stop_typing(user_id) {
        let idx = this.typing.indexOf(user_id);
        this.typing.splice(idx, 1);
        // console.log(this.typing)
        if (this.typing.length === 0) {
            return {"show": false, "fade": true};
        } else {
            let last = this.typing[this.typing.length - 1];
            return {"show": false, "fade": false, "user": users[last]};
        }

    }

    user_in(user_id) {
        if (!this.user_list.includes(user_id)) {
            this.user_list.push(user_id);
        }
    }

    user_out(user_id) {
        let remove_idx = this.user_list.indexOf(user_id);
        this.user_list.splice(remove_idx, 1);
    }

    ban_user(user_id) {
        this.ban_list.push(user_id);
    }
}

// functions
function createMessage(msg_id, room_id, sender_id, receiver_id, content, meme_id) {
    const message = {
        "id": msg_id,
        "room_id": room_id,
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "content": content,
        "meme_id": meme_id
    };
    return message;
}

// exports as module
// variables
exports.msg_id = msg_id;
exports.room_id = room_id;
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