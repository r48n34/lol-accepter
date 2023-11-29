
from lcu_driver import Connector

import sys
from time import sleep
from PyQt5 import QtWidgets
# from PyQt5.QtWidgets import QApplication, QLabel, QCheckBox, QSystemTrayIcon, QAction, QMenu 

from PyQt5.QtGui import QIcon
from PyQt5.QtCore import QThread, Qt

class MyWidget(QtWidgets.QWidget):

    def __init__(self):
        super().__init__()

        self.username: str = "Loading ..."

        self.setWindowTitle('lol accepter')
        self.setFixedSize(350, 120)
        self.ui()

        # Connecter
        self.connector = Connector()
        self.thread_lcu_driver = QThread()   
        self.thread_lcu_driver.run = self.lcu_setup       
        self.thread_lcu_driver.start()       

        self.setUserName("")  
    
    def ui(self):

        self.window = QtWidgets.QMainWindow()
        self.window.setCentralWidget(QtWidgets.QWidget())
        self.window.setAttribute(Qt.WA_QuitOnClose, False)

        # Top labels
        self.status_label = QtWidgets.QLabel(self)

        self.status_label_font = self.status_label.font()
        self.status_label_font.setPointSize(18)
        self.status_label.setFont(self.status_label_font)

        self.status_label.setGeometry(10, 10, 350, 40)

        # Checkbox
        self.checkbox_accept = QtWidgets.QCheckBox(self)
        self.checkbox_accept.setChecked(True)
        self.checkbox_accept.setText("Enable auto accept")
        self.checkbox_accept.setGeometry(10, 60, 250, 30)

        self.checkbox_accept_font = self.checkbox_accept.font()
        self.checkbox_accept_font.setPointSize(18)
        self.checkbox_accept.setFont(self.checkbox_accept_font)

        # Adding an icon 
        self.icon = QIcon("assets/favicon.ico") 
        
        # Adding item on the menu bar 
        self.tray = QtWidgets.QSystemTrayIcon(self) 
        self.tray.setIcon(self.icon) 
        self.tray.setVisible(True) 
        
        # Creating the options 
        self.menu = QtWidgets.QMenu(self) 
        self.open_windows = QtWidgets.QAction("Open") 
        self.open_windows.triggered.connect(self.show) 
        self.menu.addAction(self.open_windows) 
        
        # To quit the app 
        self.action_close = QtWidgets.QAction("Close") 
        # self.action_close .triggered.connect(self.hide) 
        self.action_close .triggered.connect(QtWidgets.qApp.quit) 
        self.menu.addAction(self.action_close)

        self.tray.setContextMenu(self.menu) 

    def setUserName(self, name: str):
        if name == "":
            self.status_label.setText("Offline")
        elif name == "@loading...@":
            self.status_label.setText("Loading ...")
        else:
            self.status_label.setText(f"Welcome {name}")

    async def getCurrentUserInfo(self, connection):
        self.setUserName("@loading...@")
        sleep(5)

        summoner = await connection.request('get', '/lol-summoner/v1/current-summoner')

        user_data = await summoner.json()
        username = user_data["gameName"] + " " + user_data["tagLine"]

        self.setUserName(username)

    def lcu_setup(self):
        
        @self.connector.ready
        async def connect(connection):
            await self.getCurrentUserInfo(connection)

        @self.connector.ws.register('/lol-matchmaking/v1/ready-check', event_types=('UPDATE',))
        async def lol_matchmaking_ready(connection, event):
            if not self.checkbox_accept.isChecked():
                return

            if event.data["playerResponse"] == "Declined" or  event.data["playerResponse"] == "Accepted":
                return

            await connection.request('post', '/lol-matchmaking/v1/ready-check/accept')

        @self.connector.ws.register('/lol-login/v1/session', event_types=('UPDATE',))
        async def lol_session(connection, event):

            if event.data and event.data["state"] and event.data["state"] == "SUCCEEDED":
                await self.getCurrentUserInfo(connection)
            elif event.data and event.data["state"] and event.data["state"] == "LOGGING_OUT":
                self.setUserName("")

        @self.connector.close
        async def disconnect():
            self.setUserName("")

        self.connector.start()


def main():
    app = QtWidgets.QApplication(sys.argv)
    app.setQuitOnLastWindowClosed(False)

    Form = MyWidget()
    Form.show()    
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()  