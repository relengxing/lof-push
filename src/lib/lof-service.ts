export interface LOFRow {
  fund_id: string;
  fund_nm: string;
  price: string;
  increase_rt: string;
  volume: string;
  amount: string;
  fund_nav: string;
  nav_dt: string;
  estimate_value: string;
  discount_rt: string;
  apply_fee: string;
  redeem_fee: string;
  fund_company: string;
  apply_status: string;  // 申购状态
  redeem_status: string; // 赎回状态
  [key: string]: string;
}

export interface LOFApiResponse {
  rows: Array<{
    id: string;
    cell: LOFRow;
  }>;
}

export interface FilteredLOF {
  [key: string]: string;
}

export interface LOFConfig {
  disLimit: number; // 折溢价率下限
  preLimit: number; // 折溢价率上限
  maxItems: number; // 最大显示条数
  content: Record<string, string>; // 显示字段映射
}

// 精简的默认显示字段
const DEFAULT_CONTENT: Record<string, string> = {
  '代码': 'fund_id',
  '名称': 'fund_nm',
  '折溢价': 'discount_rt',
  '申购': 'apply_status',
};

export class LOFService {
  private config: LOFConfig;
  private urlBase = 'https://www.jisilu.cn/data/lof/detail/';
  private urlLOF = 'https://www.jisilu.cn/data/lof/index_lof_list/?___jsl=LST___t=';

  constructor(config?: Partial<LOFConfig>) {
    this.config = {
      disLimit: config?.disLimit ?? -100,  // 下限默认 -100
      preLimit: config?.preLimit ?? 100,   // 上限默认 100
      maxItems: config?.maxItems ?? 20,
      content: config?.content ?? DEFAULT_CONTENT,
    };

    // 确保下限 <= 上限
    if (this.config.disLimit > this.config.preLimit) {
      const temp = this.config.disLimit;
      this.config.disLimit = this.config.preLimit;
      this.config.preLimit = temp;
    }
  }

  async fetchLOFData(): Promise<FilteredLOF[]> {
    const timestamp = Date.now();
    const url = `${this.urlLOF}${timestamp}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LOF data: ${response.status}`);
    }

    const data: LOFApiResponse = await response.json();
    return this.filterAndFormat(data);
  }

  private filterAndFormat(data: LOFApiResponse): FilteredLOF[] {
    // 提取所有行数据
    let rows = data.rows.map((row) => row.cell);

    // 移除 discount_rt == "-" 的行
    rows = rows.filter((row) => row.discount_rt !== '-');

    // 按折溢价率排序（从高到低）
    rows.sort((a, b) => parseFloat(b.discount_rt) - parseFloat(a.discount_rt));

    const result: FilteredLOF[] = [];

    // 筛选：折溢价率 >= 下限 且 <= 上限
    const selectedRows = rows
      .filter((row) => {
        const val = parseFloat(row.discount_rt);
        return val >= this.config.disLimit && val <= this.config.preLimit;
      })
      .slice(0, this.config.maxItems);

    for (const row of selectedRows) {
      const item: FilteredLOF = {};

      for (const [displayKey, dataKey] of Object.entries(this.config.content)) {
        if (dataKey === 'fund_id') {
          // 不使用链接格式，直接显示代码（节省字符）
          item[displayKey] = row[dataKey];
        } else {
          item[displayKey] = row[dataKey] || '';
        }
      }

      result.push(item);
    }

    return result;
  }

  /**
   * 生成网页表格格式的 Markdown（用于前端显示）
   */
  toMarkdown(info: FilteredLOF[]): string {
    if (!info || info.length === 0) return '';

    const headers = Object.keys(info[0]);
    const lines: string[] = [];

    // 表头
    lines.push('| ' + headers.join(' | ') + ' |');
    // 分隔线
    lines.push('| ' + headers.map(() => ':---:').join(' | ') + ' |');
    // 数据行
    for (const item of info) {
      lines.push('| ' + Object.values(item).join(' | ') + ' |');
    }

    return lines.join('\n');
  }

  /**
   * 生成企业微信机器人支持的 Markdown 格式
   * 企业微信不支持表格，使用引用块格式
   */
  toWechatMarkdown(info: FilteredLOF[]): string {
    if (!info || info.length === 0) return '';

    const lines: string[] = [];

    for (let i = 0; i < info.length; i++) {
      const item = info[i];
      const discountValue = parseFloat(item['折溢价'] || '0');
      
      // 根据折溢价率设置颜色：折价用绿色(info)，溢价用橙色(warning)
      const colorTag = discountValue > 0 ? 'info' : discountValue < 0 ? 'warning' : 'comment';
      const discountText = `<font color="${colorTag}">${item['折溢价']}%</font>`;
      
      // 申购状态：开放用绿色，其他用灰色
      const applyStatus = item['申购'] || '-';
      const applyColor = applyStatus === '开放' ? 'info' : 'comment';
      const applyText = `<font color="${applyColor}">${applyStatus}</font>`;

      lines.push(`>${item['代码']} **${item['名称']}** ${discountText} ${applyText}`);
    }

    return lines.join('\n');
  }
}
