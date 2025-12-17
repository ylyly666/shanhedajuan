# 卡牌树工具与测试

本目录包含卡牌编辑区使用的纯函数工具、创建后续卡控制器以及对应的 Jest 测试（含集成用例）。

## 运行测试

1. 安装依赖：`npm install`
2. 执行全部测试：`npm test`

新增测试覆盖：
- `cardTreeUtils` 工具函数
- `handleCreateFollowUp` 原子写入逻辑
- React Testing Library 集成用例：创建左后续卡后 DOM 顺序与选中/展开状态

测试环境基于 Jest + ts-jest（ESM），默认使用 jsdom，方便后续添加 React 组件的集成测试。

