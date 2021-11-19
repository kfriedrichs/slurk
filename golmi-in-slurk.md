### How to use Golmi in Slurk (preliminary)
0. Download *slurk* and *golmi* to the same directory and navigate into the slurk directory:
```sh
    $ ls
    golmi  slurk
    $ cd slurk
```
1. Build the slurk docker image (make sure docker is running!):
```sh
    $ docker build --tag "slurk/server" -f Dockerfile .
```
2. Set the environment variables SLURK_DOCKER, SLURK_GOLMI_PORT and SLURK_GOLMI_PORT:
```sh
    $ export SLURK_DOCKER=slurk
    $ export SLURK_GOLMI_URL=127.0.0.1
    $ export SLURK_GOLMI_PORT=2000
```
3. Start the slurk server:
```sh
    $ ./scripts/start_server.sh
``` 
4. Navigate into the golmi directory and create an environment for golmi:
```sh
    $ cd ../golmi
    $ conda create --name golmi python=3.9
    $ conda activate golmi
    $ pip install -r requirements.txt
``` 
5. Start the golmi server:
```sh
    $ python run.py --port 2000
``` 
6. Open a new terminal and navigate into the slurk folder.
7. Create the golmi layout:
```sh
    $ GOLMI_ROOM_LAYOUT_ID=$(scripts/create_layout.sh examples/golmi_layout.json | jq .id)
    $ echo $GOLMI_ROOM_LAYOUT_ID
    1
``` 
8. Create the golmi room:
```sh
    $ GOLMI_ROOM_ID=$(scripts/create_room.sh $GOLMI_ROOM_LAYOUT_ID | jq .id)
    $ echo $GOLMI_ROOM_ID
    1
``` 
9. Create the golmi token:
```sh
    $ GOLMI_TOKEN=$(scripts/create_room_token.sh $GOLMI_ROOM_ID examples/message_permissions.json | jq -r .id)
    $ echo $GOLMI_TOKEN
    6ca65ebe-8090-43ea-942e-27c1b074b312
``` 

10. Navigate to `localhost:5000` (if you are using the default host and port for slurk) in a browser, the example golmi layout
should be displayed on the right.

##### A note on multiplayer GOLMI setups

GOLMI has not yet implemented multiple players accessing the same
board. 
For this setting, members of the same *slurk room* also need
to be assigned the same *GOLMI room*, perhaps by passing some
shared slurk parameter upon connection to GOLMI.