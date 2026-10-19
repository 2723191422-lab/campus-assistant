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


## 2026-10-13 · 首次 GitHub 推送验收

- 学生完成本地首次提交 640652a（实现 SQLite 资料管理与状态筛选），六个文件、611行；之后另有 538f8fa（first commit），只向 README 追加一行仓库标题。老师实际 git log / show 核对两条历史；重复的末尾标题已在本轮文档维护中清理，历史提交未改写。
- 学生通过网页创建 campus-assistant，并配置 origin。老师在推送前实际 git ls-remote 确认仓库当时为空，检查待上传提交文件清单。
- 认证排错：学生提交的地址被聊天显示为 Markdown 链接，老师一度误判地址错误，随后直接读取 git remote -v 确认配置正确并更正判断。GitHub CLI 已安装但当时未登录；学生要求使用手动认证流程，老师说明细粒度访问令牌和 HTTPS 推送，不记录或接收令牌值。
- 学生提交推送成功输出：main -> main，已跟踪 origin/main。老师独立只读核对：本地 HEAD、origin/main 与远程 refs/heads/main 均为 538f8fa6f4497b421234095f7c0c18ef632e0568。
- 该提交树包含 .gitignore、LEARNING_LOG.md、README.md、database.py、main.py、requirements.txt；没有数据库、虚拟环境或其他未跟踪练习文件。用户创建的公开仓库为 https://github.com/2723191422-lab/campus-assistant。首次同步验收通过，不等同于部署或完整功能测试。
- 小阶段知识：忽略规则、暂存区、本地提交、远程仓库、push 与分支跟踪；已实现的资料功能及验证边界仍按对应条目记录。
- 下一小步：学生按已选定的默认 MIT 方案在项目根目录创建 LICENSE；老师检查后，再由学生将许可证与本轮 README/LEARNING_LOG 同步记录一并提交和推送。本轮文档更新尚未提交。


## 2026-10-13 · MIT 许可证文件检查通过

- 学生在根目录创建 LICENSE，复制 MIT 标准文本并填写 2026 / Rock；首次填写保留了模板方括号，学生已去掉，当前版权行为 Copyright (c) 2026 Rock。
- 老师读取完整本地文件，确认许可正文齐全、占位符已替换，没有重复许可证文件；README 已更新许可证说明。本项是本地文本检查，不是 GitHub 许可证识别或推送验收。
- 当前本轮待提交范围为 LICENSE、README.md、LEARNING_LOG.md 三个文件；核心代码、数据库及原有提交未改动。下一小步：由学生明确暂存这三个文件，提交并手动推送，再核对远程最新提交与 LICENSE。


## 2026-10-13 · MIT 与文档推送验收，准备网页基础

- 学生保存许可证修正后，按教学步骤完成提交与推送，本轮回复 ok；老师不以 ok 作为成功证据，而是实际读取 Git 状态与远程分支。
- 最新提交 ccc4a6721e1c6f56b84b4a437abcf61043fc3ba9，说明为添加 MIT 许可证并更新项目记录；修改三个文件、45行新增、2行删除，其中 LICENSE 新增21行。本地 HEAD、origin/main 与远程 refs/heads/main 一致，验收通过。
- GitHub 连接器只读读取仓库 API，license.spdx_id=MIT，确认平台已识别许可证；此前终端读取 API 遇到本机 Python 证书问题和系统网络403，不据这些失败推断仓库失败，未改项目环境或关闭证书验证。
- Git 基础小阶段已完成：忽略本地数据库、明确暂存文件、本地提交、手动 HTTPS 认证与推送、MIT 文件配置及远程核对。原有未跟踪练习文件保留，没有随本次推送上传。
- 当前项目未发现 HTML 或 JavaScript 文件，下一小步由学生创建根目录 index.html，填写网页标签页标题和正文一级标题，并用浏览器打开本地文件预览；本步不代写核心页面，也尚未接入 HTTP 或资料查询。


## 2026-10-13 · HTML 纳入教学与首个标签练习

- 学生明确要求把 HTML 纳入教学任务；后续从标签、页面结构、列表、链接及表单逐步学习，结合资料库页面实践；CSS 与 JavaScript 随实际需求引入，新知识逐行讲解，核心页面由学生亲手写。
- 老师只读检查：根目录 index.html 已创建，内容仍为空；没有据文件存在宣称网页已经实现或浏览器验证成功。
- 为一次只掌握一个新概念，本步只写 h1 一级标题标签并自选标题文字，在本地浏览器预览；完整文档骨架和 FastAPI 返回页面留给后续小步。浏览器可显示 HTML 片段，本练习不是完整 HTML 文档。
- README 与本日志已记录教学安排，本轮未修改 index.html 或其他核心代码。


## 2026-10-13 · HTML 页面结构与文本列表代码检查

- 学生亲手完成 index.html：DOCTYPE、html/lang、head、meta/charset、title、body、h1、p、h2、ul 和两个 li 条目。老师读取当前文件确认标签位置与嵌套正确，空行不影响结构。
- 编码排错：初始最小片段没有编码声明，学生报告乱码；老师确认文件可按 UTF-8 正确解码，指导补充 meta。随后学生把 meta 误写成 html、语言值误写为 zh=CN，已亲手修正为 meta charset="utf-8" 与 lang="zh-CN"。没有独立查看浏览器解码过程，不将推测写成已确认根因。
- 列表排错：学生最初使用两个 ul 直接包住书名，缺少 li；经提示改成一组 ul 内的两个 li。ul 表示列表容器，li 表示每一项。
- 显示证据：学生明确确认网页主标题“学生生活助手”与标签页标题“我的资料库”；段落、圆点列表及二级标题目前仅做代码检查，尚未收到明确显示结果，也未独立进行浏览器验证。
- 本阶段掌握目标：编码与语言属性的区别、head/body 的用途、title 与 h1 的显示位置、h1/h2 内容层级、段落与列表嵌套。学生的独立解释能力仍按后续练习观察，不以保存文件认定全部掌握。
- 当前网页通过本地文件预览，列表为手写示例内容；尚未由 FastAPI 返回 HTML，也未用 JavaScript 获取数据库资料。老师本轮访问本地 /health 未能连接，不能宣称服务正在运行。
- 下一小步：学生亲手写 a/href 链接，启动已有服务后点击进入 GET /resources 查看 JSON 列表；这只是页面跳转，网页内动态资料展示留到后续。老师仅更新 README 与本日志，未代写 HTML、未修改数据库、未提交或推送。


## 2026-10-13 · 资料链接与接口中文显示排错

- 学生在 index.html 添加 a/href 链接，指向 http://127.0.0.1:8000/resources；老师读取实际文件确认写法正确。学生随后提交 JSON，其中标题显示为“鏁版嵁缁撴瀯”等乱码，明确区别于正常 JSON 标点与单行排版。
- 老师通过只读 SQLite 查询确认三条原始标题正确；随后实际 HTTP GET /resources 返回200与正确中文，Content-Type 为 application/json。默认 JSON 类型本身正常；根据与学生显示结果的对照，浏览器解码是主要排查方向，未独立查看浏览器编码设置。
- 先前默认沙箱内本地请求未能连接；本轮获准在沙箱外只读访问本机接口成功。此工具访问差异不能作为服务器曾停止的直接证据。
- 学生亲手导入 JSONResponse，并用原来的 get_resources(status) 作为 content，media_type 指定 application/json;charset=utf-8；也为 /health 添加相同提示。老师未改核心代码。
- 老师实际 HTTP 验证两接口均为200、响应头包含上述 UTF-8 提示，资料接口仍返回三条正确中文记录，健康检查返回 status=ok 与“学习系统已启动”。此为代码和 HTTP 验收；学生尚未明确提交刷新后的浏览器中文结果，不宣称乱码已彻底修复。
- 本步知识：a/href 的跳转目标、HTML 的 meta 声明只作用于该 HTML、JSONResponse 的 content 与 media_type 命名参数、响应头与响应内容的区别。
- 下一小步：学生使用 FileResponse 为 GET / 添加路由，返回已写好的 index.html，通过 http://127.0.0.1:8000/ 验证网页；资料列表仍为静态示例，动态查询之后学习。本轮文档更新未提交或推送。


## 2026-10-13 · HTML 首页 HTTP 验收与 Git 暂存准备

- 学生亲手导入 FileResponse，新增 GET / 与 home()，返回 FileResponse("index.html")。老师读取 main.py 与 index.html，确认路由及文件名正确。
- 老师实际 HTTP GET / 返回200，Content-Type 为 text/html; charset=utf-8，响应正文与当前 HTML 文件一致，包含标题、说明、两个书籍条目、健康检查和资料查询链接。未独立查看浏览器渲染，不将 HTTP 验收等同于浏览器显示或部署验收。
- 当前 HTML 的两个链接分别指向 /health 和 /resources，文字为“查看资料1”和“查看资料2”。学生另为资料详情与状态更新成功响应添加 JSONResponse/UTF-8 提示；老师本轮仅做这些代码的阅读，未重新执行详情 HTTP 或 PATCH 写入。
- 小阶段知识：HTML 文档与内容层级、ul/li 嵌套、a/href 跳转、JSONResponse 的响应提示、FileResponse 返回 HTML 文件、通过根路径进入项目网页。页面仍为静态手写书籍列表，尚未用 JavaScript 获取并展示数据库资料。
- 老师实际读取 git status 与已跟踪文件差异：main.py、README.md、LEARNING_LOG.md 有未暂存修改，index.html 为未跟踪文件；其他练习与配置文件仍未跟踪。已检查这四个文件的具体内容，未发现密钥或个人附件。
- 下一小步：学生在项目目录明确暂存 main.py、index.html、README.md、LEARNING_LOG.md 四个文件并提交状态输出；老师检查暂存范围后再指导本地提交与手动推送。当前未替学生暂存、提交或推送。


## 2026-10-13 · HTML 首页与编码提示推送验收

- 学生明确暂存 main.py、index.html、README.md、LEARNING_LOG.md；老师独立读取暂存区文件清单和完整差异，确认本次范围为四个文件，内容为首页、响应编码提示和已有项目文档。
- 学生提交并手动推送，提交 1a605aa（添加 HTML 首页与中文编码提示），四个文件、83行新增、7行删除。老师实际核对本地 HEAD 与 GitHub refs/heads/main 均为 1a605aa2a534f89aea2d9d0ed431f8bc0eb5f343；git status 显示分支跟踪 main，无已跟踪文件的未提交修改。
- 老师读取提交树：发布的八个文件为 .gitignore、LICENSE、LEARNING_LOG.md、README.md、database.py、index.html、main.py、requirements.txt，不包含数据库、虚拟环境或原有未跟踪练习文件。推送验收通过，不等同于网站部署或浏览器乱码修复验收。
- 本阶段成果：学生亲手实现 HTML 基础页面、链接及 FastAPI 首页文件响应；老师已实际 HTTP 验证首页200和 HTML/UTF-8 响应，数据库列表仍未直接展示在页面里。
- 下一小步：学生在 index.html 添加带 type="button" 与唯一 id 的资料加载按钮，仅验证显示；下一步再为按钮编写 JavaScript 行为。本轮仅补充文档，未代写按钮，未提交或推送新的文档修改；这些记录随下一阶段成果一并同步。


## 2026-10-13 · 前端教学节奏与首个 JavaScript 事件检查

- 学生明确要求前端加快节奏，一次安排几处相关修改；采用同一个可验证功能内的成组修改，核心代码仍由学生亲手写。学生又要求涉及 TypeScript 时详细学习；当前页面使用浏览器执行的 JavaScript，尚未引入 TypeScript、类型注解或编译工具。新 JavaScript 知识也逐行解释。
- 老师读取 index.html：说明段落 id=message，普通按钮 id=load-resources，两个 const 变量按 id 找元素，showMessage() 修改段落 textContent，click 事件传入函数引用。名称对应与脚本在正文末尾的位置正确，本次为代码阅读检查，未独立执行浏览器点击。
- 函数内赋值语句当前未写分号；该处 JavaScript 可自动补分号，不把它误判为必然导致运行失败的语法错误。
- 当前点击代码写入的是固定书名文字，尚未发 HTTP 请求或查询数据库。下一小步：保留元素查找，学生用 async/await 和 fetch 查询 /resources，再通过 response.json() 解析数组，在段落显示数量；本步先验证成功请求，错误处理与列表渲染随后学习。
- 本轮只维护 README 与本日志，未修改 HTML、数据库或 Git，未宣称新的请求或浏览器验收通过。


## 2026-10-13 · JavaScript 异步请求代码检查与列表展示练习

- 学生再次明确要求 JavaScript 与 TypeScript 注重语法讲解；前端仍按同一个功能成组修改，新语法讲清执行顺序、数据类型、作用域和传入值。当前页面仍是 JavaScript，未引入 TypeScript 编译工具。
- 老师读取 index.html：学生已实现 async loadResources()、await fetch("/resources")、await response.json()、resources.length 计数与 click 函数引用绑定，两个元素 id 对应正确。这是代码阅读检查；尚未独立在浏览器点击，也未收到明确的计数显示结果。
- 当前 ul 仍含两条手写书名；接口结果用于计数，尚未填入列表。下一小步：给 ul 添加唯一 id，查找该元素，在解析成功后清空旧内容，再用 for...of 遍历资料对象，createElement 创建 li、textContent 设置书名与状态、appendChild 加入列表。
- 练习的验证目标：点击后显示数据库资料；重复点击不叠加列表项。清空的是页面子元素，不是数据库记录。错误处理仍留待下一步，不能据成功路径骨架宣称网络异常已处理。
- 老师仅更新原有文档，未代写脚本、修改数据库或提交推送。


## 2026-10-14 · 调整学习分工并搭建资料库前端

- Rock 明确授权：前端由老师搭建，学习重点调整为后端与数据库；此前前端核心代码必须由学生手写的要求在本次范围内被新授权取代。后端核心仍由 Rock 亲手学习实现。采用 frontend-design 技能，以纸质学习手账为视觉方向。
- 老师修改现有 index.html，保留单文件 HTML/CSS/JavaScript：自动加载真实资料、显示状态统计、刷新、通过 GET /resources?status=... 后端筛选、新增书籍 POST /resources、选择后手动 PATCH 保存状态。没有显示虚构统计或技能掌握百分比。
- 加入请求中的禁用状态、空数据提示、校验提示、读取失败与重试、写入中断时的结果不确定提示；标题通过 textContent 显示。初始列表直接来自数据库，修复旧练习中未设置 li 文字的问题。桌面与手机排版均检查。
- 验证环境位于临时目录，使用 main.py/database.py 原文件副本和 SQLite 数据库副本；使用已有 Chrome，不新增项目依赖。真实浏览器验证通过：三条原记录/中文显示、后端阅读状态筛选、重复刷新不重复、空格标题不发 POST、POST 返回201、PATCH 返回200、重载后状态保留、标题中的标签按文字显示、网络错误保留旧列表并可恢复、真实空数据库提示。
- 不存在资料的前端错误提示用模拟 HTTP 404 验证；不把它宣称为后端不存在编号的404真实验收。测试写入及清空均只发生在数据库副本。
- 新页面写入现有项目后，老师实际 GET / 返回200与 text/html; charset=utf-8，响应正文与已验证文件一致。哈希核对 main.py、database.py、requirements.txt、.gitignore 未改动；只读查询确认个人数据库原有三条记录完全一致。
- 维护现有 README 和本日志，明确前端由 AI 协助实现，保留 Rock 的学习历史与贡献边界。未操作 Git 暂存、提交或推送，本次改动待按既定手动流程同步。
- 下一项后端学习建议：先练习用 try/finally 保证数据库连接在异常时也关闭，一次只修改一个查询函数；前端在后续后端接口完成时继续配合接入。


## 2026-10-14 · 前端组件中文注释

- 按 Rock 要求，在现有 index.html 给页面区域、统计卡片、筛选按钮、列表模板、输入框和按钮添加中文组件名称；CSS 分组标注对应组件，JavaScript 分组标注交互用途。文件开头加入修改导航，搜索“组件：”或“交互：”可定位。
- 本次只添加注释；静态比较确认 HTML 元素、属性及可见文字，CSS 样式和 JavaScript 可执行代码均与修改前一致。没有重新执行浏览器功能测试，不改动后端或数据库；未提交或推送。


## 2026-10-14 · 资料库导航悬停动画

- 按 Rock 要求，为资料库导航链接添加 transform 180ms ease 过渡，鼠标悬停或键盘聚焦时 scale(1.08)，移开后恢复；系统设置减少动态效果时取消过渡。新增中文组件注释，便于修改倍率与时长。
- 实际使用临时 Chrome 浏览器读取本地首页：悬停计算样式为 1.08 倍，移开后恢复，过渡时长为 0.18 秒；减少动态效果时为 0 秒。未触发新增或修改资料请求，未操作 Git 提交或推送。


## 2026-10-14 · 导航动画与当前区域标记

- 按 Rock 要求，资料库、新增资料链接及用户名共享轻微悬停放大效果；将原固定边框改为独立下划线，按当前地址锚点在两个导航链接间滑动，并同步 nav-active 和 aria-current。用户名仅有悬停效果，不作为导航目标。
- 下划线使用未被悬停缩放影响的 offsetLeft/offsetWidth 定位；地址变化、窗口尺寸变化和字体就绪时重新对齐。默认或其他锚点显示资料库，#add-resource 显示新增资料；这是锚点导航状态，未加入滚动位置自动切换。系统减少动态效果时关闭过渡。
- 实际 Chrome 验证通过：三处悬停放大、下划线滑动的中间位置与最终对齐、后退恢复、直接进入新增资料锚点、375px 手机对齐、减少动态效果；无页面 JavaScript 异常。只读取页面和资料，没有提交数据；未提交或推送。


## 2026-10-14 · 三个功能界面与 SPA 嵌套路由

- Rock 明确要求按功能拆成三个 SPA 界面，并确认“学习首页、资料库、新增资料”。老师沿用 frontend-design 技能与已有手账样式，在现有 index.html 实现原生 JavaScript Hash 路由；未引入框架、构建工具或新依赖。
- /app 为共用父布局，三个子路由为 /app/home、/app/library、/app/add-resource；共用顶部导航、页面介绍、提示条和页脚，route-outlet 中每次显示一个子页面。导航激活类、aria-current 和滑动下划线与路由一致；支持刷新直达、前进后退、旧锚点转换与未知路由提示。
- 首页统计与在读书籍使用已有 GET 返回的真实资料；资料库保留筛选、刷新、状态修改，新增表单独立成页。切页不重建共用导航或表单，草稿与筛选保留；草稿不跨刷新保存。新增成功后仅在用户仍停留新增页时跳回资料库。
- 实际 Chrome 验证通过：三个子页面只有当前页可见；共用 header 元素与页面标记在导航切换中不变；刷新直达、前进后退、草稿与筛选保留、导航下划线对齐、旧地址兼容、未知地址恢复、375px 各页面无横向溢出，未发生 JavaScript 页面异常。已查看桌面首页与手机新增页截图。
- 真实 GET 读取当前五条资料；测试明确拦截所有写请求。新增201/PATCH200、自动回资料库、状态变更后首页同步与标题纯文字显示均通过模拟响应验证，不宣称本轮有后端真实写入验收。个人数据库未被测试写入，后端文件与依赖未修改。
- 继续维护现有 README 和本日志，保留用户自行修改的“Rock的资料库”标题。未暂存、提交或推送；后端学习仍由 Rock 亲手完成。


## 2026-10-14 · 详情接口响应模型与实际 HTTP 验证

- Rock 亲手新增 ResourceRead，声明 id、title、type、status；详情接口使用 response_model=ResourceRead 并返回查询字典，保留不存在资料的404处理。老师只读核对改动，未代写核心代码。
- 老师实际请求正在运行的本地服务：存在编号返回200与四个字段，不存在编号返回404，非整数编号返回422；读取 OpenAPI 确认成功响应引用 ResourceRead，四个字段均为必需。只发送 GET 请求，未执行数据库查询或写入；未专项验证异常返回数据拦截，也未执行部署验证。
- Rock 用自己的话正确解释：字典交由 FastAPI 响应模型校验，直接返回 JSONResponse 会绕过这一步。记录的是本次解释与实现，不据此推断已掌握所有响应处理。
- 下一小步：由 Rock 为 GET /resources 添加 list[ResourceRead] 响应模型并直接返回字典列表；注意模型必须先定义，再被路由装饰器引用。尚未实施或验证。
- 老师仅更新现有 README 与本日志，未修改后端、数据库，未提交或推送。


## 2026-10-14 · 列表响应模型验证与筛选参数名称问题

- Rock 已将 ResourceRead 提前定义，恢复 /resources 路径，列表声明 list[ResourceRead] 并返回字典列表；服务可以响应请求。
- 老师实际 HTTP 核对 GET /resources 返回200，OpenAPI 成功响应为数组且每项引用 ResourceRead。查询参数实际名称为 resource_status。
- 实际 HTTP 验证：传 status=reading 或 status=reading2 均返回200与未筛选列表；传 resource_status=reading 正确筛选，传 resource_status=reading2 返回422。由此定位接口与原有 status 参数约定不一致，而非 SQLite 筛选失效。
- 下一小步由 Rock 将参数名恢复为 status，并同步函数内引用；允许不筛选时为 None。修正尚未实施或验证，列表功能阶段暂不标记全部完成。
- 本轮老师只发送 GET 请求并维护现有文档，没有修改核心代码、直接查询数据库、发送写入请求或提交推送。


## 2026-10-14 · 筛选名称修正与可选参数回归检查

- Rock 将列表参数名及数据库调用恢复为 status，但当前函数参数只声明 Literal，没有 | None 或 = None。
- 老师实际 GET 验证：status=reading 返回200且仅有 reading 资料；status=reading2 返回422；不传 status 返回422与 missing/Field required。OpenAPI 标记 status 必填。只读文件与 HTTP 证据一致，参数名称问题已修复，可选筛选尚未恢复。
- 下一小步：Rock 在现有类型后恢复 | None = None，保留响应模型与筛选逻辑；改完验证不筛选、合法筛选、非法筛选。尚未修正或验证通过。
- 老师仅维护现有文档，未修改后端、数据库，未发送写请求或提交推送。


## 2026-10-14 · 列表响应模型与可选筛选阶段完成

- Rock 已为 status 恢复 | None = None，保留 list[ResourceRead] 与字典列表返回。此前解释已确认对路径参数、查询参数和默认值的理解。
- 老师实际 GET 核对：不传 status 返回200与列表；status=reading 返回200且所有记录为 reading；status=reading2 返回422与 literal_error。此前已实际核对 OpenAPI 数组响应引用 ResourceRead。本轮没有新增异常响应模型拦截或部署测试。
- 本阶段学习点：输入模型与响应模型的区别，直接返回 JSONResponse 会绕过响应模型检查，list[ResourceRead]，模型定义顺序，查询参数名属于接口契约，允许 None 与默认 None 的区别。
- 下一小步由 Rock 只修改 database.py 的 get_resource_by_id，用 try/finally 在正常查询与异常时关闭连接。当前异常清理尚未实现或验证；改完先检查正常200/不存在404，再用隔离模拟异常验证 close 调用，不修改个人数据库。
- 老师本轮只做只读文件与 GET 核对并维护现有文档，未修改核心代码、直接查询数据库、发送写请求或提交推送。


## 2026-10-15 · 详情连接异常清理验证与加快教学节奏

- Rock 要求加快速度：后续同一功能的相关修改集中安排，熟悉语法不再反复提问，后端核心仍由 Rock 亲手实现。
- 老师读取 get_resource_by_id，已将查询包在 try 中并在 finally 关闭连接。finally 内关闭语句缩进较深但语法合法，后续统一为常用4空格一级。
- 实际编译检查通过；通过 AST 仅提取该函数，在内存中注入模拟连接，未导入原数据库模块、未打开数据库。4项测试通过：查到字典、未查到None、execute异常、fetchone异常；每项均确认 close 调用一次，两项异常均原样向外传播。
- 实际只读 HTTP 请求：/resources/1 为200且字段齐全，/resources/999999 为404与资料不存在。本轮未执行数据库写入，也未据此宣称真实数据库故障或部署验证通过。
- 下一组由 Rock 给 get_resources、add_resource、update_resource_status 应用同一 try/finally 模式；保持 SQL、参数、commit及返回行为。commit 留在 try 内，finally 只负责关闭。老师后续用隔离测试和临时数据库检查，不用个人数据库验证写入。尚未实现或验证。
- 当前 Git 状态显示 index.html 已删除，属于现有用户工作区改动，老师未恢复或修改；本轮未验收旧首页。只维护现有文档，未提交推送。


## 2026-10-15 · 明确新前端目录并转向笔记详情接口

- Rock 澄清新的前端为 macOSnotes 文件夹。老师实际定位到 fastapi-learning/macos-notes-frontend，Git 已跟踪前端源码；镜像目录仍有同名副本。后续以现有 FastAPI 项目内这份前端为工作对象，不移动文件。
- 只读核对 Note 类型的六个字段与 getNote 的 GET /api/notes/:id 契约，仍为 mock。没有重新构建或运行浏览器验收，未声称真实笔记接口已完成。
- 调整下一组练习：Rock 在现有 main.py 实现 NoteRead、一个 welcome 测试样例和 GET /api/notes/{note_id} 的200/404；不复制资源表充当笔记表，不修改个人数据库。先验证真实 HTTP 路由，前端 fetch 与 SQLite 随后进行。尚未代写或实施。
- get_resource_by_id 的异常清理已有上一轮测试证据；get_resources、add_resource、update_resource_status 的清理本轮读取仍未完成，保留待办，不标记已验收。
- 本轮仅补充现有文档，未修改后端核心、前端实现或数据库，未暂存、提交或推送。


## 2026-10-15 · 改为可用版本驱动的教学与笔记数据库骨架

- Rock 明确要求从项目交付视角讲解每组工作现在和未来的作用，先搭必要框架、尽快投入基本使用，再细化与扩展功能。后端核心仍由 Rock 编写；老师准备非核心骨架、前端联调、验证和文档。不再按单行语法推进或反复测问熟悉知识。
- 老师只读确认 NoteRead 已继承 BaseModel，测试时间已改为带时区字符串；实际 GET 笔记 welcome 返回200与完整六字段、未知编号返回404与笔记不存在。仍为服务端内存示例，不是 SQLite 持久化。
- 新增 notes_database.py 未完成骨架，含 init_notes_table/create_note/get_note_by_id/list_notes/update_note 五个函数，均显式抛 NotImplementedError；包含字段与行为约定，不含已写好的 SQL 实现。不在导入时执行数据库操作，未接入 main.py。实际 compile 检查通过，仅证明骨架语法有效。
- 设计保持当前六字段契约，tags 暂以 JSON 文本写入 SQLite、读取转为 list；固定 DB_PATH 避免工作目录影响，便于临时数据库验证；UUID 和 UTC 更新时间由后端生成。当前不额外建立标签/笔记本关系表。
- 本组让 Rock 集中实现五个存储函数；下一组接入 GET列表/详情、POST新建、PATCH保存，老师适配真实前端。验收以新建、打开、保存、刷新和重启保留为目标，不以只有骨架或模拟功能宣称可用。
- 本轮未创建 notes 表、未插入数据、未更改个人数据库或现有后端核心，未改前端、未提交或推送。旧资料函数剩余连接清理保留待办。


## 2026-10-17 · 笔记数据库首次实现检查：阻塞项尚待修复

- Rock 提交填写结果；老师只读核对 notes_database.py、database.py、main.py。新增与建表已有实现，详情/列表/更新仍保留 NotImplementedError，未标记五函数完成。
- 实际 compile notes_database.py 在78行报 SyntaxError，根因是 SQL 字符串内嵌 note["id"] 等双引号，同时混淆列名、占位符与参数。完整临时数据库 CRUD 测试因此未运行。
- 从源码提取 CREATE TABLE 字符串，在隔离内存 SQLite 中实际复现 near tags 的 OperationalError，字段之间缺少逗号。另独立复现 .isoformat 未调用得到方法对象，SQLite 参数绑定报不支持 builtin_function_or_method。
- database.py 中模块级 execute 同时包含两条 CREATE；提取原 SQL 在内存 SQLite 执行，实际报 You can only execute one statement at a time。附加 notes DDL 还有 EIXSTS/DEFULT 拼写、分隔符及整数ID与既定字符串ID不一致的问题，不应继续维护第二套笔记表定义。
- main.py 当前从 database 导入 notes_by_id 并调用它；新模块尚未接入。待 Rock 先恢复旧 resources 建表单条语句，将笔记实现集中 notes_database.py；修复新模块建表/新增后再验收，不据历史200/404推断当前服务可用。
- 老师仅修改本 README 与日志；未改核心代码，未导入原数据库模块或打开个人数据库，未运行写接口、未提交推送。


## 2026-10-18 · 笔记存储层临时数据库验收：13通过、更新待修

- 老师只读复查确认 notes_database.py 本轮确实已更新，建表逗号、isoformat调用、参数化INSERT均修复，详情/列表/更新已有实现；main.py 移除旧笔记导入并暂时注释笔记路由，database.py 顶部恢复单条 resources 建表。三个文件均通过实际语法解析。
- 实际加载笔记模块后、调用任何函数前，将 DB_PATH 改为自动清理的临时路径。临时数据库预置虚构 resources 哨兵行，建表两次后原表和记录保留。未导入原 database.py、未打开个人 learning.db。
- 14项检查13通过：可重复建表/保留旧表，空列表，新建及标题清理/参数绑定/UUID与时区时间，空白标题拒绝且不新增，详情/不存在，中文与含逗号标签JSON往返，时间相同按ID排序，重新加载模块并重新连接后数据保留，以及五个函数执行SQL失败时关闭连接一次/不提交/原异常传播。
- 唯一实际失败检查为保存更新：update_note 第133行 UPDATE 在逗号附近报 OperationalError。该检查后续更新时间、元信息保留和持久化断言未执行，不记为已通过。代码阅读还发现更新未校验空白标题、未生成新时间，第135行SELECT缺FROM且id=note_id写死，未处理未查到记录。
- 下一组仅修改 update_note：使用 UPDATE notes SET ... WHERE id=?，依顺序绑定标题、正文、新时间和ID，保留tags/notebook/id，成功提交并关闭后复用 get_note_by_id，未知ID返回None；补空白标题拒绝。修复后再测更新、未知ID、空白、重复保存、元信息保留，随后接四条API与前端。
- 本轮只维护现有README与日志，未代改核心实现，未接前端，未测试HTTP或完整服务进程重启，未操作个人数据库、提交或推送。


### 2026-10-18 · 更新函数再次复查

- Rock 已补空白标题检查和新时间表达式；实际临时数据库调用空白标题得到ValueError，合法更新仍因UPDATE末尾VALUES报OperationalError。代码仍将id列加入SET、WHERE写死note_id，保留重复SELECT；存储层更新未验收。
- 本轮读取期间 get_note_by_id 参数被改为可选None，文件末尾新增 print(get_note_by_id())。该顶层调用会在导入时触发数据库查询，不属于可复用存储模块初始化。下一组移除该调用、恢复明确ID参数，并修正UPDATE和返回方式。
- 老师第一次诊断未在调用查询前覆盖DB_PATH，意外连接个人数据库并尝试只读SELECT，报no such table: notes；没有执行写入语句。已向Rock披露，并立即修正隔离顺序。第二次仅加载声明，先设置临时DB_PATH再调用所有函数，未执行顶层查询；上述更新失败和空白拒绝结果来自临时数据库。
- 没有代改核心代码，未接前端或运行HTTP验收。


### 2026-10-18 · 笔记保存修复通过，进入 HTTP 接线

- Rock 修正 UPDATE，移除 VALUES，按标题/正文/新时间/编号绑定参数；查询后检查 row is None，未知编号返回 None。老师未修改后端核心代码。
- 本轮仅加载笔记模块声明，在调用函数前将 DB_PATH 指向自动清理的临时 SQLite 文件。实际通过：重复建表、空列表、新建/读取、更新标题和多行正文、更新时间变化、id/tags/notebook保留、其他笔记不变、重新查询得到已保存记录、未知ID返回None、空白标题拒绝且不改变原记录、重复保存数量不变、最近更新排序。此前模拟异常测试没有在本轮重跑。
- main.py 当前笔记示例路由仍被注释，未导入 notes_database；本轮尚无真实 HTTP 或前端联调证据，未测试完整服务进程重启，未打开或修改个人 learning.db。
- 下一组 Rock 仅修改 main.py：lifespan启动建表、NoteCreate/NoteUpdate模型、GET列表/详情、POST新建、PATCH保存；成功返回NoteRead/list[NoteRead]，不存在404，空白标题ValueError转422。老师后续用隔离数据库验收HTTP，再适配前端。
- 本轮老师只维护现有 README 与本日志，未修改核心实现，未提交或推送。


## 2026-10-19 · 笔记HTTP首次接线验收：部分通过，契约待修

- Rock 已接入lifespan启动建表、NoteCreat/NoteUpdate请求模型与四个笔记路由。老师先邀请Rock解释yield前建表的作用；代码核心未代改。
- 隔离方法：先切换到自动清理的临时工作目录，将notes_database.DB_PATH指向临时learning.db，再导入main；旧database模块的相对路径建表也只落在临时目录。短暂Uvicorn监听随机本机端口，实际HTTP请求结束后关闭并清理，未打开个人数据库。未安装额外依赖。
- 通过：lifespan建表、详情200/不存在404、已有笔记保存200与HTTP再读一致、空白标题422且原记录不变。
- 实际问题：列表返回201；约定POST /api/notes返回405，实际新建路由为/app/notes；实际路径仅交title返回422，缺id/content/tags/notebook/updatedAt，因参数误用NoteRead；临时提交完整六字段可创建但返回200；PATCH未知编号返回500，因数据库返回None后未转404。
- 下一组仅由Rock修main.py：列表200；新建路径/api/notes、请求模型NoteCreate（统一原NoteCreat命名）、成功201；保存捕获ValueError后补None转404。老师随后重新验收约定路径和输入；前端仍为mock，不标记联调或完整服务重启通过。
- 老师本轮只维护README与本日志，未修改核心代码，未提交推送。


### 2026-10-19 · HTTP复测：仅剩新建响应模型与状态码

- Rock 已修列表状态、新建路径和输入模型、保存未知编号404。再次使用临时工作目录、临时DB_PATH和短暂随机本机端口服务实际HTTP测试；未打开个人learning.db。
- 通过：空列表200；仅交title创建成功且列表包含完整六字段；详情200、保存200与HTTP再读一致；详情/保存未知编号404；新建/保存空白标题422且数据不变。
- 新发现：新建装饰器被改成response_model=NoteCreate、status_code=200，实际新建只返回title。要求仅改该装饰器为NoteRead/201，保留输入NoteCreate与函数体。新建完整响应尚未验收，不接前端。
- 老师只更新现有README和本日志，未改核心实现，未提交推送。


### 2026-10-19 · 笔记HTTP验收通过与React真实联调

- Rock 修正POST为NoteRead/201。老师实际临时HTTP验证新建201六字段、列表、详情、保存后再读、未知ID404、空白标题422且原记录不变，全部通过。200表示成功、201表达新资源已创建；这个状态码本身不执行数据库提交。
- 按已授权的前端范围，老师仅在原项目内macos-notes-frontend修改fetch适配、Vite /api代理、共享服务器笔记与草稿状态、空数据库入口和模拟范围提示；不改镜像前端，不改三个产品后端Python核心文件。文件树按真实notebook分组，搜索和标签前端计算；反链待接入仅显示中心，云同步仍模拟，偏好会话内有效。
- 实际npm run build通过。历史mock测试已改为七项真实集成测试，每项独立临时DB与真实FastAPI进程，经Vite代理由Chrome访问。七项全部通过，涵盖空库新建201/完整字段、文件树/布局/草稿/历史、保存刷新与后端进程重启、422/断线保留草稿后恢复、真实搜索/标签视图与模拟边界、404/未知路由/连接恢复、390px窄屏。预期断线场景的ECONNREFUSED日志属于故障测试，未视为真实服务不可用。
- 测试支持代码tests/run-backend.py在导入main前隔离DB_PATH和工作目录；fixtures.ts管理临时进程与重启。增加测试端口归属标记，防止误用占用端口的其他服务；不新增产品测试控制接口。所有写入测试都使用临时数据。
- 为供Rock实际使用，先只读查看个人learning.db的notes表结构，确认尚无此表；随后启动正式本机8000和5173服务，lifespan创建独立notes表（不删除/移动旧表或文件、不插入示例）。实际只读HTTP确认health200、前端200、代理/api/notes200且空列表。此处确实打开并由应用初始化个人数据库，与临时测试分开记录。
- 已更新根README、前端README和源码汇总；无Git提交或推送，不上传数据库。下一步Rock亲手新建、保存、刷新验收个人笔记，再选择下一项功能。

- 测试支持代码加固后的中间复测出现1通过/6失败，均发生在临时后端bind阶段（Address already in use），产品请求未执行；原因是我新增的原始socket未设置SO_REUSEADDR，关闭后的TIME_WAIT阻止快速复用。补上该选项且保留专属就绪标记后，最终七项Chrome测试再次全部通过（8.4秒），包括进程重启与断线恢复。此故障及修复仅涉及老师的测试启动器。


### 2026-10-19 · 中文输入问题：搜索框组合输入被路由打断

- Rock反馈无法输入中文。老师先询问具体输入位置和浏览器，尚未收到反馈；独立只读检查后端/前端，未将故障归咎数据库，也未操作个人笔记。此前fill中文只证明能接受既成文本，未覆盖输入法组合过程。
- 新增两项原生Chrome组合输入协议测试，在临时数据库运行。修复前标题/正文中文提交与保存刷新通过；搜索框原生组合从n到ni实际变成nni，断言失败。代码对应搜索输入直接把每次onChange写入URL，打断组合过程。
- 仅修前端UtilityPages.tsx：独立本地input状态同步输入，useRef记录composition，组合期间不更新URL，compositionend后提交查询；URL变化仍同步输入，保留普通搜索。未修改后端核心或数据库。
- 实际npm run build通过，九项Chrome端到端测试全部通过（原七项+中文标题/正文+中文搜索）。中文测试使用Input.imeSetComposition/Input.insertText并确认compositionstart/end；搜索还断言组合期间URL不变。此证据不等同于手动操作macOS候选窗口，用户实际问题位置仍待确认。
- 更新现有README及源码汇总；无Git提交或推送。


### 2026-10-19 · 澄清搜索语义并实现按顺序、允许间隔的匹配

- Rock举例正文“今天好开心 aaa”、查询“今天 a”，并要求符合输入语序。老师此前误解为任意词匹配；此前自动审核失败后仅在/tmp准备的任意词补丁未应用，本轮只读确认项目仍为原连续子串筛选。旧补丁已被本轮实现取代，不应执行。
- 本轮权限审核完成后，老师仅改前端api/index.ts的listNotes和搜索提示，忽略查询空白、将字符按输入顺序逐个匹配，可跳过正文中间字符；每个查询字符必须出现，重复字符需足够次数。标题/正文分别匹配，避免跨字段凑出关键词；保留标签交集筛选、大小写不敏感与空白查询全部返回。未修改Python核心或个人数据库。
- 实际构建通过；仅运行三项相关Chrome测试全部通过（5.2秒）：新增顺序匹配测试、中文搜索组合输入、既有真实笔记搜索/标签视图。新增测试通过临时真实API创建三条合成笔记，核对“今天 a”与“a 今天”分别找到不同语序的笔记、“今 开 A”允许隔字、倒序/缺字/重复字符不足不命中、全角空白查询返回全部。本轮未重跑此前九项全量测试。
- 更新现有README、学习日志与源码汇总。无Git提交或推送。


### 2026-10-19 · 下一项构建：笔记删除（已布置，未实现）

- Rock要求继续构建。老师只读复核实际项目 main.py、notes_database.py、前端API和当前Git状态：已有四类真实笔记路由及前端顺序搜索，没有笔记DELETE路由或前端删除API。保持真实项目内前端与镜像副本分离，保留全部已有改动。
- 下一组按一个可用功能推进：Rock在notes_database.py实现delete_note(note_id: str) -> bool，参数化DELETE、commit、finally关闭；用cursor.rowcount判断是否命中。main.py新增DELETE /api/notes/{note_id}，成功204空响应，不存在404，不收请求体。数据库层返回业务结果，HTTP层转换状态码。
- 不新增表；当前方案为永久删除，前端按钮接入时需明确确认。核心代码仍由Rock编写，老师尚未代写或接入按钮。完成后由老师先在临时数据库验证目标删除、其他笔记保留、重复删除404及HTTP空响应，再处理前端共享状态与路由。
- 本轮仅做代码阅读并更新现有README/日志；未运行删除、未写个人数据库、未执行新功能测试，未提交或推送。


### 2026-10-19 · 删除首次检查：存储通过，HTTP接口待修

- Rock新增delete_note和delete_by_id；老师先请他解释False如何转404，Rock回答不知道，因此集中说明正常返回值与异常的区别。False不会触发except ValueError，HTTP层需要显式if判断。
- 实际仅用AST提取学生delete_note函数，在临时SQLite预置两行合成数据验证：目标删除True、重复删除False、不存在False、其他笔记保留，共四项通过。未导入产品main或database模块，未打开个人learning.db，未发送删除HTTP请求。
- 代码阅读发现路由使用POST而不是DELETE、response_model=bool与204无响应体冲突、直接return布尔结果且只捕获ValueError无法将不存在转换为404。用独立FastAPI实例复现该装饰器配置，注册即抛AssertionError: Status code 204 must not have a response body；这是隔离复现，未声称实际完整服务启动测试通过。
- 下一步只由Rock修改main.py：改DELETE、移除bool响应模型、补note_id:str、显式检查删除返回值False并raise HTTPException(404)，成功返回Response(status_code=204)，补Response导入。老师给局部判断提示，不代写完整接口，后端HTTP/前端删除仍待验收。
- 本轮老师仅维护现有README与日志，没有修改后端核心、前端或个人数据库，没有Git提交或推送。


### 2026-10-19 · 删除再次检查：改用异常方案，路由仍阻塞启动

- Rock将delete_note改为成功返回True、不存在抛ValueError，并将接口except中的detail改为str(exc)。这使原先except无法处理False的问题在当前方案下得到解决；属于可行的替代方案，不要求再改回布尔False，也不将业务ValueError混同于数据库故障。
- AST仅提取delete_note，在临时SQLite实际通过四项：目标删除True、重复删除ValueError、不存在ValueError、其他笔记保留。其最新实际契约是True或异常，旧布尔False约定由此变更。
- 隔离临时工作目录与notes_database.DB_PATH后，实际import main在注册最后路由时抛AssertionError: Status code 204 must not have a response body。相比上一轮独立路由复现，本轮确认了当前完整应用导入阻塞；没有启动HTTP服务或执行HTTP删除测试，未打开个人learning.db。
- 仅需Rock修改main.py：POST改DELETE，移除response_model=bool，参数明确note_id:str，导入Response，成功调用数据库后返回Response(status_code=204)，保留现有ValueError转404方案。当前HTTP尚未验收，前端删除未接入。
- 老师未修改产品核心代码或前端，仅维护现有README与日志；未提交推送。


### 2026-10-19 · 保留Rock的返回方式，删除HTTP与页面接入验收通过

- Rock质疑是否必须使用显式Response，并保存DELETE方法、移除bool响应模型、补字符串参数，成功分支仍直接返回notes_db.delete_note。老师先前将显式Response说成必须，限制过头；本轮实际验证后明确纠正，保留学生写法。异常方案也保留：成功True、不存在抛ValueError，由接口捕获转404。
- 在临时工作目录设置notes_database.DB_PATH后才导入main，启动临时随机本机端口Uvicorn，通过10项真实HTTP/数据库检查：两篇新建201、删除204且响应体0字节、已删详情404、重复删除404与错误详情、未知删除404、其他笔记六字段不变、列表只剩保留项、OpenAPI DELETE无请求体与204内容、新SQLite连接确认删除已持久化。当前FastAPI 0.142.2会清空204响应体；此前实际启动阻塞来自response_model=bool与204冲突，不是直接return本身。未操作个人learning.db。
- 老师按前端授权范围更新公共request的204处理、deleteNote、NotesContext.remove、编辑器永久删除确认/忙碌保护/失败保留输入，以及成功后的笔记草稿清理和路由跳转。“文档”导航仅复用仍存在的编号，避免删除最后一篇后再次打开旧编号。没有修改main.py/database.py/notes_database.py产品核心，也未新增表或回收站。
- 新增tests/delete.spec.ts四项真实API Chrome场景：取消不发请求与草稿保留、确认204/等待期间禁用操作/清理树与计数/重启后删除仍在/搜索无结果；最后一篇空入口与文档导航；断线保留草稿并重连重试；其他页面先删后的404提示且草稿保留。等待模拟仅拦住再放行真实请求，没有伪造响应。
- npm run build实际通过。14项Chrome全量首轮13通过/1失败（26.2秒），失败是测试试图通过Chrome协议读取204响应体，报No data found for resource with given identifier，不是产品删除失败。去掉该不适用读取，空体仍由独立HTTP检查覆盖；仅重跑该场景通过（4.0秒）。产品代码无需调整；全部14场景均有通过证据，未声称修测试后又跑了一次全量。故障注入的ECONNREFUSED为预期日志。
- 更新既有根README、前端README及源码汇总。git diff --check通过（更新文档前）；所有写入测试用临时数据库，未提交或推送。当前交付是基本笔记增查改删及顺序搜索可用，标签编辑/独立目录管理/反链/云同步仍未完成。


### 2026-10-19 · GitHub同步范围与发布前核对

- Rock明确要求把自己的更改、尤其新增删除功能同步到GitHub。远端origin为2723191422-lab/campus-assistant，目标分支main；fetch后确认本地HEAD与origin/main同为既有提交，没有远端并行改动需要合并。
- 本次提交范围为已核对的项目代码与文档：笔记SQLite及五类HTTP操作（含Rock新增删除）、React真实联调/删除确认/顺序搜索/中文输入修复、测试支持和用例、说明与学习记录；同时保留Rock已有资料连接清理和旧单页入口删除。远端此前仅为mock前端，因此将删除所需的笔记链路一并同步。
- 显式列出暂存路径，不使用git add .；数据库、环境、依赖、构建产物、测试报告、AGENTS.md、.vscode和个人练习/草稿不纳入。候选文本的常见密钥模式扫描未发现匹配，未输出任何密钥值；检查确认数据库与环境等路径被忽略。
- 既有构建、10项删除HTTP/数据库、14个Chrome场景的通过证据见上一节。本轮额外实际检查三个后端模块语法，以及临时SQLite下资料新增/详情/筛选/状态更新/不存在结果，均通过；未改业务逻辑，仅清理三个Python文件的行尾空白与文件末尾空行，便于提交检查。
- 本条记录描述同步范围和发布前检查；推送是否成功另以git push结果及远端提交号核对为准，不将本地commit视为已上传。所有新增写入验证仍只使用临时数据库。
