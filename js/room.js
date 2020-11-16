let room_id = 1;
class Room{
    constructor(room_name, password, creator_id) {
        this.id = room_id;
        this.name = room_name;
        this.password = password;
        this.creator_id = creator_id;
        this.user_list = [];
        this.ban_list = [];
        room_id++;
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