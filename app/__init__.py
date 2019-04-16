import sys

from flask import Flask, request, g
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, current_user
from flask_socketio import SocketIO

from .settings import Settings

socketio = SocketIO(ping_interval=5, ping_timeout=120, async_mode="gevent")

app = Flask(__name__)
app.config.from_object('config')

db = SQLAlchemy(app)
settings = Settings.from_object('config')
login_manager = LoginManager()

from .login import login as login_blueprint
from .admin import admin as admin_blueprint
from .chat import chat as chat_blueprint
app.register_blueprint(login_blueprint)
app.register_blueprint(admin_blueprint)
app.register_blueprint(chat_blueprint)

db.drop_all()
db.create_all()
login_manager.init_app(app)
login_manager.login_view = 'login.index'
socketio.init_app(app)


@login_manager.user_loader
def load_user(id):
    from .models.user import User
    return User.query.get(int(id))


@app.before_request
def before_request():
    if not current_user.is_authenticated and request.endpoint != 'login.index' and request.endpoint != "static"\
            or request.endpoint == 'admin.token' and not current_user.token.permissions.token_generate:
        return login_manager.unauthorized()


from .models.room import Room
from .models.token import Token
from .models.layout import Layout
from .models.permission import Permissions

if not Room.query.get("test_room"):
    admin_token = Token(room_name='test_room',
                        id='00000000-0000-0000-0000-000000000000' if settings.debug else None,
                        permissions=Permissions(query_user=True,
                                                query_room=True,
                                                query_permissions=True,
                                                query_layout=True,
                                                message_text=True,
                                                message_image=True,
                                                message_command=True,
                                                message_history=True,
                                                message_broadcast=True,
                                                token_generate=True,
                                                token_invalidate=True))
    db.session.add(admin_token)
    db.session.add(Token(room_name='test_room',
                         id='00000000-0000-0000-0000-000000000001' if settings.debug else None,
                         permissions=Permissions(query_user=True,
                                                 query_room=True,
                                                 query_permissions=True,
                                                 query_layout=True,
                                                 message_text=True,
                                                 message_image=True,
                                                 message_command=True,
                                                 message_history=True,
                                                 message_broadcast=True,
                                                 token_generate=True,
                                                 token_invalidate=True)))
    db.session.add(Room(name="test_room",
                        label="Test Room",
                        static=True,
                        layout=Layout.from_json_file("test_room")))
    db.session.commit()
    print("generating test room and admin token...")
print("admin token:")
print(Token.query.order_by(Token.date_created).first().id)
sys.stdout.flush()