pyinstaller -F main.py --name=lol_accepter --clean --noconfirm --noconsole --icon=favicon.ico -d imports --add-data="favicon.ico;."

python -m nuitka --mingw64 main.py

python -m nuitka --mingw64 --standalone --show-progress --disable-console --show-memory --follow-imports --enable-plugin=pyqt5  --output-dir=dist --include-qt-plugins=sensible,styles --windows-icon-from-ico=favicon.ico --windows-disable-console main.py

python -m nuitka --mingw64 --onefile --show-progress --disable-console --show-memory --follow-imports --enable-plugin=pyqt5   --plugin-enable=qt-plugins --include-qt-plugins=sensible,styles --output-dir=dist --windows-disable-console --windows-icon-from-ico=favicon.ico main.py

python -m nuitka --mingw64 --standalone --show-progress --disable-console --show-memory --follow-imports --enable-plugin=pyqt5  --include-qt-plugins=sensible,styles --output-dir=dist --windows-disable-console --windows-icon-from-ico=assets/favicon.ico --include-data-dir=assets=assets main.py