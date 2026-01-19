import { NextRequest, NextResponse } from 'next/server';
import { LOFService, FilteredLOF } from '@/lib/lof-service';
import { WechatBot, formatChineseDateTime } from '@/lib/wechat-bot';
import { getConfig } from '@/lib/config';

export interface LOFApiResult {
  success: boolean;
  data?: FilteredLOF[];
  markdown?: string;
  wechatResponse?: {
    errcode: number;
    errmsg: string;
  };
  error?: string;
}

/**
 * GET /api/lof - 获取 LOF 数据
 */
export async function GET(request: NextRequest): Promise<NextResponse<LOFApiResult>> {
  try {
    const config = getConfig();
    const searchParams = request.nextUrl.searchParams;
    
    // 允许通过查询参数覆盖配置
    const disLimit = parseFloat(searchParams.get('disLimit') ?? String(config.disLimit));
    const preLimit = parseFloat(searchParams.get('preLimit') ?? String(config.preLimit));

    const maxItems = parseInt(searchParams.get('maxItems') ?? String(config.maxItems), 10);

    const lofService = new LOFService({
      disLimit,
      preLimit,
      maxItems,
      content: config.content,
    });

    const data = await lofService.fetchLOFData();
    const markdown = lofService.toMarkdown(data);

    return NextResponse.json({
      success: true,
      data,
      markdown,
    });
  } catch (error) {
    console.error('Error fetching LOF data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lof - 获取 LOF 数据并推送到企业微信
 */
export async function POST(request: NextRequest): Promise<NextResponse<LOFApiResult>> {
  try {
    const config = getConfig();
    
    if (!config.wechatWebhookKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing WECHAT_WEBHOOK_KEY environment variable',
        },
        { status: 400 }
      );
    }

    // 从请求体获取参数（可选）
    let disLimit = config.disLimit;
    let preLimit = config.preLimit;
    let maxItems = config.maxItems;
    
    try {
      const body = await request.json();
      if (body.disLimit !== undefined) disLimit = parseFloat(body.disLimit);
      if (body.preLimit !== undefined) preLimit = parseFloat(body.preLimit);
      if (body.maxItems !== undefined) maxItems = parseInt(body.maxItems, 10);
    } catch {
      // 请求体为空或非 JSON，使用默认配置
    }

    const lofService = new LOFService({
      disLimit,
      preLimit,
      maxItems,
      content: config.content,
    });

    const data = await lofService.fetchLOFData();

    if (data.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        markdown: '',
        wechatResponse: { errcode: 0, errmsg: 'No data to send' },
      });
    }

    // 前端表格用的 Markdown
    const markdown = lofService.toMarkdown(data);
    // 企业微信用的 Markdown（不支持表格）
    const wechatMarkdown = lofService.toWechatMarkdown(data);
    
    const dateTime = formatChineseDateTime();
    const title = `**LOF-监控: ${dateTime}**\n`;

    const wechatBot = new WechatBot({ webhookKey: config.wechatWebhookKey });
    const wechatResponse = await wechatBot.sendMarkdown(title + wechatMarkdown);

    return NextResponse.json({
      success: wechatResponse.errcode === 0,
      data,
      markdown,
      wechatResponse,
    });
  } catch (error) {
    console.error('Error in LOF monitor:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
