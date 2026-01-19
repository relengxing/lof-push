'use client';

import { useState, useCallback, useEffect } from 'react';

interface LOFData {
  [key: string]: string;
}

interface ApiResult {
  success: boolean;
  data?: LOFData[];
  markdown?: string;
  wechatResponse?: {
    errcode: number;
    errmsg: string;
  };
  error?: string;
}

interface ConfigResult {
  disLimit: number;
  preLimit: number;
  maxItems: number;
}

export default function Home() {
  const [disLimit, setDisLimit] = useState('');
  const [preLimit, setPreLimit] = useState('');
  const [maxItems, setMaxItems] = useState('');
  const [configLoaded, setConfigLoaded] = useState(false);

  // 从 API 获取默认配置
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((config: ConfigResult) => {
        setDisLimit(String(config.disLimit));
        setPreLimit(String(config.preLimit));
        setMaxItems(String(config.maxItems));
        setConfigLoaded(true);
      })
      .catch(() => {
        // 如果获取失败，使用前端默认值
        setDisLimit('-5');
        setPreLimit('5');
        setMaxItems('20');
        setConfigLoaded(true);
      });
  }, []);
  const [data, setData] = useState<LOFData[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({
        disLimit: disLimit,
        preLimit: preLimit,
        maxItems: maxItems,
      });
      const response = await fetch(`/api/lof?${params}`);
      const result: ApiResult = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setMessage({
          type: 'info',
          text: `获取到 ${result.data.length} 条数据`,
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || '获取数据失败',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '网络错误',
      });
    } finally {
      setLoading(false);
    }
  }, [disLimit, preLimit, maxItems]);

  const sendToWechat = useCallback(async () => {
    setSending(true);
    setMessage(null);
    try {
      const response = await fetch('/api/lof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disLimit: parseFloat(disLimit),
          preLimit: parseFloat(preLimit),
          maxItems: parseInt(maxItems, 10),
        }),
      });
      const result: ApiResult = await response.json();

      if (result.success) {
        setData(result.data || []);
        if (result.wechatResponse?.errcode === 0) {
          setMessage({
            type: 'success',
            text: '已成功推送到企业微信',
          });
        } else if (result.data?.length === 0) {
          setMessage({
            type: 'info',
            text: '没有符合条件的数据',
          });
        } else {
          setMessage({
            type: 'error',
            text: `推送失败: ${result.wechatResponse?.errmsg || '未知错误'}`,
          });
        }
      } else {
        setMessage({
          type: 'error',
          text: result.error || '操作失败',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '网络错误',
      });
    } finally {
      setSending(false);
    }
  }, [disLimit, preLimit, maxItems]);

  const getValueClass = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return num > 0 ? 'positive' : num < 0 ? 'negative' : '';
  };

  const stripLinks = (value: string): string => {
    // 从 [text](url) 格式中提取 text
    const match = value.match(/\[([^\]]+)\]\([^)]+\)/);
    return match ? match[1] : value;
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '40px 20px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {/* 标题区域 */}
      <header
        style={{
          textAlign: 'center',
          marginBottom: '48px',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ffc857 0%, #a855f7 50%, #4ecdc4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '12px',
          }}
        >
          LOF 监控系统
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          实时监控 LOF 基金折溢价，一键推送到企业微信
        </p>
      </header>

      {/* 控制面板 */}
      <section
        style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 32px var(--shadow-color)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            alignItems: 'flex-end',
          }}
        >
          <div className="input-group" style={{ flex: '1', minWidth: '150px' }}>
            <label>折溢价下限 (%)</label>
            <input
              type="number"
              step="0.1"
              value={disLimit}
              onChange={(e) => setDisLimit(e.target.value)}
              placeholder="如: -5"
            />
          </div>

          <div className="input-group" style={{ flex: '1', minWidth: '150px' }}>
            <label>折溢价上限 (%)</label>
            <input
              type="number"
              step="0.1"
              value={preLimit}
              onChange={(e) => setPreLimit(e.target.value)}
              placeholder="如: 5"
            />
          </div>

          <div className="input-group" style={{ flex: '1', minWidth: '120px' }}>
            <label>最大条数</label>
            <input
              type="number"
              step="1"
              min="1"
              max="50"
              value={maxItems}
              onChange={(e) => setMaxItems(e.target.value)}
              placeholder="默认 20"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={fetchData} disabled={loading || !configLoaded}>
              {loading && <span className="spinner" />}
              {loading ? '加载中...' : '查询数据'}
            </button>

            <button className="btn btn-primary" onClick={sendToWechat} disabled={sending || !configLoaded}>
              {sending && <span className="spinner" />}
              {sending ? '推送中...' : '推送到企微'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`status status-${message.type}`} style={{ marginTop: '20px' }}>
            {message.type === 'success' && '✓'}
            {message.type === 'error' && '✗'}
            {message.type === 'info' && 'ℹ'}
            {message.text}
          </div>
        )}
      </section>

      {/* 数据表格 */}
      {data.length > 0 && (
        <section className="table-container">
          <table>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.entries(row).map(([key, value], cellIndex) => (
                    <td
                      key={cellIndex}
                      className={
                        key.includes('涨幅') || key.includes('折溢价') ? getValueClass(value) : ''
                      }
                    >
                      {stripLinks(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* 空状态 */}
      {data.length === 0 && !loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
          <p style={{ fontSize: '16px' }}>点击"查询数据"开始监控 LOF 基金</p>
        </div>
      )}

      {/* 页脚 */}
      <footer
        style={{
          textAlign: 'center',
          marginTop: '48px',
          padding: '20px',
          color: 'var(--text-muted)',
          fontSize: '13px',
        }}
      >
        <p>数据来源：集思录 | 仅供参考，不构成投资建议</p>
      </footer>
    </main>
  );
}
