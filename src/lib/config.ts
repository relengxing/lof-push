export interface AppConfig {
  wechatWebhookKey: string;
  disLimit: number;
  preLimit: number;
  maxItems: number;
  content: Record<string, string>;
}

export function getConfig(): AppConfig {
  const wechatWebhookKey = process.env.WECHAT_WEBHOOK_KEY || '';
  const disLimit = parseFloat(process.env.DIS_LIMIT || '-5');
  const preLimit = parseFloat(process.env.PRE_LIMIT || '5');
  const maxItems = parseInt(process.env.MAX_ITEMS || '20', 10);

  // 精简的默认显示字段
  const defaultContent: Record<string, string> = {
    '代码': 'fund_id',
    '名称': 'fund_nm',
    '折溢价': 'discount_rt',
    '申购': 'apply_status',
  };

  // 可以通过环境变量自定义显示字段
  let content = defaultContent;
  if (process.env.LOF_CONTENT) {
    try {
      content = JSON.parse(process.env.LOF_CONTENT);
    } catch {
      console.warn('Invalid LOF_CONTENT format, using default');
    }
  }

  return {
    wechatWebhookKey,
    disLimit,
    preLimit,
    maxItems,
    content,
  };
}
