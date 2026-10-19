"""仅供端到端测试：所有数据库操作隔离到临时目录，不改后端源码。"""
import os
import sys
import socket
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[2]
data = Path(os.environ['ROCK_E2E_DATA_DIR']).resolve()
if not data.is_relative_to(Path(tempfile.gettempdir()).resolve()) or not data.name.startswith('rock-notes-e2e-'):
    raise RuntimeError('端到端数据库必须位于专用临时目录')
os.chdir(data)
sys.path.insert(0, str(root))
sys.dont_write_bytecode = True
import notes_database
notes_database.DB_PATH = data / 'learning.db'
# 旧database模块使用相对路径；此时工作目录也已切到临时目录。
import main
import uvicorn
# 先独占测试端口，再写就绪标记；端口被占用时不会误用其他服务。
listener = socket.socket()
listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
listener.bind(('127.0.0.1', 18000))
(data / 'backend-ready').write_text(str(os.getpid()))
server = uvicorn.Server(uvicorn.Config(main.app, log_level='critical', access_log=False))
server.run(sockets=[listener])
