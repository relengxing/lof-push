import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';

export interface ConfigApiResult {
  disLimit: number;
  preLimit: number;
  maxItems: number;
}

/**
 * GET /api/config - 获取默认配置
 */
export async function GET(): Promise<NextResponse<ConfigApiResult>> {
  const config = getConfig();
  
  return NextResponse.json({
    disLimit: config.disLimit,
    preLimit: config.preLimit,
    maxItems: config.maxItems,
  });
}
