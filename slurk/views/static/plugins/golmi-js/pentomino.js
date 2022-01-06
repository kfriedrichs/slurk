$(document).ready(function () {
    // for debugging: log all events
    socket.onAny((eventName, ...args) => {
        console.log(eventName, args);
    });

    // request the Golmi URL to connect to
    socket.emit(
        "golmi_request_url"
    );

    socket.on("golmi_send_url", (data) => {
        const MODEL = data.url;

        // --- create a socket --- //
        var socket = io(MODEL, {
            auth: { "password": "GiveMeTheBigBluePasswordOnTheLeft" }
        });

        // --- controller --- //
        // create a controller
        // a gripper will be attached to it automatically once we connect to Golmi
        let controller = new document.LocalKeyController();

        // --- view --- // 
        // Get references to the three canvas layers
        let bgLayer     = document.getElementById("background");
        let objLayer    = document.getElementById("objects");
        let grLayer     = document.getElementById("gripper");

        // Set up the view js, this also sets up key listeners
        const layerView = new document.LayerView(socket, bgLayer, objLayer, grLayer);

        // --- logger --- //
        const logView = new document.LogView(socket);

        // --- socket communication --- //
        socket.on("send_private_data", (login) => {
            // reset the controller in case any key is currently pressed
            controller.resetKeys()
            if (login["room_id"] && login["role"]) {
                socket.emit("join", login);
            } else {
                console.log(
                    "Error: Missing correct Golmi login parameters.\n" +
                    `Received: ${login}`
                );
            }
        })

        socket.on("connect", () => {
            console.log(`Connected to model server at ${MODEL}`);
        });

        socket.on("disconnect", () => {
            // reset the controller in case any key is currently pressed
            controller.resetKeys();
            // disconnect the controller
            controller.detachModel(socket);
            // Send the logged data to the server
            logView.sendData("/pentomino/save_log");
            console.log(`Disconnected to model server at ${MODEL}`);
        });
    });    
}); // on document ready end
