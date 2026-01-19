# Vercel 部署指南

本文档介绍如何将 LOF 监控系统部署到 Vercel，并配置每天定时推送。

## 1. 准备工作

### 1.1 获取企业微信机器人 Webhook

1. 在企业微信群中添加群机器人
2. 复制 Webhook URL 中的 `key` 参数
   - 例如：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx-xxx-xxx`
   - `key` 就是 `xxx-xxx-xxx` 部分

### 1.2 确定筛选参数

- `DIS_LIMIT`: 折溢价率下限（如 `-5` 表示 >= -5%）
- `PRE_LIMIT`: 折溢价率上限（如 `5` 表示 <= 5%）
- `MAX_ITEMS`: 最大显示条数（如 `20`）

## 2. 部署到 Vercel

### 2.1 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/lof-monitor.git
git push -u origin main
```

### 2.2 在 Vercel 导入项目

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "Add New..." → "Project"
3. 选择你的 GitHub 仓库
4. 点击 "Import"

### 2.3 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `WECHAT_WEBHOOK_KEY` | `ed6b3530-xxxx-xxxx` | 企业微信机器人 Key（必填） |
| `DIS_LIMIT` | `-5` | 折溢价率下限 |
| `PRE_LIMIT` | `5` | 折溢价率上限 |
| `MAX_ITEMS` | `20` | 最大显示条数 |
| `CRON_SECRET` | `your-random-secret` | Cron 验证密钥（可选） |

**设置步骤：**
1. 进入 Vercel 项目页面
2. 点击 "Settings" → "Environment Variables"
3. 逐个添加上述变量
4. 点击 "Save"

### 2.4 部署

配置完成后，点击 "Deploy" 开始部署。

## 3. 配置定时任务

项目已经配置了 Vercel Cron Job，会在**每个工作日（周一至周五）北京时间 10:00** 自动执行。

### 3.1 Cron 配置说明

`vercel.json` 中的配置：

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 2 * * 1-5"
    }
  ]
}
```

- `0 2 * * 1-5` 表示 UTC 时间 02:00（即北京时间 10:00），周一到周五执行
- 如需修改时间，调整 `schedule` 字段

### 3.2 常用 Cron 表达式

| 需求 | Cron 表达式 | 说明 |
|------|-------------|------|
| 每天 10:00 | `0 2 * * *` | UTC 02:00 = 北京 10:00 |
| 每天 9:30 | `30 1 * * *` | UTC 01:30 = 北京 09:30 |
| 每天 15:00 | `0 7 * * *` | UTC 07:00 = 北京 15:00 |
| 工作日 10:00 | `0 2 * * 1-5` | 周一到周五 |
| 每小时 | `0 * * * *` | 每小时整点 |

### 3.3 注意事项

⚠️ **Vercel Cron 限制**：
- **Hobby（免费）计划**：每天最多 1 次 Cron 执行
- **Pro 计划**：无限制

如果你使用免费计划，每天只能执行一次定时任务。

## 4. 手动测试

### 4.1 测试 API

部署完成后，访问以下地址测试：

```
# 查询数据（不推送）
https://你的域名.vercel.app/api/lof

# 查询并推送
curl -X POST https://你的域名.vercel.app/api/lof

# 测试 Cron 任务
https://你的域名.vercel.app/api/cron
```

### 4.2 查看 Cron 日志

1. 进入 Vercel 项目页面
2. 点击 "Logs" 查看执行日志
3. 或在 "Settings" → "Crons" 查看 Cron 执行记录

## 5. 常见问题

### Q: 推送失败怎么办？

1. 检查 `WECHAT_WEBHOOK_KEY` 是否正确
2. 确认企业微信机器人未被删除
3. 查看 Vercel Logs 中的错误信息

### Q: 如何修改筛选条件？

在 Vercel 环境变量中修改 `DIS_LIMIT` 和 `PRE_LIMIT` 的值，保存后会自动重新部署。

### Q: 如何修改推送时间？

1. 修改 `vercel.json` 中的 `schedule` 字段
2. 提交代码并推送到 GitHub
3. Vercel 会自动重新部署

### Q: 免费计划够用吗？

对于每天定时推送一次的需求，Hobby（免费）计划完全够用。

## 6. 配置示例

### 示例 1：只看折价 >= 1% 的基金

```
DIS_LIMIT=1
PRE_LIMIT=100
MAX_ITEMS=20
```

### 示例 2：只看溢价 <= -1% 的基金

```
DIS_LIMIT=-100
PRE_LIMIT=-1
MAX_ITEMS=20
```

### 示例 3：看折溢价在 -2% ~ 2% 之间的基金

```
DIS_LIMIT=-2
PRE_LIMIT=2
MAX_ITEMS=20
```
