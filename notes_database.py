"""笔记 SQLite 层：教学骨架，核心实现由 Rock 完成。

当前目标：新建、列表、详情、保存可以持久化。
此模块不在导入时建表或插入数据；现有 main.py 暂未导入它。
DB_PATH 是数据库文件的固定位置，后续隔离测试可将它指向临时文件。

notes 表约定（本轮先用六列，不创建标签或笔记本关联表）：
    id          TEXT PRIMARY KEY NOT NULL
    title       TEXT NOT NULL
    content     TEXT NOT NULL
    tags        TEXT NOT NULL       -- JSON 文本，例如 '["学习", "Python"]'
    notebook    TEXT NOT NULL
    updatedAt   TEXT NOT NULL       -- 带时区的 ISO 8601 时间字符串

Python 返回字典与前端 Note 保持一致：tags 必须是 list，不能返回 JSON 字符串。
共同要求：SQL 的值使用 ? 参数；写成功才 commit；finally 关闭连接。
"""

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

DB_PATH = Path(__file__).resolve().with_name("learning.db")
#拿到数据库文件的绝对地址

def init_notes_table() -> None:
    """创建 notes 表；重复执行不会删除或覆盖已有笔记。
    用 CREATE TABLE IF NOT EXISTS；保留现有 resources 表。
    这里只负责表结构，不自动插入 welcome 或其他示例。
    """
    collection=sqlite3.connect(DB_PATH)
    try:

        collection.execute("""
        CREATE TABLE IF NOT EXISTS notes(
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content     TEXT NOT NULL,
        tags        TEXT NOT NULL  ,
        notebook    TEXT NOT NULL,
        updatedAt   TEXT NOT NULL

        );



""")
        collection.commit()
    finally:
        collection.close()
    return

def create_note(title: str) -> dict:
    """插入一篇笔记，并返回完整的六字段字典。

    title 先 strip，空白标题抛出 ValueError。
    id 用m                mm                                                                                                     mm                                                                                                                                    m                                                                                                                   j                                                                          mm；content 用空字符串；tags 用空列表；
    notebook 用 '收件箱'；updatedAt 用 datetime.now(timezone.utc).isoformat()。
    tags 写库前转 JSON 文本。创建不同笔记应得到不同 id。
    """
    title=title.strip()
    if not title:
        raise ValueError("标题不能为空")
    note={
    "id":str(uuid4()),
    "title":title,
    "content":"",
    "tags":[],
    "notebook":"收件箱",
    "updatedAt":datetime.now(timezone.utc).isoformat()
    }
    collection=sqlite3.connect(DB_PATH)

    try:

        collection.execute("""INSERT INTO notes (id,title,content,tags,notebook,updatedAt) VALUES(?,?,?,?,?,?)""",(note["id"],note["title"],note["content"],json.dumps(note["tags"],ensure_ascii=False),note["notebook"],note["updatedAt"]))
        collection.commit()
    finally:
        collection.close()
    return note

def get_note_by_id(note_id: str ) -> dict | None:
    """按字符串 id 查询；查不到返回 None，查到返回完整笔记字典。

    tags 从 JSON 文本转回列表；数据库异常继续向外抛出。
    这里不抛 HTTPException：HTTP 状态码由 main.py 决定。
    """
    collection=sqlite3.connect(DB_PATH)
    try:
        row=collection.execute("SELECT id,title,content,tags,notebook,updatedAt FROM notes WHERE id=?",(note_id,)).fetchone()
        if row is None:
            return None
        result={"id":row[0],"title":row[1],"content":row[2],"tags":json.loads(row[3]),"notebook":row[4],"updatedAt":row[5]}
    finally:
        collection.close()
    return result


def list_notes() -> list[dict]:
    """返回全部笔记，无记录时返回 []。

    使用 ORDER BY updatedAt DESC, id ASC，让最近更新的排在前面。
    每项都包含六个字段，tags 都转换为列表。
    本轮不实现搜索或标签筛选。
    """
    collection=sqlite3.connect(DB_PATH)
    try:
        rows=collection.execute("SELECT id,title,content,tags,notebook,updatedAt FROM notes ORDER BY updatedAt DESC,id ASC ").fetchall()
        result=[]
        if rows is None:
            raise ValueError("笔记为空")
        for row in rows:
            result.append({"id":row[0],"title":row[1],"content":row[2],"tags":json.loads(row[3]),"notebook":row[4],"updatedAt":row[5]})
    finally:
        collection.close()
    return result



def update_note(note_id: str , title: str, content: str) -> dict | None:
    """保存标题和正文，更新 updatedAt，返回更新后的完整笔记。

    title 先 strip，空白标题抛出 ValueError。
    保留 id、tags、notebook；不存在时返回 None，不能偷偷新建。
    重复保存不会增加笔记数量；写成功并提交后再返回最新记录。
    """
    collection=sqlite3.connect(DB_PATH)

    try:
        title=title.strip()
        if not title:
            raise ValueError("标题不能为空")
        collection.execute("UPDATE notes SET title=?,content=?,updatedAt=? WHERE id = ?",(title,content,datetime.now(timezone.utc).isoformat(),note_id))
        collection.commit()
        row=collection.execute("SELECT id ,title,content,tags,notebook,updatedAt  FROM notes WHERE id=?",(note_id,)).fetchone()
        if row is None:
            return None
        result={"id":row[0],"title":row[1],"content":row[2],"tags":json.loads(row[3]),"notebook":row[4],"updatedAt":row[5]}

    finally:
        collection.close()
    return result

def delete_note(note_id:str)->bool:
    collection=sqlite3.connect(DB_PATH)
    try:
        cursor=collection.execute("DELETE FROM notes WHERE id=?",(note_id,))
        delete=cursor.rowcount>0
        collection.commit()
    finally:
        collection.close()
    if delete :
        return delete
    else:
        raise ValueError("笔记不存在")
