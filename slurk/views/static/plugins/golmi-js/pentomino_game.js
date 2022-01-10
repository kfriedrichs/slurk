$(document).ready(function () {
    // for debugging: log all events
    socket.onAny((eventName, ...args) => {
        console.log("SLURK_SOCKET: ", eventName, args);
    });


    // request the Golmi URL to connect to
    socket.emit(
        "golmi_request_url"
    );

    socket.on("golmi_send_url", (data) => {
        const MODEL = data.url;

        // --- create a socket --- //
        var golmi_socket = io(MODEL, {
            auth: { "password": "GiveMeTheBigBluePasswordOnTheLeft" }
        });
        golmi_socket.onAny((eventName, ...args) => {
            console.log("GOLMI_SOCKET: ", eventName, args);
        });

        // --- controller --- //
        // create a controller and wait until the model assigns a gripper
        let controller = new document.LocalKeyController();
        controller.awaitGripperFrom(golmi_socket);

        // --- view --- // 
        // Get references to the three canvas layers
        let bgLayer     = document.getElementById("background");
        let objLayer    = document.getElementById("objects");
        let grLayer     = document.getElementById("gripper");

        // Set up the view js, this also sets up key listeners
        const layerView = new document.LayerView(golmi_socket, bgLayer, objLayer, grLayer);

        // --- logger --- //
        const logView = new document.LogView(golmi_socket);

        // --- socket communication --- //
        socket.on("send_private_data", (login) => {
            // reset the controller in case any key is currently pressed
            controller.resetKeys()
            if (login["room_id"] && login["role"]) {
                golmi_socket.emit("join_game", login);
            } else {
                console.log(
                    "Error: Missing correct Golmi login parameters.\n" +
                    `Received room_id: ${login["room_id"]} and role: ${login["role"]}`
                );
            }
        })

        golmi_socket.on("connect", () => {
            console.log(`Connected to model server at ${MODEL}`);
        });

        golmi_socket.on("disconnect", () => {
            // reset the controller in case any key is currently pressed
            controller.resetKeys();
            // disconnect the controller
            controller.detachFrom(golmi_socket);
            // Send the logged data to the server
            logView.sendData("/pentomino_game/save_log");
            console.log(`Disconnected to model server at ${MODEL}`);
        });
    });    
}); // on document ready end
