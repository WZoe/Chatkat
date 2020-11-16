// message
let msg_id = 1;
function createMessage(room_id, sender_id, receiver_id, content, meme_id){
    const message = {
        "id":msg_id,
        "room_id":room_id,
        "sender_id":sender_id,
        "receiver_id":receiver_id,
        "content":content,
        "meme_id":meme_id
    };
    msg_id++;
    return message;
}


// arrays
let memes = [];
let avatars = [];
let users = [];
let rooms = [];
