### How to use Golmi in Slurk (preliminary)
0. Download *slurk*, *slurk-bots*, and *golmi* to the same directory and navigate into the slurk directory:
```sh
    $ ls
    golmi  slurk slurk-bots
    $ cd slurk
```
1. Build the slurk docker image (make sure docker is running!):
```sh
    $ docker build --tag "slurk/server" -f Dockerfile .
```
2. Set the environment variables SLURK_DOCKER, SLURK_GOLMI_PORT and SLURK_GOLMI_PORT:
```sh
    $ export SLURK_DOCKER=slurk
    $ export SLURK_GOLMI_URL=http://127.0.0.1
    $ export SLURK_GOLMI_PORT=2000
```
3. Start the slurk server:
```sh
    $ ./scripts/start_server.sh
``` 
4. In a new terminal tab, navigate into the golmi directory. **! Make sure you are
using the `game` branch!** Create an environment for golmi:
```sh
    $ cd ../golmi
    $ conda create --name golmi python=3.9
    $ conda activate golmi
    $ pip install -r requirements.txt
``` 

Or, alternatively, using venv (assuming python3.9 is installed on your system):
```sh
    $ cd ../golmi
    $ python3.9 -m venv golmi
    $ . golmi/bin/activate
    $ pip install -r requirements.txt
``` 

5. Start the golmi server:
```sh
    $ python run.py --port 2000
``` 
6. Return to your slurk terminal.
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
9. Create golmi tokens for a player (here: using the instruction follower role):
```sh
    $ IF_TOKEN=$(scripts/create_room_token.sh $GOLMI_ROOM_ID ../slurk-bots/golmibot/golmi_if_permissions.json | jq -r .id)
    $ echo $IF_TOKEN
    91d4e737-fa0d-4dbb-8069-7d9b2568f0dd
``` 

10. Navigate to `localhost:5000` (if you are using the default host and port for
slurk) in a browser and enter a user name and your IF_TOKEN.
The example golmi layout should be displayed on the right.
**Note that in the current state, only a rectangle will be displayed.** To start a
game, additional messages need to be sent to the golmi server, essentially creating
and starting a game.

##### Multiplayer settings

Creating multiple player tokens and letting them join the room (e.g., by navigating
to localhost:5000 in a private browser window or different browser) allows them to
see the same board. Assigning different role using the permission files allows to have
different views on the same game.

See the [golmibot README](https://github.com/clp-research/slurk-bots/tree/master/golmibot#readme)
for a task setup, using the golmibot to configure and start a game at the
golmi server.