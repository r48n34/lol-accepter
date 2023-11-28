
from lcu_driver import Connector

import sys
from time import sleep
from PyQt5.QtWidgets import QApplication, QLabel, QWidget, QCheckBox
from PyQt5.QtCore import QThread

app = QApplication(sys.argv)

Form = QWidget()
Form.setWindowTitle('lol accepter')
Form.resize(350, 120)

# Top labels
status_label = QLabel(Form)

status_label_font = status_label.font()
status_label_font.setPointSize(18)
status_label.setFont(status_label_font)

status_label.setGeometry(10, 10, 350, 40)

# Checkbox
checkbox_accept = QCheckBox(Form)
checkbox_accept.setChecked(True)
checkbox_accept.setText("Enable auto accept")
checkbox_accept.setGeometry(10, 60, 250, 30)

checkbox_accept_font = checkbox_accept.font()
checkbox_accept_font.setPointSize(18)
checkbox_accept.setFont(checkbox_accept_font)

# Connecter
connector = Connector()

username: str = "Loading ..."

def setUserName(name: str):
    if name == "":
        status_label.setText("Offline")
    elif name == "@loading...@":
        status_label.setText("Loading ...")
    else:
        status_label.setText(f"Welcome {name}")

async def getCurrentUserInfo(connection):
    setUserName("@loading...@")
    sleep(5)

    summoner = await connection.request('get', '/lol-summoner/v1/current-summoner')

    user_data = await summoner.json()
    username = user_data["gameName"] + " " + user_data["tagLine"]

    setUserName(username)

def lcu_setup():
    
    @connector.ready
    async def connect(connection):
        await getCurrentUserInfo(connection)

    @connector.ws.register('/lol-matchmaking/v1/ready-check', event_types=('UPDATE',))
    async def lol_matchmaking_ready(connection, event):
        if not checkbox_accept.isChecked():
            return

        if event.data["playerResponse"] == "Declined" or  event.data["playerResponse"] == "Accepted":
            return

        await connection.request('post', '/lol-matchmaking/v1/ready-check/accept')

    @connector.ws.register('/lol-login/v1/session', event_types=('UPDATE',))
    async def lol_session(connection, event):

        if event.data and event.data["state"] and event.data["state"] == "SUCCEEDED":
            await getCurrentUserInfo(connection)
        elif event.data and event.data["state"] and event.data["state"] == "LOGGING_OUT":
            setUserName("")

    @connector.close
    async def disconnect():
        setUserName("")

    connector.start()

if __name__ == "__main__":

    thread_lcu_driver = QThread()   
    thread_lcu_driver.run = lcu_setup       
    thread_lcu_driver.start()       

    setUserName("")      

    Form.show()
    sys.exit(app.exec_())
            