# 前端源码镜像

默认 API 检测超时在 `src/utils/requestTimeout.ts` 中固定为 15000 毫秒。
初始化和新增、切换后端共五个检测入口共用该函数；浏览器已保存的自定义值仍优先。
普通 API 请求的 50000 毫秒默认值不变。

`pnpm build` 必须先通过 `pnpm test:api-timeout`。测试覆盖默认值、自定义值兼容、
普通请求超时、五个检测入口和三种语言提示。测试失败时不会生成可发布镜像。

`Dockerfile` 使用固定构建镜像、pnpm 版本和依赖锁文件，依赖下载与无网络的安装、
测试、编译步骤分开。最终镜像仅替换原运行镜像的 `/opt/app/frontend`，
不修改后端、环境变量、入口或启动命令。镜像由 GitHub CI 构建并发布，
Northflank 只负责部署，不增加构建服务或修改现有配额。

master 的 CI 通过后会发布 `ghcr.io/pjpjq/sub-store-front-end:sha-<commit SHA>`。
发布任务仅对 master 的可信事件开放，使用仓库自带的短期 GITHUB_TOKEN，
不需要 Northflank 凭据或额外的 Git 授权。镜像不包含订阅数据和运行时密钥。
生产按发布产物的固定摘要部署，而不是使用浮动 latest 标签。

升级后端基础镜像时，只修改 `RUNTIME_IMAGE` 的固定摘要，或构建时传入：

```sh
docker build --build-arg RUNTIME_IMAGE=xream/sub-store@sha256:NEW_DIGEST .
```

前端仍从本仓库源码编译，15 秒默认值及回归测试会随新镜像保留。
同步上游前端源码后同样必须通过构建测试；不要改回下载上游预编译 dist 的流程。

生产部署选择本仓库已通过构建的 GHCR 镜像，不再直接切换到上游浮动镜像。
部署时移除旧的三个前端 runtimeFiles 覆盖，保留所有其他环境变量和部署设置。
