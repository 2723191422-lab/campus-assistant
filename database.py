import sqlite3


# ---------- 建表：模块被导入时执行一次，确保表存在 ----------
collection = sqlite3.connect("learning.db")
collection.execute("""
    CREATE TABLE IF NOT EXISTS resources(
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL
    );

""")
collection.close()



# ---------- 查询：返回全部资料（字典列表） ----------
def get_resources(status=None):
    collection = sqlite3.connect("learning.db")
    try:
        if status==None:
            rows = collection.execute(
                "SELECT id, title, type, status FROM resources ORDER BY id"
            ).fetchall()
        else:
            rows=collection.execute(
            "SELECT id,title,type,status FROM resources WHERE status=? ORDER BY id ",(status,)
        ).fetchall()
        result = []
        for res in rows:
            result.append({
                "id": res[0],
                "title": res[1],
                "type": res[2],
                "status": res[3],
                    })
    finally:
        collection.close()
    return result





# ---------- 新增：插入一条资料，返回新记录的 id ----------
def add_resource(title, type, status):
    collection = sqlite3.connect("learning.db")
    try:
        cursor = collection.execute(
        "INSERT INTO resources (title, type, status) VALUES (?, ?, ?)",
        (title, type, status)
    )
        new_id = cursor.lastrowid
        collection.commit()
    finally:
        collection.close()
    return new_id

def get_resource_by_id(resource_id):
    collection=sqlite3.connect("learning.db")
    try:
        rows=collection.execute("SELECT id,title,type,status FROM resources WHERE id=?",(resource_id,)).fetchone()
    finally:
                collection.close()

    if rows is None:
        return None

    result={"id":rows[0],"title":rows[1],"type":rows[2],"status":rows[3]}
    return result
def update_resource_status(resource_id,new_status):
    collection=sqlite3.connect("learning.db")
    try:
        cursor=collection.execute("UPDATE resources SET status=? WHERE id =?",(new_status,resource_id))
        collection.commit()
        affected_rows=cursor.rowcount
    finally:
        collection.close()
    return affected_rows

"""def  add_notes(id,title,content,tags,notebook,updatedAt):
    collection=sqlite3.connect("learning.db")
    try:
        cursor=collection.execute("INSERT INTO notes (?,?,?,?,?,?)VALUES(id,title,content,tags,notebook,updatedAt)")
        collection.commit()
        new_id=cursor.lastrowid;
    finally:
        collection.close()
    return new_id;

def notes_by_id(id):
    collection=sqlite3.connect("learning.db");
    try:
        cursor=collection.execute("SELECT id,title,content,tags,notebook,updatedAt FROM notes WHERE id=? ",(id,))
        rows=cursor.fetchone()
    finally:
        collection.close()
    if rows is None:
        return None
    return  {"id":rows[0],"title":rows[1],"content":rows[2],"tags":rows[3],"notebook":rows[4],"updatedAt":rows[5]}

"""
