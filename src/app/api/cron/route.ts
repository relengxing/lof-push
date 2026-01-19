import { NextRequest, NextResponse } from 'next/server';
import { LOFService } from '@/lib/lof-service';
import { WechatBot, formatChineseDateTime } from '@/lib/wechat-bot';
import { getConfig } from '@/lib/config';

/**
 * Vercel Cron Job 定时任务入口
 * 每天北京时间 10:00 执行（UTC 02:00）
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 验证 Cron 请求（Vercel 会自动添加这个 header）
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // 如果没有设置 CRON_SECRET，允许请求通过（方便测试）
      if (process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const config = getConfig();

    if (!config.wechatWebhookKey) {
      return NextResponse.json(
        { error: 'Missing WECHAT_WEBHOOK_KEY' },
        { status: 500 }
      );
    }

    const lofService = new LOFService({
      disLimit: config.disLimit,
      preLimit: config.preLimit,
      maxItems: config.maxItems,
      content: config.content,
    });

    const data = await lofService.fetchLOFData();

    if (data.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matching data',
        count: 0,
      });
    }

    const wechatMarkdown = lofService.toWechatMarkdown(data);
    const dateTime = formatChineseDateTime();
    const title = `**LOF-监控: ${dateTime}**\n`;

    const wechatBot = new WechatBot({ webhookKey: config.wechatWebhookKey });
    const wechatResponse = await wechatBot.sendMarkdown(title + wechatMarkdown);

    return NextResponse.json({
      success: wechatResponse.errcode === 0,
      count: data.length,
      wechatResponse,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
