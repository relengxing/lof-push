export interface WechatBotConfig {
  webhookKey: string;
}

export interface WechatMarkdownMessage {
  msgtype: 'markdown';
  markdown: {
    content: string;
  };
}

export interface WechatTextMessage {
  msgtype: 'text';
  text: {
    content: string;
    mentioned_list?: string[];
    mentioned_mobile_list?: string[];
  };
}

export type WechatMessage = WechatMarkdownMessage | WechatTextMessage;

export interface WechatBotResponse {
  errcode: number;
  errmsg: string;
}

export class WechatBot {
  private webhookUrl: string;

  constructor(config: WechatBotConfig) {
    this.webhookUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${config.webhookKey}`;
  }

  async sendMarkdown(content: string): Promise<WechatBotResponse> {
    const message: WechatMarkdownMessage = {
      msgtype: 'markdown',
      markdown: {
        content,
      },
    };

    return this.send(message);
  }

  async sendText(
    content: string,
    mentionedList?: string[],
    mentionedMobileList?: string[]
  ): Promise<WechatBotResponse> {
    const message: WechatTextMessage = {
      msgtype: 'text',
      text: {
        content,
        mentioned_list: mentionedList,
        mentioned_mobile_list: mentionedMobileList,
      },
    };

    return this.send(message);
  }

  private async send(message: WechatMessage): Promise<WechatBotResponse> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }

    return response.json();
  }
}

/**
 * 格式化日期为中国时区的字符串
 */
export function formatChineseDateTime(): string {
  const now = new Date();
  // 转换为中国时区 (UTC+8)
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const month = String(chinaTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(chinaTime.getUTCDate()).padStart(2, '0');
  const hours = String(chinaTime.getUTCHours()).padStart(2, '0');
  const minutes = String(chinaTime.getUTCMinutes()).padStart(2, '0');

  return `${month}-${day} ${hours}:${minutes}`;
}
