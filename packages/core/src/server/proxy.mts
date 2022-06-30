import {createProxyMiddleware} from 'http-proxy-middleware';

export function createProxy(target: string) {
  return createProxyMiddleware({
    target,
    ws: true,
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/^\/api\/[^\/]+\//, '/api/'),
  });
}
