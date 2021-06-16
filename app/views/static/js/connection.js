let socket;

let self_user = undefined;
let self_room = undefined;
let user_map = {}

function apply_user_permissions(permissions) {
    $('#type-area').fadeTo(null, permissions.send_message || permissions.send_image || permissions.send_command);
}

function verify_query(success, message) {
    if (!success) {
        if (message === "invalid session id") {
            // Reload page if user is not logged in
            window.location.reload();
        } else {
            console.error(message)
        }
        return false;
    }
    return true;
}

function headers(xhr) {
    xhr.setRequestHeader("Authorization", "Bearer " + TOKEN);
}

$(document).ready(() => {
    let uri = location.protocol + '//' + document.domain + ':' + location.port + "/slurk/api";
    socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    function apply_layout(layout) {
        if (!layout)
            return;
        if (layout.html !== "") {
            $("#sidebar").html(layout.html);
        } else {
            $("#sidebar").empty();
        }
        if (layout.css !== "") {
            $("#custom-styles").html(layout.css);
        } else {
            $("#custom-styles").empty();
        }
        if (layout.script !== "") {
            window.eval(layout.script);
        }
        $("#title").text(layout.title);
        $("#subtitle").text(layout.subtitle);
        if (layout.read_only) {
            $('#text').prop('readonly', true).prop('placeholder', 'This room is read-only');
        } else {
            $('#text').prop('readonly', false).prop('placeholder', 'Enter your message here!');
        }

        $('#user-list').fadeTo(null, layout.show_users);
        $('#latency').fadeTo(null, layout.show_latency);
        if (layout.show_latency) {
            setInterval(() => {
                const start = Date.now();
                socket.volatile.emit("ping", () => {
                    $("#ping").text(Date.now() - start);
                });
            }, 5000);
        }
    }

    async function updateUsers() {
        let request = $.get({ url: uri + "/rooms/" + self_room + "/users", beforeSend: headers });
        users = await request
        let current_users = "";
        let tmp_user_map = {}
        for (let i in users) {
            tmp_user_map[users[i].id] = users[i].name
            if (users[i].id !== self_user.id && users[i].session_id !== null) {
                current_users += users[i].name + ', ';
            }
        }
        $('#current-users').text(current_users + "You");
        user_map = tmp_user_map
    }

    async function joined_room(data) {
        self_room = data['room'];

        let room_request = $.get({ url: uri + "/rooms/" + self_room, beforeSend: headers });
        let user_request = $.get({ url: uri + "/users/" + data.user, beforeSend: headers });
        let history_request = $.get({ url: uri + "/rooms/" + data.room + "/users/" + data.user + '/logs', beforeSend: headers });
        let token_request = $.get({ url: uri + "/tokens/" + TOKEN, beforeSend: headers });


        let room = await room_request;
        let layout_request = $.get({ url: uri + "/layouts/" + room.layout_id, beforeSend: headers });

        let user = await user_request;
        self_user = { id: user.id, name: user.name };

        update_user_request = updateUsers();

        token = await token_request
        let permissions_request = $.get({ url: uri + "/permissions/" + token.permissions_id, beforeSend: headers });

        await update_user_request
        apply_layout(await layout_request);
        if (typeof print_history !== "undefined") {
            $("#chat-area").empty();
            logs = await history_request;
            for (let i = 0; i < logs.length; i++) {
                user_id = logs[i].user_id
                logs[i].user = { name: user_map[user_id], id: user_id }
                print_history(logs[i])
            }
        }

        apply_user_permissions(await permissions_request)
    }

    async function left_room(data) {
        console.warn("Disconnected!")
        // socket.disconnect()
        $('#text').prop('readonly', true).prop('placeholder', 'Disconnected!')
        $('#user-list').fadeTo(null, false);
        $('#latency').fadeTo(null, false);
    }

    socket.on('joined_room', joined_room);
    socket.on('left_room', left_room);

    socket.on('status', function (data) {
        if (typeof self_user === "undefined")
            return;
        switch (data.type) {
            case "join":
                updateUsers();
                break;
            case "leave":
                updateUsers();
                break;
        }
    });
});
