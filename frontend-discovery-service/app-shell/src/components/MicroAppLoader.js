import React from 'react';
import { useDynamicScript, loadComponent } from '../hooks/useDynamicScript';

/**
 * 微前端加载器 - 内部组件，统一处理加载逻辑
 */
export function MicroAppLoader({ url, scope, module  , exportName}) {
  const { ready, failed, loading, retryCount } = useDynamicScript(url);

  if (failed) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#dc3545',
        border: '1px solid #dc3545',
        borderRadius: '4px',
        backgroundColor: '#f8d7da'
      }}>
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>
          ⚠️ 微前端加载失败 (已重试{retryCount}次)
        </div>
        <div style={{ fontSize: '12px', color: '#6c757d' }}>
          URL: {url}<br/>
          Scope: {scope}<br/>
          Module: {module}
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#007bff'
      }}>
        ⏳ 初始化中...
      </div>
    );
  }

  try {
    const MFE = React.lazy(loadComponent(scope, module, exportName));
    return (
      <React.Suspense fallback={
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#007bff'
        }}>
          📦 组件加载中...
        </div>
      }>
        <MFE />
      </React.Suspense>
    );
  } catch (error) {
    console.error('Error loading micro frontend:', error);
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#dc3545',
        border: '1px solid #dc3545',
        borderRadius: '4px',
        backgroundColor: '#f8d7da'
      }}>
        ⚠️ 组件加载错误: {error.message}
      </div>
    );
  }
}