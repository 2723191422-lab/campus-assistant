from fastapi import FastAPI
from typing import Literal
from pydantic import BaseModel,Field
from database import get_resources,add_resource
from  fastapi import HTTPException
from database import get_resource_by_id
from database import update_resource_status
from fastapi.responses import JSONResponse,FileResponse
from contextlib import asynccontextmanager
import notes_database as notes_db
@asynccontextmanager
async def lifespan(app:FastAPI):
    notes_db.init_notes_table()
    yield
app = FastAPI(lifespan=lifespan)
class ResourceCreate(BaseModel):#声明"创建资源时，浏览器必须发来的数据长什么样
    title:str=Field(min_length=1)#它本身不做事，只描述格
    type:Literal["book"]#字面量，只能是列出的这些值之一
    status:Literal["planned","reading","completed"]
class ResourceStatusUpdate(BaseModel):
    status:Literal["planned","reading","completed"]
class ResourceRead(BaseModel):
    id:int
    title:str
    type:Literal["book"]
    status:Literal["planned","reading","completed"]
class NoteRead(BaseModel):
    id:str
    title:str
    content:str
    tags:list[str]
    notebook:str
    updatedAt:str
class NoteCreate(BaseModel):
    title:str=Field(min_length=1)
class NoteUpdate(BaseModel):
    title:str=Field(min_length=1)
    content:str
@app.get("/")
def home():
    return FileResponse("index.html")


@app.get("/health")
def health():
    return JSONResponse(content={"status":"ok","message":"学习系统已启动"} ,media_type="application/json;charset=utf-8")


@app.get("/resources",response_model=list[ResourceRead])
def list_resources(status: Literal["planned","reading","completed"]|None = None):
    return get_resources(status)


@app.post("/resources",status_code=201)
def creat_resource(data:ResourceCreate):
    new_id=add_resource(data.title,data.type,data.status)
    new_resource=data.model_dump()
    new_resource["id"]=new_id
    return new_resource


@app.get("/resources/{resource_id}",response_model=ResourceRead)
def read_resource(resource_id:int):
    resource=get_resource_by_id(resource_id)
    if resource is None :
        raise HTTPException(status_code=404,detail="资料不存在")
    return resource


@app.patch("/resources/{id}/status")
def change_resource_status(id:int,data:ResourceStatusUpdate):
    affected_rows=update_resource_status(id,data.status)
    if affected_rows==0:
        raise HTTPException(status_code=404,detail="未查询到该书籍")
    return JSONResponse(content=get_resource_by_id(id),media_type="application/json;charset=utf-8")


@app.get("/api/notes",response_model=list[NoteRead],status_code=200)
def list_all_notes():
    try:
        return notes_db.list_notes()
    except ValueError as exc:
        raise HTTPException(status_code=422,detail=str(exc))

@app.get("/api/notes/{note_id}",response_model=NoteRead,status_code=200)
def get_note_api(note_id:str):

    note= notes_db.get_note_by_id(note_id)
    if note is None:
        raise HTTPException(status_code=404,detail="当前笔记不存在")
    return note
@app.post("/api/notes",response_model=NoteRead,status_code=201)
def create_note_api(data:NoteCreate):
    try:
        return notes_db.create_note(data.title)
    except ValueError as exc:
        raise HTTPException(status_code=422,detail=str(exc))
@app.patch("/api/notes/{note_id}",response_model=NoteRead,status_code=200)
def update_note_api(note_id:str,data:NoteUpdate):
    try:
        note= notes_db.update_note(note_id,data.title,data.content)
    except ValueError as exc:
        raise HTTPException(status_code=422,detail=str(exc))
    if note is None:
        raise HTTPException(status_code=404,detail="笔记不存在")
    return note
@app.delete("/api/notes/{note_id}",status_code=204)
def delete_by_id(note_id:str):
    try:
        return notes_db.delete_note(note_id)
    except ValueError as exc:
        raise HTTPException(status_code=404,detail=str(exc))
