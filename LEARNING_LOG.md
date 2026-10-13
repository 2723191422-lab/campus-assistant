# 学习记录

## 2026-10-06 · 第一课（接口验证完成）

- 目录：独立的 fastapi-learning 目录；创建前仅有空的 work 与 outputs 文件夹。
- 已检查：Python 3.14.7、pip 26.2.1、Git 2.50.1；当前目录尚未初始化 Git。
- 环境：已创建 .venv；安装 FastAPI 0.142.2 与 Uvicorn 0.54.0。依赖版本保存在 requirements.txt。
- 环境问题：受限环境无法解析 PyPI 域名；获准联网后安装成功。
- 起点：学生已学 Python 基础、正在学线程，尚未实践完整程序；HTML/JavaScript 与 Git 从零开始。
- 本课概念：虚拟环境、HTTP GET、路径、路由、Python 函数与字典、JSON 响应。
- 老师完成：环境准备、文档、main.py 练习骨架。
- 学生任务：实现 health() 的返回值，启动服务，验证 /health 和 /docs。
- 验收：/health 返回指定 JSON；交互文档执行结果为 HTTP 200；学生说明访问路径如何对应 Python 函数。
- 学生完成：health() 返回指定字典，并报告启动成功。
- 当前证据：老师读取实际代码，直接调用 health() 返回正确；实际请求本机 /health 返回 HTTP 200 和正确 JSON。未执行自动化测试或部署验证。学生对路由的理解尚待后续练习检验。
- 审查：功能符合要求；遗留练习注释和已注释的 raise 可清理，不影响功能。

## 2026-10-06 · 资料列表（实现后待修正）

- 目标：在 main.py 定义包含两条资料字典的 resources 列表，新增 GET /resources 返回该列表。
- 字段：id（整数）、title（字符串）、type（暂用 book）、status（planned / reading / completed）。
- 本步仅用内存示例数据，无数据库持久化；真实数据保存与输入校验后续实现。
- 验证：/resources 返回两条资料；/health 继续正常；在 /docs 中执行 GET /resources 为 HTTP 200。
- 学生实现：resources 包含两条资料，list_resources() 返回列表。
- 实际验证：老师请求 /resources 得到 HTTP 200 和两条资料；/health 仍返回 HTTP 200 和正确内容。未执行自动化测试或部署验证。
- 待修正：main.py 第13行使用 type=book2、status=reading2，超出约定。学生应改为 type=book，并从 planned / reading / completed 中选择实际状态。当前直接返回字典未施加字段校验，因此 HTTP 200 不能证明字段符合约定。
- 下一步：学生修正字段后再次检查，通过后才推进新增资料接口。
- 再次检查：type/status 已符合约定；第二条资料同时被改成 id=1，导致两条记录编号重复。老师读取代码并直接调用 list_resources() 确认重复，未再次进行 HTTP 验证。下一步仅修正第二条 id 为 2，再验收。
- 修正验收：学生将第二条 id 改为 2。老师直接调用函数并实际请求 /resources，HTTP 200、两条记录编号唯一，type/status 符合约定。资料列表练习通过。

## 下一步 · 添加资料（待学生实现）

- 在 main.py 定义 ResourceCreate 输入模型：非空 title、type 仅 book、status 为 planned / reading / completed。
- 实现 POST /resources，后端分配唯一 id，追加到 resources 并返回新增记录，成功状态码为 201。
- 验证有效输入新增后可从 GET 列表查到；空标题或非法状态返回 422，列表不增加。
- 当前仍为内存存储，重启或 --reload 触发重载会丢失运行期间新增的资料。持久化后续接入 SQLite。

## 2026-10-08 · 放慢添加资料步骤

- 学生反馈：需要一步一步讲清语法；上一次同时引入输入模型、POST、转换字典和编号分配，负担过大。
- 当前代码阅读：已写 ResourceCreat 模型和 POST /resource 草稿；末尾 return mew_resource 引用了未定义变量，尚未追加资料或分配编号，不能视为新增功能完成。
- 当前只练习输入模型的标题校验：理解 class、BaseModel、title: str 和 Field(min_length=1)，通过 Python 交互模式分别构造有效标题和空标题。
- 其余模型字段、POST 请求、字典转换、编号分配与追加操作分步讲解；学生提交本步结果后才继续。
- 学生提交的交互运行结果：成功导入 ResourceCreat，创建 title=jiwang 的对象并打印标题；空标题触发 ValidationError，错误为 string_too_short。老师据提交结果确认标题校验符合预期，本轮未独立复跑。
- 遇到的问题与修正：主目录无法找到项目虚拟环境，进入项目目录后直接启动 .venv/bin/python；在 zsh 输入 Python 语句会报 command not found；mian 拼写应为 main；不应使用行末反斜杠连接三条独立语句。
- 下一小步：解释 Literal 的允许值约束，尝试 status=reading2 并观察校验错误。
- 学生提交状态校验结果：status=reading2 触发 literal_error，允许值为 planned / reading / completed；该交互验证符合预期，本轮老师未独立复跑。
- 排错经验：ststus / sastus 拼写导致真正的 status 缺失，报 Field required；字段名正确但值不合法则报 literal_error。
- 下一小步：在交互模式调用 model_dump()，观察 ResourceCreat 对象如何转换成用于现有资料列表的字典；尚不追加资料。
- 后续学生提交的交互结果：model_dump() 返回包含 title/type/status 的字典；通过 new_resource["id"]=3 添加编号；resources.append(new_resource) 后打印得到三条资料。以上依据学生提交的输出，未独立复跑；网页服务器与交互环境属于不同进程，不能据此认定 POST 接口完成。
- 下一小步：通过遍历现有列表找到最大 id，再加 1，替代练习中写死的编号 3；当前交互列表预期算出 4。
- 学生要求后续在 VSCode 中教学。老师已调用系统打开 VSCode 项目文件夹；后续采用编辑文件、保存、集成终端运行的流程。
- 当前编号练习改在 work/id_practice.py 中进行，使用编号 1、2、3 的示例列表；学生补全下一个编号表达式并运行，预期输出 4，结果尚待提交。
- 学生随后要求改回 Mac 终端，重新激活虚拟环境并进入 Python；当前采用 Mac 终端执行，VSCode 练习方案不再作为当前要求。
- 循环排错：交互输入循环体后需提交空行；Ctrl+C 导致 KeyboardInterrupt，未执行的循环使 largest_id 保持 0。学生随后完成空行提交，并以“34”简写报告计算结果，暂按最大编号 3、下个编号 4 理解，未独立复跑。
- 老师再次读取 main.py：文件初始数据仍只有 id=1、2，POST 草稿仍未完成。下一步由学生将已练习动作整合到 POST /resources，老师先检查代码，再进行 HTTP 验证；服务新进程的第一条新增记录预期 id=3。
- 学生已补齐 POST /resources：循环找到最大编号，给新字典分配 id，追加列表并返回新增记录；修正了原来的 mew_resource 拼写。
- 老师验证：语法编译成功；在独立 Python 进程中直接调用 creat_resource()，断言新增 id=3、列表长度增加一条、末项与返回资料一致，全部通过。该验证未改变运行中服务的数据，尚未通过 POST 的 HTTP 验证或部署验证。
- 下一小步：学生通过 /docs 提交一条资料，确认 HTTP 201 和 GET 列表新增结果。
- HTTP 正常流程验证：学生提交 POST /resources 返回 201，响应为 title=计算机网络、type=book、status=reading、id=7。老师实际 GET /resources 返回 200，列表有 7 条，id 为 1 至 7，确认 id=7 对应资料存在；同时重读代码，编号算法仍为最大 id 加 1。
- 下一小步：学生在 /docs 提交 status=reading2，预期 HTTP 422 且列表不增加；当前基线为 7 条，验证期间不重启服务或提交其他资料。
- 非法状态 HTTP 验证通过：学生提交 422 响应，错误为 literal_error，loc=[body,status]，input=reading2；老师随后实际 GET 为 200，仍有 7 条、编号 1 至 7，不存在“非法状态验证”条目。
- 下一小步：保持合法 type/status，仅提交 title=""，预期 422、loc=[body,title]、列表仍有 7 条；完成当前添加接口约定中的空标题 HTTP 检查后，再进入持久化学习。
- 空标题 HTTP 检查：老师实际提交 title=""、合法 type/status，返回 422，错误位置为 body/title、错误类型为 string_too_short；请求前后 GET 列表完全一致，仍为 7 条。当前添加资料的正常流程和两项输入校验均已验证。
- 持久化下一小步：学生自行新建 database.py，导入标准库 sqlite3，连接 learning.db、打印成功提示并关闭连接。仅创建连接与文件，尚不创建表、不接入接口、不迁移现有内存资料。学生提交代码与运行结果后再检查。
- 数据库连接练习通过：学生使用 collection 变量保存连接、打印 ok 并关闭；老师实际运行 database.py 输出 ok，随后只读查询 sqlite_master 确认当前表列表为空。learning.db 为 0 字节，与尚未建表的状态相符。
- 下一小步：学生在连接后、关闭前使用 execute() 和多行 SQL 创建 resources 表，列为 id INTEGER PRIMARY KEY、title/type/status TEXT NOT NULL。暂不插入资料或修改 FastAPI 接口；学生提交后老师检查实际表结构。
- 建表练习通过：老师读取 database.py 并实际运行，输出 ok；只读 PRAGMA table_info 确认 id 为 INTEGER 主键，title/type/status 均为 TEXT NOT NULL；SELECT COUNT(*) 为 0。尚未接入接口或迁移内存资料。
- 下一小步：学生在建表后、关闭连接前添加参数化 INSERT，省略 id 让 SQLite 分配编号，使用 commit() 提交一条示例资料。每次运行都会再插入一条；学生提交后老师先读代码和数据库，避免盲目重复执行造成重复示例记录。
- 插入保存练习通过：学生在 database.py 使用参数化 INSERT 保存“数据结构”、book、reading，并调用 commit()。老师未重复执行插入脚本，使用独立只读连接实际读取到唯一记录 (1, 数据结构, book, reading)，确认连接关闭后资料仍可读取。
- 下一小步：学生注释演示用 INSERT/commit，增加 SELECT id,title,type,status FROM resources ORDER BY id，再使用游标 fetchall() 和 print 输出。预期为 [(1, '数据结构', 'book', 'reading')]，不新增记录；暂不修改 main.py。

## 2026-10-10 · 启动环境与数据库接入排错

- 学生提交运行报错：main.py 第一行 ModuleNotFoundError: fastapi，输出带 RESTART，疑似使用 IDLE 或虚拟环境之外的解释器。
- 老师实际验证：.venv/bin/python 可以导入 FastAPI 0.142.2，项目环境依赖正常，无需重装。
- 当前代码已变化：database.py 定义 get_resources() 和 add_resource()；main.py 导入的却是 get_resource。老师实际使用项目解释器导入 main，确认该名称不一致导致 ImportError。
- 代码阅读还发现：main.py 的 GET/POST 仍引用已移除的 resources 变量，数据库接入尚未完成。本次先由学生修正导入名称、使用项目解释器通过 Uvicorn 启动并验证 /health，之后再逐步接入资料接口。
- 学生随后提交 Uvicorn 成功启动、GET /health 为 200 的日志；favicon.ico 为 404，仅表示没有图标文件。
- 老师复查：导入名称已修正，GET /resources 已改为调用 get_resources()。实际 HTTP 请求 /health 和 /resources 均返回 200，数据库及接口当前均有 9 条资料，第一条为“数据结构”。数据库查询已接入并运行验证。
- POST 尚未完成：new_id=add_resource 只是引用函数，没有调用；return new_resource 引用未定义变量。下一小步由学生调用 add_resource(data.title,data.type,data.status)，并用已学的 model_dump、字典赋值和 return 组装新记录；未完成前不进行 POST 提交，避免产生失败响应或重复示例记录。

## 2026-10-10 · 查询练习验收

- 学生已注释 INSERT/commit，加入 SELECT + fetchall() + print，database.py 处于“只读查询”状态。
- 老师实际运行 database.py，输出 `[(1, '数据结构', 'book', 'reading')]` 与 `ok`，与预期一致。
- 老师另以只读连接核对：sqlite_master 仅 resources 一张表，COUNT(*) 为 1，记录仍为 (1, 数据结构, book, reading)。确认注释后未再产生重复记录。
- 结论：SQLite 的连接/关闭、建表、参数化 INSERT + commit、SELECT + fetchall 四类基础操作均已跑通。本轮未执行自动化测试，未通过 HTTP 验证，未接入 FastAPI。
- main.py 现状重读：/health、GET /resources（内存 2 条）、POST /resources（内存追加、201）保持原样，未改动。

## 2026-10-10 · 下一小步（待学生实现）

- 目标：把 fetchall() 返回的“元组列表”转换成与接口一致的“字典列表”，仍在 database.py 内，不改 main.py。
- 输入：`[(1, '数据结构', 'book', 'reading')]`；期望：`[{'id': 1, 'title': '数据结构', 'type': 'book', 'status': 'reading'}]`。
- 语法点：row 为元组，row[0..3] 的索引顺序等于 SELECT 的列顺序；字典 key 即 JSON 字段名；空列表 + for + append。
- 约束：保持 INSERT/commit 为注释状态，不新增记录；本轮不做 HTTP 验证。
- 后续展望（暂不布置）：封装成函数 → 由 main.py 的 GET /resources 调用，完成内存数据到 SQLite 的迁移。

## 2026-10-10 · 排错经验：同名变量分属两个文件

- 学生提问：main.py 里已经有 resources，为什么 database.py 还要再设一个？
- 澄清：两处 resources 属于不同文件（模块），是两个互不相干的变量；Python 的变量归属单位是文件，同名不代表同一个。
- 学生已自行尝试过 `#from main import resources`（database.py 第 2 行注释）。已说明当前不宜借用，理由三条：① 数据源不同（main.py 是内存示例数据，database.py 来自 learning.db）；② 下一步 main.py 会 from database import，反向再 import 会造成循环导入；③ 练习阶段应隔离，避免误改接口数据后难以定位问题。
- 变量改名建议：练习中改用 result / resource_list，避免与 main.py 同名混淆。
- 补充：main.py 中的内存列表属过渡实现，接入持久化后 GET /resources 改为调用 database 的函数，该行将被删除，POST 的编号计算也需改为基于数据库。

## 2026-10-10 · 排错：空循环把错误藏起来了

- 学生提交的转换代码有 4 处问题：① `for res in result:` 循环对象写成 result（此时为空列表），导致循环体执行 0 次；② `result.appned(...)` 拼写错误（应为 append）；③ `"status":[3]` 漏写 res（应为 res[3]）；④ `print(rows)` 打印原始元组而非 result。
- 老师实际运行：退出码 0，无任何报错；输出仍为 `[(1, '数据结构', 'book', 'reading')]` 与 `ok`，说明转换未生效。
- 关键教学点：空循环掩盖了 ② 的 AttributeError，形成"不报错但结果错"的静默失败。验证必须看输出内容，不能只看有没有抛异常；循环前可先 print(len(rows)) 确认数据已取到。
- 期望修正后输出：`[{'id': 1, 'title': '数据结构', 'type': 'book', 'status': 'reading'}]`。学生修正并提交后再验收。
- 学生第二次提交：①（循环对象改为 rows）与 ②（append 拼写）已修正，循环已实际执行。老师以同逻辑独立复跑，result 为 `[{'id': 1, 'title': '数据结构', 'type': 'book', 'status': [3]}]` —— 可见 ③ 仍未改，status 取到的是列表 [3] 而非 res[3]；④ print(rows) 未改，故终端仍显示原始元组，掩盖了转换已生效的事实。
- 待修正：③ `"status":res[3]`；④ `print(result)`。

## 2026-10-10 · 元组转字典验收通过

- 学生第三次提交：③ 改为 res[3]、④ 改为 print(result)（并保留一行 print(rows) 作对照）。
- 老师实际运行 database.py，输出 `[(1, '数据结构', 'book', 'reading')]`、`[{'id': 1, 'title': '数据结构', 'type': 'book', 'status': 'reading'}]`、`ok`，与预期一致。
- 老师只读复核数据库：COUNT(*) 仍为 1、记录未变，确认本轮为纯读操作、无副作用。
- 结论：元组→字典转换已掌握；sqlite3 的连接/建表/插入/查询/行转换五项动作全部跑通。
- 本轮三轮迭代的调试经验：① 空循环导致静默失败（退出码 0 但结果未转换）；② 修好循环才会暴露 append 拼写错误；③ 漏写 res 使 status 取到列表 [3]；④ 打印错变量会把"已生效"误判为"没生效"。

## 2026-10-10 · 下一小步（待学生实现）

- 目标：把"查询 + 转换"这段封装成一个函数 get_resources()，返回字典列表；仍不改 main.py。
- 语法要点：`def 函数名():` + 缩进；函数内部自己 open 连接、用完 close；用 `return` 把结果送出（而不是 print）；文件底部用 `print(get_resources())` 自测。
- 提示点：函数内部的 collection 与模块级 collection 同名但不同物（局部 vs 全局），是上一轮"同名不同变量"问题的深化。建表段用完连接后需 close()。
- 预期：`print(get_resources())` 输出 `[{'id': 1, 'title': '数据结构', 'type': 'book', 'status': 'reading'}]`。
- 后续：main.py 的 GET /resources 改为调用 get_resources()，删除内存列表，完成持久化接入。

## 2026-10-10 · 排错：INSERT 再次生效导致数据重复

- 学生本轮提交的 database.py 中，第 31–32 行的 INSERT/commit 被取消注释、重新启用；同时用三引号包裹旧代码充当注释，并出现两个同名函数定义（一个被三引号包住、一个是真代码），函数内部复用了全局 collection 而非自开连接。
- 老师只读查询：COUNT(*) = 4，四条完全相同的记录（id 1..4 均为 数据结构/book/reading）。为避免继续污染，本轮未运行 database.py（一旦运行即变 5 条）。
- 已要求学生立即执行：① 重新注释 INSERT/commit；② 执行 `DELETE FROM resources WHERE id > 1` 并 commit，保留 id=1，随后复核 COUNT(*) 应为 1。
- 下一轮再处理（本轮不布置，避免一次改太多）：三引号不是注释而是字符串字面量（应改用 # 或删除，且内容含三引号时会直接语法错误）；重复的函数定义应删除一份；函数应自开连接、自关连接而非复用全局 collection（接入 FastAPI 后全局连接无法跨请求安全复用）；函数名建议用复数 get_resources()；`cur=collection.cursor()` 再 `cur.execute()` 与 `collection.execute()` 等价，可简化。
- 教学提示：学生已第二次把 INSERT 误启用，说明"注释是 # 而不是三引号"这一点需要明确强调。

## 2026-10-10 · 排错：相对路径连到了错误的数据库

- 学生把 delete_test.py 建在桌面并在桌面下运行，报 `sqlite3.OperationalError: no such table: resources`（第 4 行 cur.execute("DELETE ...")）。
- 诊断：脚本使用相对路径 `sqlite3.connect("learning.db")`；相对路径相对的是当前工作目录（CWD，即运行命令时所在目录），**不是脚本文件所在目录**。在 ~/Desktop 下运行，learning.db 被解析为 ~/Desktop/learning.db。
- 证据：~/Desktop/learning.db 被静默创建（0 字节，16:41）；项目内 learning.db 仍为 8192 字节、COUNT(*)=4 未变，说明 DELETE 未作用到真库。
- 关键教学点：sqlite3.connect() 在文件不存在时不报错而是新建空库，故错误表现为 "no such table" 而非 "file not found" ——"连接成功但连错地方"的典型来源，比直接报错更危险。
- 要求学生：① 脚本移入项目目录并在该目录下运行（或改用绝对路径）；② 清掉桌面 0 字节残留文件；③ 重新执行 DELETE 并复核。
- 附防坑习惯：脚本开头 print(os.path.abspath("learning.db")) 可立即暴露连错位置；呼应此前"必须在项目目录下操作虚拟环境"的同类经验。

## 2026-10-10 · 清理验收通过 + 布置代码整理

- 学生已完成：INSERT/commit 重新注释；脚本移入项目目录后执行 `DELETE FROM resources WHERE id > 1` 并 commit；桌面上 0 字节的 learning.db 已删除。
- 老师复核：项目 learning.db COUNT(*) = 1，仅存 (1, 数据结构, book, reading)，重复记录清理干净。
- database.py 现存遗留问题（本轮布置修正）：① 三处 `"""..."""` 被当注释使用，其中一处包着旧版含 bug 的函数定义（`"type":[2],"status":[3]`）；② 出现两个同名函数定义；③ 函数复用全局 collection，未做到自开/自关连接；④ 函数名 get_resource() 建议改复数 get_resources()；⑤ `cur=collection.cursor()` 再 `cur.execute()` 与 `collection.execute()` 等价，可简化。
- 本轮方案：全量重写 database.py 为「建表段（模块级，用完 close）」+「get_resources()（自开自关连接，return 字典列表）」+「底部 print 自测」，并逐条说明改动理由。
- 教学点：三引号不是注释而是字符串字面量（放在文件/函数开头还会被当作 docstring，含义不受控）；函数应自包含，不依赖外部状态——接入 FastAPI 后 sqlite3 连接无法跨线程复用，复用全局连接必然出问题。

## 2026-10-10 · 概念澄清：INSERT 与建表是两件事 / 幂等 vs 非幂等

- 学生提问：注释掉的 INSERT 两行要不要删？它是不是"建表时用到的"？并追问"难道不应该一直保存着，让他只执行一次吗"。
- 澄清一：INSERT（往表里加数据）与 CREATE TABLE（确保表存在）是两件互不相关的事，学生把二者混为一谈，且误以为 INSERT 是"建表的一部分"。
- 澄清二：建表语句**不能删**。它承担"数据库初始化"职责；IF NOT EXISTS 保证重复执行安全。若 learning.db 丢失、换机器或换目录，没有建表语句程序直接无法运行。
- 澄清三（本轮核心）：Python 模块级代码**每次运行都会执行**，不存在"让它只执行一次"的机制。真正决定"能否重复执行"的是**幂等性**：CREATE TABLE IF NOT EXISTS 幂等（跑 100 次结果相同），INSERT 非幂等（跑 100 次多 100 条）。因此非幂等操作不能放模块级，必须由**事件触发**（用户发起 POST 请求时才插一条）。
- 已用"三次运行对照图"讲解，并指出这正是上一轮数据库被写入 4 条重复记录的根本原因。
- 结论与布置：INSERT 两行建议**删除**（它已完成"验证 INSERT 语法"的使命，其语法价值已记入本日志）；其正确归宿是改造成 `add_resource(title, type, status)` 函数，供下一步 POST /resources 调用。建表段保持不动。

## 2026-10-10 · 概念讲解：脚本执行流程 / commit 与 close 的分工

- 学生提问：database.py 每次执行有哪些操作？close 每次都要执行吗？作用是什么？
- 讲解一：模块从上到下逐行执行；`def` 只登记函数、跳过函数体，真正执行发生在调用那一行。目标形态下一次运行 = 开 2 个连接、关 2 个。
- 讲解二：close 的作用有三——释放文件句柄、释放锁（否则可能 database is locked）、结束事务；"有开就有关"是配对原则，脚本退出时虽会自动回收但不应依赖（database.py 将来会被 main.py import，成为长期运行的模块）。
- 讲解三（实验验证，/tmp/close_demo.db，未触碰项目数据库）：① CREATE TABLE + INSERT 全程不 commit 就 close → 表仍在 `[('t',)]`、数据为空 `[]`（DDL 由 sqlite3 自动提交；DML 未 commit 则回滚）；② INSERT 后 commit 再 close → 数据保留 `[(1,'这条要保住')]`。
- 结论：commit = 存盘（永久写入），close = 断开（释放资源），职责不同不可互替；未 commit 的写入会**静默丢失且不报错**，与"空循环静默失败"属同一类陷阱。
- 顺带指出：get_resources() 只读，close 即可；将来 add_resource() 是写操作，必须 commit 再 close。

## 2026-10-10 · 概念讲解：幂等 / INSERT 须封装成函数 / close 关闭的是什么

- 学生提问：后续再 insert 是否要封装成函数？幂等是什么意思？close 关闭的是什么？
- 讲解一：必须封装。INSERT 非幂等，放模块级即导致每次运行插一条（4 条重复数据的成因）。封装为 add_resource(title, type, status) 后：import 时不执行、由事件（POST）触发、数据由参数传入、id 由数据库分配；写操作必须 execute → commit → close。
- 讲解二：幂等 = 同一操作执行 1 次与 N 次效果相同。生活例：电梯"关门"按钮幂等，投币非幂等。实例（/tmp/idem_demo.db）：DELETE FROM t WHERE id > 1 第 1 次影响 2 行、第 2 次影响 0 行，剩余记录数始终为 1 —— 证明 DELETE 幂等；对比 INSERT 每次叠加。
- 讲解三：close 关闭的是本次的**连接对象**（通往数据库文件的通道），不是数据库、不是表、不是数据。实测：close 后再用该连接执行语句抛 `sqlite3.ProgrammingError: Cannot operate on a closed database.`；想再查必须重新 connect —— 这正是函数要自开连接的原因。
- 生命周期类比：connect = 拨通电话，commit = 挂断前把谈好的事记进合同，close = 挂断电话；数据库文件本身不会因挂断而消失。

## 2026-10-10 · 概念讲解：为什么建表连接放在模块级（import 只执行一次）

- 学生提问：既然每个函数都要自己连接数据库，为什么文件头部（模块级）还要连接一次？
- 讲解一：两次连接的目的与生命周期不同——模块级那次只为**建表（初始化）**，`connect → execute(CREATE) → close` 三行相连，存在仅毫秒级，**不是常驻连接**；函数那次负责每次调用的读写，随调用生灭。
- 讲解二（关键）：`import` 只执行模块级代码一次（首次导入后缓存在 sys.modules）。实验（/tmp/mod_demo/）：a.py 有模块级 print，main.py 连续 `import a` 三次，输出仅一行 `>>> a.py 的模块级代码被执行了`。
- 因此 database.py 的建表代码会在 main.py import 它时**只跑一次**，正好对应 FastAPI 的启动时机：uvicorn 启动 → import main → import database（此处建表，表就绪）→ 服务器开始接收请求 → 每个请求各自调 get_resources() 开/关连接。
- 备选方案：也可封装为 init_db() 并调用一次，效果相同；当前三行直接放模块级是因意图清晰、表少，后续表变多可再抽取。
- 一句话总结：**没有任何连接是常驻的** —— 启动时一次（模块级建表），每次请求一次（函数自开自关）。

## 2026-10-10 · database.py 整理完成（老师代做机械部分）+ 布置 add_resource

- 学生要求"继续下一步"。整理事项属已讲解三遍的机械工作，故由老师代做，新知识留给学生。
- 老师改动后的 database.py：① 删除第 2 行残留 `#from main import resources`；② 模块级连接仅用于建表；③ 建表后补 `collection.close()`；④ CREATE TABLE 内部缩进整理；⑤ `get_resource()` 改名 `get_resources()`，改为自开自关连接；⑥ 去掉多余的 `cur = collection.cursor()`；⑦ 移除已注释的 INSERT/commit 演示两行。
- 验证：整理后实际运行 database.py，输出 `[{'id': 1, 'title': '数据结构', 'type': 'book', 'status': 'reading'}]`；只读复核 COUNT(*) 仍为 1。
- 布置给学生（本轮新知识）：实现 `add_resource(title, type, status)` —— 自开自关连接、参数化 INSERT 三字段、**必须 commit**、id 由数据库分配。
- 自测方式：新建 work/test_add.py 导入 add_resource 与 get_resources 并调用，**必须在项目根目录下运行**（相对路径相对 CWD）。
- 预期：测试后数据库变为 2 条，新记录 id=2（SQLite 取 max(rowid)+1），title=计算机网络、type=book、status=planned。
- 说明：测试脚本每次运行都会插入一条（非幂等，属预期）；运行一次即可。

## 2026-10-10 · 概念讲解：connection.execute() 与 cursor 的关系

- 学生提问：collection 明明可以执行，为什么之前还要实例化一个游标？
- 实测（/tmp/cursor_demo.py）：`c.execute(...)` 返回类型为 `Cursor`；`c.cursor()` 返回的也是 `Cursor`；`type(cur) is type(c.cursor())` 为 True。即 `Connection.execute()` 本质是「帮你建一个游标 → 执行 → 返回该游标」的便捷方法（语法糖），并非绕过游标。
- 佐证：现有代码 `collection.execute("SELECT ...").fetchall()` 中，`.fetchall()` 是**游标**的方法，能这样链式调用正说明 execute 返回的是游标。
- 游标的意义：保存"读到哪了"的位置（fetchone/fetchmany 逐行取，避免一次性把大结果集读入内存）；一个连接可同时持有多个游标（同一表上一边读一边写）；lastrowid、rowcount 等状态挂在游标上。
- 何时需要显式 cursor()：需逐行处理大结果集、需多个独立结果集时。日常查询直接用 `collection.execute()` 即可。
- 补充：`Connection.execute()` 是 sqlite3 的便捷扩展，**标准 DB-API（PEP 249）只规定 `Cursor.execute()`**；换用 pymysql/psycopg2 时必须显式创建游标。

## 2026-10-10 · 概念讲解：参数化查询（引号内外 / SQL 注入）

- 学生提问：`execute("INSERT ... VALUES (?, ?, ?)", (title, type, status))` 里，为什么传入的值写在引号之外？
- 讲解：引号内是 **SQL 模板**（含 ? 占位符的固定文本），引号外是 **Python 数据**。复习引号含义：`"title"` 是字符串字面量，`title` 是变量取值。
- 实验（/tmp/param_demo.py）：① f-string 拼接含单引号的数据 `O'Brien 的笔记` → `OperationalError: near "Brien": syntax error`；参数化写法正常存入 `[("O'Brien 的笔记",)]`。② 引出 SQL 注入风险（标题填 `'); DROP TABLE resources; --` 即可删表）。③ 参数必须是元组/列表：传裸整数 5 → `ProgrammingError: parameters are of unsupported type`，传 `(5,)` 正常 —— 单元素元组逗号陷阱。
- 机制总结：参数化把「SQL 结构」与「数据」**分两路**送入 SQLite，数据永不被当作代码解析；核心是**代码与数据分离**。多个 ? 按位置对应元组的顺序。
- 学生提交的 add_resource 出现三处错误：① 变量名写成 `connection`（应为 collection），实际运行 `NameError: name 'connection' is not defined`；因在 INSERT 前抛出，数据库未受影响（复核 COUNT 仍为 1）；② SQL 写成 `"INSERT INTO resources VALUE(?,?,?)(title,type,status)"` —— 列名位置错、`VALUE` 缺 S、参数误写进字符串；③ 参数未作为 execute 的第二个参数传入。已给出正确写法。
- 待办：修正后自测运行一次（将新增 id=2 的「计网」），随后删除模块级自测调用行，避免重复插入。

## 2026-10-10 · 概念讲解：SQL 列名与 Python 变量名是两个世界

- 学生提问：`execute("INSERT INTO resources (title, type, status) VALUES (?,?,?)", (title, type, status))` 中，SQL 里 resources 后的 title/type/status 与元组里的 title/type/status 是同一个东西吗？
- 答复：**不一样**。引号内是 SQL 标识符（数据库表列名，由 CREATE TABLE 定死，改了就报 no such column）；引号外是 Python 变量（由函数签名定义，可随意改名）。二者恰好同名只是命名习惯，不是语法要求。
- 实验（/tmp/name_demo.py）：① 把 Python 参数改名为 name/kind/state、SQL 列名保持 title/type/status → 正常插入 `(1, '计网', 'book', 'reading')`，证明二者相互独立。② 变量名不变、只打乱传参顺序 → 存入错位 `(2, 'book', 'reading', '计网')`，证明 ? 与参数的对应关系靠**位置**而非名字。
- 语言层面呼应：Python 中 `"title"` 是字符串、`title` 是变量；SQL 中 `'title'` 是字符串、`title` 是列名（标识符）。同一原则、不同语言——这也解释了为何值必须写在 SQL 引号之外。
- 归纳本项目三次"同名不同物"，层层递进：① main.py 与 database.py 各自的 resources（跨文件）；② get_resources() 内的 collection 与模块级 collection（局部 vs 全局）；③ SQL 的 title 与 Python 的 title（跨语言）。结论：同名 ≠ 同一个东西，遇重名先问"它属于哪一层"。
- 现状：学生尚未修正 add_resource，database.py 仍为旧版。

## 2026-10-10 · add_resource 验收通过 + 布置接入 FastAPI

- 学生提交的 add_resource 已修正为正确形态：`collection.execute("INSERT INTO resources(title,type,status) VALUES(?,?,?)", (title,type,status))` + commit + close。
- 老师复核方式：为避免污染真实数据库，先把 learning.db 与 database.py 复制到 /tmp/dbtest 运行 —— 副本上成功插入 id=3 的「计网」，证明插入逻辑正确。
- 真实数据库现状：COUNT(*) = 2，即 (1, 数据结构, book, reading) 与 (2, 计网, book, reading)，说明学生已自行成功运行过一次自测。
- 待清理：第 49 行模块级自测调用 `add_resource("计网","book","reading")` 与第 44 行 `print('ok')` 应删除，否则每次运行都会再插一条。
- 下一小步（布置）：
  · A. 改造 add_resource 使其 `return` 新记录的 id —— 用 `cursor = collection.execute(...)` 接住返回的游标，再取 `cursor.lastrowid`（须在 close 之前读取）。
  · B. 改造 main.py 接入持久化：新增 `from database import get_resources, add_resource`；删除内存列表 `resources=[...]`；GET /resources 改为 `return get_resources()`；POST /resources 改为调用 add_resource 并回填 id；顺带修正 ResourceCreat→ResourceCreate、creat_resource→create_resource 拼写。
- 验收标准：启动 uvicorn 后 GET /resources 返回数据库中的记录；POST /resources 返回 201 与新记录（含新 id）；**重启服务后数据仍在** —— 这是持久化接入的最终证明。

## 2026-10-10 · 排错：ModuleNotFoundError（解释器用错）

- 现象：启动时 main.py 第 1 行 `from fastapi import FastAPI` 报 ModuleNotFoundError。
- 诊断（老师实测）：当前 shell 的 `python` 指向 `/Users/gaoyan/.workbuddy/binaries/python/versions/3.13.12/bin/python`（非项目 venv），该解释器无 fastapi；项目 `.venv/bin/python` 一切正常（fastapi 0.142.2 / uvicorn 0.54.0，`uvicorn --version` 输出 CPython 3.14.7）。`.venv` 结构完好，**不需要重装**。
- 修复：① `cd 项目目录 && source .venv/bin/activate && python -m uvicorn main:app --reload`（激活成功时提示符前出现 (.venv)）；② 或不激活，直接 `.venv/bin/python -m uvicorn main:app --reload`。
- 自检习惯：`which python` 应输出项目 `.venv/bin/python`；或 `python -c "import fastapi; print('环境OK')"`。
- 重要提醒：切勿对系统 Python 执行 pip install fastapi 来"绕过"报错——会污染全局环境。
- 教学点：遇 ModuleNotFoundError 第一反应应是"我在用哪个 Python"，而非"要重新装包"。本项目第三次同类问题（前两次：虚拟环境未激活、相对路径相对 CWD）。

## 2026-10-10 · 排错：database.py 与 main.py 的整合错误（老师代为修正）

- 学生第二次报同一 ModuleNotFoundError，说明命令仍走错解释器。老师改用 `.venv/bin/python -c "import main"` 绕开环境问题直接查代码，暴露出两处代码错误。
- database.py 的错误：① `return new_id` 写在了 `collection.close()` **之前**，导致 `print('ok')` 与 `close()` 成为死代码、连接永不显式关闭；② 文件末尾保留模块级自测 `print(add_resource("计网","book","reading"))` —— 该调用在 **import database 时就会执行**，一旦 main.py 引入它，每次启动乃至 `--reload` 每次重载都会插入一条，危害远大于此前版本。
- main.py 的错误（上一条布置的改动只做了一半）：① `from database import get_resource` 名字错（实际函数是 get_resources）；② 内存列表 `resources=[...]` 已删，但 `list_resources()` 仍 `return resources`、`create_resource()` 仍在遍历与 append —— 三处引用未删的变量，必然 NameError；③ 类名/函数名拼写未修正。
- 老师处理：将两文件写为完整正确形态。database.py 保留建表段与 get_resources()，add_resource() 改为「cursor 接住 lastrowid → commit → close → return new_id」，并删除全部模块级自测调用。main.py 按上一条已给出的目标形态落地：导入 get_resources/add_resource、GET 返回 get_resources()、POST 调 add_resource 后回填 id。
- 现场情况：`learning.db-journal` 存在（8720 字节），系一次写入被中断所留；正常终端下 SQLite 再次打开时会自动回滚并清除，无需手动处理。
- 待学生验证：在自己的终端（非沙盒）执行 `.venv/bin/python -m uvicorn main:app --reload`，验证 GET/POST 及「重启后数据仍在」。

## 2026-10-10 · 产出《学习进度与教学方法总结》

- 学生要求总结当前进度与教学方法，用于转交其他 AI 助手参考。
- 已产出 `学习进度与教学方法总结.md`，内容含六部分：① 项目背景；② 当前进度（9 个阶段的完成情况与验收方式、当前位置、尚未开始的部分）；③ 已掌握知识清单（环境/HTTP/FastAPI/Pydantic/Python/SQLite/核心概念）；④ 踩过的 8 个坑及提炼出的可迁移规则，含三次"同名不同物"的主线；⑤ 13 条教学方法；⑥ 当前文件结构与接口说明。
- 该文档自包含，不依赖对话上下文，可直接对外分发。


## 2026-10-10 · 本轮续课：运行环境与健康接口

- 学生已解释：# 放在行首表示注释；字符串加引号，变量取值不加引号。查询练习时老师读取过 SELECT、fetchall 和 print 的实现，但本聊天未收到该版本连续两次运行的输出；其他已有练习证据保留于前文。
- 本轮再读当前文件：database.py 已包含 get_resources() 与 add_resource()；main.py 的 GET/POST 已调用对应函数。最初观察到 POST 使用 data.model.dump()；最新读取已为 data.model_dump()，不要求学生重复修改。上述均为代码阅读证据，不能替代 SQLite 版接口验收。
- 环境排错：学生确认 ModuleNotFoundError 来自显示 RESTART 的 Python 编辑器运行窗口；老师实际使用项目 .venv/bin/python 导入 FastAPI 成功（0.142.2）。因此当前采用编辑器修改文件、Mac 终端用项目虚拟环境启动 Uvicorn、浏览器验证接口。
- 学生提交服务器启动日志：Application startup complete；访问根路径 / 返回 404，当前代码未定义根路径接口。
- 学生随后提交浏览器 /health 内容：status 为 ok，message 为 学习系统已启动，与预期相符。属于学生提交的运行证据；老师独立 HTTP 检查因访问权限限制未完成。本轮无自动化测试或部署验证。
- 下一小步：学生在浏览器查看 GET /resources 并提交实际返回内容，只读取资料，不提交 POST；之后逐步审查新增逻辑，再验证 SQLite 版新增与重启后数据保留。


## 2026-10-12 · SQLite 资料查询接口验收

- 学生提交浏览器 /resources 的内容，包含 id=1、数据结构、book、reading，并回答带括号表示调用；已澄清实际函数名为 get_resources()（有 s），函数名与调用的区别。
- 老师本轮实际 HTTP GET /resources：200，响应为 [{"id":1,"title":"数据结构","type":"book","status":"reading"}]。
- 老师以独立只读 SQLite 连接复核，当前记录为 [(1, '数据结构', 'book', 'reading')]，与接口响应一致；同时读取 main.py 确认 GET 调用 get_resources()。未运行数据库插入、未修改代码或数据库。SQLite 查询接口本步验收通过；无自动化测试或部署验证。
- 当前 main.py 第10行健康响应 status 为 o，偏离原先约定的 ok，已记为后续待修正项；早期健康验证仅证明当时的版本。
- 下一小步：学生在 /docs 只提交一次 POST /resources，使用明确的虚构验证资料，提交 HTTP 状态码与响应体；随后另一步检查查询及落库，再另一步验证重启后数据保留。


## 2026-10-12 · SQLite 新增资料正常流程验收

- 学生提交 POST /resources 的真实响应：HTTP 201，title=SQLite新增验证、type=book、status=planned、id=3。
- 老师未再次提交 POST；使用独立只读连接确认数据库当前共三条：(1, 数据结构, book, reading)、(2, SQLite新增验证, book, planned)、(3, SQLite新增验证, book, planned)。id=2 与 id=3 是两条同标题的独立记录，触发两次新增的具体来源未核实，不自动删除或合并。
- 老师实际 GET /resources 返回 HTTP 200，三条资料与数据库完全一致。SQLite 版新增正常流程及新增后可查询已验收；非法输入的既有证据属于早期内存版，本轮未复测。
- 下一步基线：id 为 1、2、3，共三条记录。由学生停止并重新启动 Uvicorn，刷新 GET /resources，确认记录保留且数量不增加；本轮尚未验证重启。无自动化测试或部署验证。


## 2026-10-12 · 重启后资料保留（学生提交证据）

- 学生按布置提交重启后的完整 GET /resources 列表：id=1、2、3，三条记录的 title/type/status 与重启前基线一致；并解释资料保存在数据库中。
- 根据学生提交的重启后结果，本步符合预期：原记录保留，数量未增加。本轮老师未代为停止或重启服务器，也未独立复现重启过程；证据与前一步老师实际 HTTP / 独立只读数据库复核配合记录。
- 小阶段总结：SQLite 版资料查询和新增正常流程已验证，学生提交的重启保留检查符合预期；核心解释点包括函数名与函数调用、数据库分配 id、commit 提交与数据库文件保存。已接入数据库的代码不等同于学生全部独立掌握，继续以解释与小修改检验。
- 当前仍无网页、课程/作业管理、AI、自动化测试或部署验证。
- 下一小步：在 /docs 提交空 title、合法 type/status，预期 422 且错误位于 body/title；刷新 GET /resources 核对仍为三条原记录，验证 SQLite 版校验失败不写入。


## 2026-10-12 · SQLite 版空标题校验验收

- 学生提交 POST /resources 的 HTTP 422 响应：type=string_too_short、loc=[body,title]、input 为空字符串、min_length=1。学生解释响应状态码本身不能替代对数据库是否变化的核对。
- 老师未再次提交请求；使用独立只读连接实际查询，结果仍为原 id=1、2、3 三条记录，字段内容与基线一致，没有空标题记录。
- 本步验收：SQLite 版空标题请求被拒绝且数据库未增加记录。HTTP 响应依据学生提交，数据库状态依据老师独立只读核对；无自动化测试或部署验证。
- 下一小步：保持合法标题与 type，只将 status 设为 reading2，预期 HTTP 422、loc=[body,status]，并确认列表仍为三条原记录。


## 2026-10-12 · 按编号查询函数（原始结果）验收

- 学生要求继续亲手写代码，减少细碎问答，主要讲新知识；后续采用局部骨架、动手实现、结果检查的节奏，不反复要求复述熟悉语法。
- 学生在 database.py 新增 get_resource_by_id(resource_id)：参数化 WHERE id=?，参数为 (resource_id,)，使用 fetchone，关闭连接后 return rows。学生提交编号2、1的元组输出和不存在编号的 None 输出。
- 老师读取函数并将该函数单独执行，连接替换为真实 learning.db 的只读连接；实际验证 get_resource_by_id(1) 返回 (1, 数据结构, book, reading)，get_resource_by_id(999999) 返回 None，两项断言通过。未执行模块级测试调用，未更改数据库或核心代码，未验证详情 HTTP 接口。
- 遗留：文件末尾仍有模块级 print(get_resource_by_id(9))，接入接口前应移除，避免导入时自动查询和打印。
- 下一小步：查询存在时将元组转换成含 id/title/type/status 的字典，不存在时保留 None；先判断 None 再取下标。之后再接资料详情接口。非法状态验收与健康 status=o 仍为待办。


## 2026-10-12 · 单条资料查询返回字典验收

- 学生将 get_resource_by_id 的返回值从元组改为字典，曾先用列表 append 得到单元素列表，随后改为直接赋值字典；学生提交 id=1 的字典输出。
- 讲解：fetchone 已将结果取到 Python 变量，close 关闭连接不删除结果；当前写法须在所有 return 前关闭连接。空结果先判断 is None，避免对 None 使用下标。
- 老师读取当前函数，并单独执行该函数，连接为真实数据库的只读连接；实际确认 id=1 返回 {'id': 1, 'title': '数据结构', 'type': 'book', 'status': 'reading'}，id=999999 返回 None，两项断言通过。未执行模块级测试调用或详情 HTTP 测试。
- 遗留：末尾模块级 print(get_resource_by_id(1)) 仍在，需删除以免导入时自动打印。
- 下一小步：学生在 main.py 添加 GET /resources/{resource_id}，路径参数为 int；存在则返回资料字典，不存在则抛出 HTTPException 404。核心接口由学生实现。


## 2026-10-12 · 资料详情接口验收

- 学生已实现 GET /resources/{resource_id}，整数路径参数传给 get_resource_by_id；None 分支抛出 HTTPException(404, detail=资料不存在)，否则返回字典。
- 排错：最初路由注册为单数 /resource/{resource_id}，访问复数 /resources/... 导致请求未匹配；学生已修正为复数。讲解 GET 可以接收查询参数，HTTP 方法按操作目的选择；保存文件后运行进程需重新加载，--reload 可用于开发时自动重载。
- 老师本轮实际 HTTP 验证：GET /resources/1 返回 200 和数据结构资料字典；GET /resources/999999 返回 404 与 {"detail":"资料不存在"}。详情接口两条分支验收通过，无部署验证。
- 下一小步：学生在 database.py 编写 update_resource_status(resource_id, new_status)，使用参数化 UPDATE、commit，返回 cursor.rowcount；仅测试虚构的 id=2 记录和不存在编号，不修改真实书籍记录。接口接入留到下一步。
- 遗留：database.py 末尾模块级测试 print 仍需清理，health 的 status=o 需恢复，SQLite 版非法状态检查仍未完成。


## 2026-10-12 · 修改状态数据库函数验收与模块测试遗留

- 学生实现 update_resource_status(resource_id, new_status)，参数化 UPDATE 按 id 筛选，commit 后保存 cursor.rowcount，关闭连接后返回行数。曾漏 close，修正后已补齐。
- 老师独立只读核对真实数据库：id=2 的虚构验证资料状态为 completed；学生本轮只回复 ok，未提供该次命令完整输出，不能据此断定具体哪次调用改变状态。
- 老师从当前文件提取更新函数，在真实数据库的临时副本上实际执行：存在编号2返回1，状态提交为 completed；不存在编号999999返回0；其他记录不变；两个函数调用均关闭连接。原始数据库未被测试修改。函数本身验收通过，尚未接入修改状态 HTTP 接口。
- 当前文件末尾重新出现 print(update_resource_status(2, "completed"))。导入 database.py 时会执行更新；重复出现模块级测试调用，先讲模块入口机制，不继续叠加接口。
- 下一小步：用 if __name__ == "__main__": 包住这条测试调用，直接运行文件时测试、被 main.py 导入时不执行测试。检查后再接 PATCH 状态接口。


## 2026-10-12 · 状态更新输入模型验收

- 学生在 main.py 定义 ResourceStatusUpdate(BaseModel)，仅包含 status: Literal[planned,reading,completed]，与新增资料模型分开。
- 老师读取 database.py，确认末尾自动调用更新的测试已删除；当前未采用入口判断，而是清理测试调用，已解决导入时自动更新的遗留问题。
- 老师从 main.py 单独执行该模型定义：status=reading 构造成功，status=reading2 触发 ValidationError / literal_error，两项检查通过。未导入应用、未修改数据库，尚无状态更新接口的 HTTP 验证。
- 下一小步：学生导入 update_resource_status，编写 PATCH /resources/{resource_id}/status；接收整数路径编号与 ResourceStatusUpdate 请求体，更新影响行数为0则404，否则查询并返回更新后的资料。测试只使用虚构验证资料 id=2。


## 2026-10-13 · PATCH 状态接口修正与响应核对

- 学生先提交只含 status 的请求返回 422，错误提示缺少 title/type；代码阅读定位为 PATCH 错用了 ResourceCreate。该输入模型适用于新增，状态修改应使用 ResourceStatusUpdate。
- 学生亲手修正：使用状态更新输入模型、删除重复更新调用、返回 get_resource_by_id(id) 的完整记录，不再访问状态模型中不存在的 title/type。老师读取当前代码确认上述改动；此前实际读取运行中 OpenAPI 确认 PATCH 请求体引用 ResourceStatusUpdate。
- 学生提交两次响应体：编号2返回完整资料，status=reading；不存在编号返回 detail=未查询到该书籍。此次未贴状态码，因此不能将 HTTP 200/404 记为已独立核实。
- 老师本轮独立只读查询真实 learning.db：id=2 为 SQLite新增验证、book、reading，共三条记录；确认目标状态已保存，未代为提交 PATCH。当前 id=1 为 completed，其变更来源未核实，不能断言本次请求只修改了编号2。
- 当前证据：代码阅读、运行中接口声明、学生响应体、老师只读数据库核对；本轮未独立复现 PATCH 请求、未执行部署验证。
- 下一小步：学生对编号2提交 status=reading2，预期 HTTP 422 / literal_error，随后 GET /resources/2 确认状态仍为 reading；补齐修改接口的非法输入检查。


## 2026-10-13 · PATCH 非法状态检查（学生提交证据）

- 学生提交 PATCH 非法状态 reading2 的 HTTP 422 响应，错误为 literal_error，位置为 body/status，允许值为 planned / reading / completed。
- 随后学生提交三条资料的完整查询列表：id=1 completed、id=2 reading、id=3 planned，与上一步老师只读数据库基线一致。虽然提交的是列表而非单条详情，也能核对目标编号2的状态未改变。
- 依据学生的 HTTP 错误响应及后续查询结果，非法状态请求被拒绝且原状态保留的检查符合预期；本轮老师未独立重复该请求或查询数据库。正常更新及不存在编号响应此前未贴状态码，相关证据限制保留。
- 小阶段知识：PATCH 部分修改使用独立输入模型；Literal 在调用更新逻辑前限制允许值；rowcount=0 对应未找到记录；更新后重新查询返回完整资料。当前已实现 SQLite 资料新增、查询、详情与状态修改，尚无网页或 AI。
- 下一小步：由学生将 main.py 健康接口的 status 从 o 改为约定的 ok，保存后访问 /health 验证；老师不代写核心代码。


## 2026-10-13 · 按状态筛选数据库函数验收与健康修正

- 学生实现 get_resources(status=None)，无参数时查询全部，传入状态时使用 WHERE status=? 和单元素参数元组，两条分支均 fetchall、转换字典列表、关闭连接并返回。
- 老师单独提取函数执行，将连接替换为真实 learning.db 的只读连接：默认查询返回 id=1/2/3；reading 返回 id=2；planned 返回 id=3；completed 返回 id=1；reading2 无匹配返回空列表；检查各调用均关闭连接。原数据库未被修改，未执行模块级调用。
- 当前函数内的两份字典转换逻辑重复，但不影响本步功能；status==None 当前可运行，通常采用 is None。模块末尾 print(get_resources()) 仍存在，导入时会额外查询并打印，属于后续清理项，当前没有自动插入或更新调用。
- 学生同时将 health 的 status 修正为 ok；老师实际 HTTP GET /health 返回 200 与 {"status":"ok","message":"学习系统已启动"}，本项已验收。
- 筛选函数未接入 HTTP 参数，不能把数据库层的 reading2 空列表视为 HTTP 校验结果；HTTP 层将沿用 Literal 拒绝非法状态。
- 下一小步：学生在 main.py 给 list_resources 增加可选 status 查询参数，将值传给 get_resources；默认 URL 返回全部，?status=reading 返回正在读的资料。


## 2026-10-13 · 查询参数接入与状态拼写待修正

- 学生给 list_resources 增加可选 Literal 状态参数，并正确传给 get_resources(status)。
- 老师实际只读 HTTP 验证：GET /resources 返回 200 与三条资料；?status=reading 返回 200 与编号2；?status=completed 返回 422 / literal_error，错误位置为 query/status。
- 定位：main.py 第13行允许值写成 comleted，缺少字母 p。此为允许值约定错误，不是 Python 语法错误；Literal 按字面字符串匹配，合法 completed 被拒绝。
- 下一小步：学生将 comleted 改为 completed，保存后访问 ?status=completed，预期 HTTP 200 与编号1资料；筛选完整验收尚未完成。本轮未修改代码或数据库。


## 2026-10-13 · 状态筛选接口拼写修正验收

- 学生已将 list_resources 中的 comleted 修正为 completed，并提交 reading 筛选结果，包含编号2资料。该提交不是 completed 的结果，老师未将两者混为一谈。
- 老师读取实际代码确认修正，并实际只读 HTTP 验证：?status=completed 返回 200 与编号1、数据结构、book、completed；?status=comleted 返回 422 / literal_error，错误位置 query/status。此前默认查询和 reading 筛选已实际验证为200。
- 本步验收：查询参数传入数据库函数、默认查询与已测状态筛选正常、已测非法拼写被拒绝。未修改核心代码或数据库，无部署验证。planned 状态的函数层检查已通过，本次未单独进行该状态的 HTTP 验证。
- 新知识：可选参数的默认值 None；URL 的 ?status=...；Literal 对查询参数的允许值限制。
- 下一小步：整理 get_resources 中重复的结果转换代码，练习将公共处理放到 if/else 之后；模块级查询 print 的清理仍待完成。


## 2026-10-13 · 查询公共处理合并验收与 Git 准备

- 学生将 get_resources 两个分支中的字典列表转换合并到 if/else 后，关闭连接与返回同样共用；老师读取当前文件确认模块末尾的 print(get_resources()) 已删除。
- 老师单独提取函数，通过真实 learning.db 的只读连接实际验证：无参数结果与独立 SELECT 全部记录一致；reading 返回编号2；reading2 返回空列表；调用均关闭连接。数据库未修改，本轮未重复 HTTP 验证。
- 小阶段知识：默认参数与可选查询参数、参数化状态筛选、缩进决定分支与公共处理范围。资料查询、新增、详情、状态修改与状态筛选已实现，证据限制仍保留在对应验收条目中。
- Git 实际核对：git rev-parse 返回 not a git repository，当前项目及其父目录未识别为 Git 仓库；.gitignore 已忽略虚拟环境、Python 缓存、.DS_Store 与 .env，但尚未忽略数据库。不能据此宣称 GitHub 建仓或同步完成。
- 下一小步：学生在现有 .gitignore 添加 *.db 与 *.db-*，为公开代码时排除本地数据库及 SQLite 辅助文件做准备。初始化 Git 后再实际验收忽略效果，随后按网页建仓、终端提交的既定方式逐步同步。


## 2026-10-13 · 数据库忽略规则文件检查

- 学生在现有 .gitignore 添加 *.db 和 *.db-*，原有虚拟环境、缓存、.DS_Store 与 .env 规则保留。老师读取实际文件，确认没有额外反斜杠或终端提示符 %；此次验证仅为文件内容核对。
- 当前 .git 目录仍不存在，不能据文件内容认定 Git 忽略已实际生效。下一小步：学生在项目目录执行 git init，随后用 git check-ignore -v learning.db 验证规则，并提交 git status 输出；暂不提交或推送。


## 2026-10-13 · 本地 Git 初始化与忽略规则验收

- 学生提交 git init 输出，本地仓库位于 fastapi-learning/.git/，当前分支 main，尚无提交。
- 学生提交 git check-ignore 与 git status；老师独立只读核对：learning.db 命中 *.db、.venv/ 命中 .venv/、learning.db-wal 路径命中 *.db-*。暂存区差异为空，数据库与虚拟环境未出现在未跟踪文件列表。
- 当前未跟踪文件还包括 .vscode、delete_test.py、id_practice.py、学习进度与教学方法总结.md 与练习目录，保留原文件，尚未纳入本次待提交范围；用户输出中的中文路径转义只是 Git 的显示形式。
- 下一小步：由学生明确暂存 .gitignore、main.py、database.py、requirements.txt、README.md、LEARNING_LOG.md 六个文件，再检查暂存摘要及状态；首次提交与 GitHub 网页建仓/推送均尚未完成。
