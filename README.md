# 大学学习与成长管理系统

这是一个由学生逐步实现的 Python / FastAPI 学习项目。

## 当前进度

截至 2026-10-13，资料功能已使用 SQLite，当前字段为 id、title、type、status。

- GET /resources：老师实际 HTTP 200 与只读数据库结果一致。
- GET /resources/{resource_id}：老师实际验证编号1返回 200 和资料字典，不存在编号999999返回 404 与“资料不存在”。
- POST /resources：学生提交 SQLite 版新增的 201 响应；老师独立核对新增记录已保存且能查询。
- update_resource_status：老师在数据库副本上实际验证存在编号返回1、不存在编号返回0，状态已提交、其他记录不变、连接关闭。
- PATCH /resources/{id}/status：已接入；学生提交编号2的更新后资料与不存在编号的错误响应，老师只读确认编号2已保存为 reading。此次提交未包含 HTTP 状态码，200/404 尚未单独核对。学生随后提交非法状态 reading2 的 HTTP 422 / literal_error，以及查询列表，编号2仍为 reading；非法状态拒绝并保留原状态的检查符合预期。
- 空标题校验：学生提交 422 响应，老师只读确认数据库未增加记录。SQLite 版非法状态检查仍待验证。
- 重启保留：学生提交重启后 id=1、2、3 的列表，与之前基线一致；老师未独立执行重启。
- GET /health：学生已将 status 修正为 ok，老师实际 HTTP 验证返回 200 与约定内容。
- 状态更新输入模型已通过合法/非法值的独立构造检查，模块级更新测试已清理。get_resources(status=None) 的默认查询、按状态筛选、无匹配返回空列表与连接关闭已通过真实数据库只读函数检查；GET /resources 已接入可选 status 查询参数，老师实际验证默认查询、reading 和 completed 筛选均为 HTTP 200；学生修正拼写后，comleted 被 HTTP 422 拒绝。get_resources 已合并公共转换、关闭和返回逻辑，默认查询与筛选经只读函数执行确认保持正常；模块级测试打印已删除。本地 Git 已由学生初始化；老师实际核对 learning.db、.venv/ 与 SQLite 辅助文件被忽略。当前尚无提交，暂存区为空，GitHub 同步尚未完成。下一小步：将主程序、数据库模块、依赖清单、忽略规则和两份项目文档放入暂存区并核对。任务、成长记录、网页、课程课表与 AI 尚未实现。

详细历史、贡献来源、排错和验证证据见 LEARNING_LOG.md；代码已存在不等同于学生已经独立掌握。

## 启动方式

在本项目目录打开终端：

```sh
source .venv/bin/activate
python -m uvicorn main:app --reload
```

完成练习后访问 http://127.0.0.1:8000/health，预期返回：

```json
{"status": "ok", "message": "学习系统已启动"}
```

交互文档：http://127.0.0.1:8000/docs。停止服务：Ctrl+C。

重建环境时使用 python3 -m venv .venv，然后运行
.venv/bin/python -m pip install -r requirements.txt。

## 路线

1. 基础记录与待办：资料、任务、成长记录、SQLite、简单网页。
2. 关联与文件：任务关联资料、附件、学习日志、成果、搜索与归档。
3. 规划与工程：目标、月度和未来30天视图、考研空间、统计、备份恢复、按部署需要增加登录、测试与部署。
4. AI 辅助：计划草稿、复盘建议、带依据的资料问答；用户确认后保存。

## 关键设计约定

- 计划完成与实际掌握分开记录；不自动生成技能掌握百分比。
- 资料统一存储，考研空间按科目与用途筛选。
- 任务计划日期与截止日期分开；延期保留原截止日期。
- 书籍与文件分开；纸质书也可记录。附件与数据库分别存储，备份覆盖两者。
- 归档资料保留历史记录。考试科目可配置，院校要求记录年份及当年官方依据。
- 只建立当前功能需要的数据表。目前已创建 resources 表，列为 id、title、type、status。

## 参考与贡献

架构和工程实践参考：https://github.com/fastapi/full-stack-fastapi-template。
目前未复制该模板的项目代码。老师准备环境、文档和第一课接口骨架；学生完成部分及验证证据记录在 LEARNING_LOG.md。
# campus-assistant
