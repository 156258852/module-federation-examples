import React from 'react';
import { getAppConfig } from '../utils/discovery';
import { MicroAppLoader } from './MicroAppLoader';

/**
 * 简化的MicroApp组件 - 只需要name和module属性
 */
export function MicroApp({ name, module , exportName }) {
  const [appConfig, setAppConfig] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // 获取应用配置
  React.useEffect(() => {
    const loadAppConfig = async () => {
      try {
        setLoading(true);
        const config = await getAppConfig(name, module, exportName);
        
        if (config) {
          setAppConfig({
            ...config,
            exportName
          });
          setError(null);
        } else {
          setError(new Error(`Micro frontend not found: ${name}`));
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadAppConfig();
  }, [name, module, exportName] );

  // 全局加载状态
  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#666',
        fontSize: '14px'
      }}>
        🔄 初始化中...
      </div>
    );
  }

  // 全局错误状态
  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#dc3545',
        border: '1px solid #dc3545',
        borderRadius: '4px',
        backgroundColor: '#f8d7da'
      }}>
        ⚠️ 初始化失败: {error.message}
      </div>
    );
  }

  return appConfig ? <MicroAppLoader {...appConfig} /> : null;
}