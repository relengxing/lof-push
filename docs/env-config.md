# 环境变量配置说明

创建 `.env.local` 文件并配置以下环境变量：

```env
# 企业微信机器人 Webhook Key（必填）
# 从企业微信机器人 Webhook URL 中获取
# 例如 URL: https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxxxxxxxxxxxx
# 则 Key 为: # 例如 URL: https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxxxxxxxxxxxx

WECHAT_WEBHOOK_KEY=# 例如 URL: https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxxxxxxxxxxxx


# LOF 筛选参数
# ------------------------------------------------

# 折价率下限（可选，默认为 0）
# 正数表示折价，如 1.0 表示筛选折价率 >= 1% 的基金
# 设为 0 表示不筛选折价基金
DIS_LIMIT=0

# 溢价率上限（可选，默认为 0）
# 负数表示溢价，如 -1.0 表示筛选溢价率 <= -1% 的基金
# 设为 0 表示不筛选溢价基金
PRE_LIMIT=0

# 自定义显示字段（可选）
# JSON 格式，键为显示名称，值为数据字段名
# 默认值如下：
# LOF_CONTENT={"代码":"fund_id","名称":"fund_nm","现价":"price","涨幅":"increase_rt","净值":"fund_nav","折溢价率":"discount_rt"}
```

## 可用的数据字段

| 字段名 | 说明 |
|--------|------|
| fund_id | 基金代码 |
| fund_nm | 基金名称 |
| price | 现价 |
| increase_rt | 涨幅 |
| volume | 成交量 |
| amount | 成交额 |
| fund_nav | 净值 |
| nav_dt | 净值日期 |
| estimate_value | 估值 |
| discount_rt | 折溢价率 |
| apply_fee | 申购费 |
| redeem_fee | 赎回费 |
| fund_company | 基金公司 |
