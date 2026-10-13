from fastapi import FastAPI
from typing import Literal
from pydantic import BaseModel,Field
from database import get_resources,add_resource
from  fastapi import HTTPException
from database import get_resource_by_id
from database import update_resource_status
from fastapi.responses import JSONResponse,FileResponse
app = FastAPI()
@app.get("/")
def home():
    return FileResponse("index.html")
@app.get("/health")
def health():
    return JSONResponse(content={"status":"ok","message":"学习系统已启动"} ,media_type="application/json;charset=utf-8")
@app.get("/resources")
def list_resources(status:Literal["planned","reading","completed"]|None=None): 
    return JSONResponse(content=get_resources(status),media_type="application/json;charset=utf-8")
class ResourceCreate(BaseModel):#声明"创建资源时，浏览器必须发来的数据长什么样
    title:str=Field(min_length=1)#它本身不做事，只描述格
    type:Literal["book"]#字面量，只能是列出的这些值之一
    status:Literal["planned","reading","completed"]
class ResourceStatusUpdate(BaseModel):
    status:Literal["planned","reading","completed"]
@app.post("/resources",status_code=201)
def creat_resource(data:ResourceCreate):
    new_id=add_resource(data.title,data.type,data.status)
    new_resource=data.model_dump()
    new_resource["id"]=new_id
    return new_resource
@app.get("/resources/{resource_id}")
def read_resource(resource_id:int):
    resource=get_resource_by_id(resource_id)
    if resource is None :
        raise HTTPException(status_code=404,detail="资料不存在")
    return JSONResponse(content=resource,media_type="application/json;charset=utf-8")
@app.patch("/resources/{id}/status")
def change_resource_status(id:int,data:ResourceStatusUpdate):
    affected_rows=update_resource_status(id,data.status)
    if affected_rows==0:
        raise HTTPException(status_code=404,detail="未查询到该书籍")
    return JSONResponse(content=get_resource_by_id(id),media_type="application/json;charset=utf-8")
