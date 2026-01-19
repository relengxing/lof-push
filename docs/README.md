# LOF 监控系统

基于 Next.js 的 LOF 基金折溢价监控系统，支持推送到企业微信机器人。

## 功能特性

- 🔍 实时获取集思录 LOF 基金数据
- 📊 根据折价率/溢价率筛选基金
- 📱 一键推送到企业微信机器人
- 🎨 现代化的 Web 界面

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
# 企业微信机器人 Webhook Key（必填）
WECHAT_WEBHOOK_KEY=your-webhook-key-here

# LOF 筛选参数（可选，默认为 0）
# 折价率下限（正数表示折价，如 1.0 表示折价率 >= 1%）
DIS_LIMIT=0

# 溢价率上限（负数表示溢价，如 -1.0 表示溢价率 <= -1%）
PRE_LIMIT=0
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## API 接口

### GET /api/lof

获取 LOF 数据（不推送）

**查询参数：**
- `disLimit` - 折价率下限（可选）
- `preLimit` - 溢价率上限（可选）

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "代码": "[164906](https://www.jisilu.cn/data/lof/detail/164906)",
      "名称": "交银中证环境治理",
      "现价": "0.785",
      "涨幅": "0.64%",
      "净值": "0.7890",
      "折溢价率": "-0.51%"
    }
  ],
  "markdown": "| 代码 | 名称 | ... |"
}
```

### POST /api/lof

获取 LOF 数据并推送到企业微信

**请求体（可选）：**
```json
{
  "disLimit": 1.0,
  "preLimit": -1.0
}
```

**响应示例：**
```json
{
  "success": true,
  "data": [...],
  "markdown": "...",
  "wechatResponse": {
    "errcode": 0,
    "errmsg": "ok"
  }
}
```

## 定时任务

可以使用 cron 或其他定时任务工具定期调用 API：

```bash
# 每小时执行一次推送
0 * * * * curl -X POST http://localhost:3000/api/lof
```

或者使用 Vercel Cron Jobs、GitHub Actions 等服务实现自动化。

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署完成

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 技术栈

- [Next.js 14](https://nextjs.org/) - React 全栈框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [企业微信机器人](https://developer.work.weixin.qq.com/document/path/91770) - 消息推送

## 许可证

MIT
