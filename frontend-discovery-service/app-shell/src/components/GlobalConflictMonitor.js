import React, { useState, useEffect } from 'react';

const GlobalConflictMonitor = () => {
  const [conflicts, setConflicts] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // 监控全局变量变化
    const monitorGlobalChanges = () => {
      const newConflicts = [];

      // 检查全局配置冲突
      if (window.globalConfig) {
        newConflicts.push({
          type: 'Global Variable',
          name: 'window.globalConfig',
          value: JSON.stringify(window.globalConfig),
          risk: 'High',
          description: '多个应用修改同一全局配置对象'
        });
      }

      // 检查全局函数覆盖
      if (window.showNotification) {
        newConflicts.push({
          type: 'Global Function',
          name: 'window.showNotification',
          value: 'Function exists',
          risk: 'High',
          description: '全局通知函数可能被不同应用覆盖'
        });
      }

      // 检查第三方库版本冲突
      if (window.lodash) {
        newConflicts.push({
          type: 'Third-party Library',
          name: 'window.lodash',
          value: `Version: ${window.lodash.version}`,
          risk: window.lodash.version.startsWith('3') ? 'Critical' : 'Medium',
          description: '第三方库版本可能不兼容'
        });
      }

      // 检查事件监听器（简化版本）
      // 注意：在生产环境中很难精确检测事件监听器数量
      // 这里使用一个示例性的检测
      let eventListenerWarning = false;
      try {
        const eventListeners = getEventListeners(document);
        const keydownListeners = eventListeners?.keydown?.length || 0;
        if (keydownListeners > 1) {
          eventListenerWarning = true;
        }
      } catch (e) {
        // 在生产环境中可能无法检测，忽略错误
      }

      if (eventListenerWarning) {
        newConflicts.push({
          type: 'Event Listeners',
          name: 'keydown listeners',
          value: '多个监听器',
          risk: 'Medium',
          description: '检测到多个应用注册相同事件监听器'
        });
      }

      setConflicts(newConflicts);
    };

    // 初始检查
    monitorGlobalChanges();

    // 定期检查
    const interval = setInterval(monitorGlobalChanges, 2000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Critical': return '#dc3545';
      case 'High': return '#fd7e14';
      case 'Medium': return '#ffc107';
      default: return '#28a745';
    }
  };

  const handleTestGlobalState = () => {
    console.log('=== 当前全局状态检查 ===');
    console.log('window.globalConfig:', window.globalConfig);
    console.log('window.showNotification:', typeof window.showNotification);
    console.log('window.lodash:', window.lodash);

    // 测试通知功能
    if (window.showNotification) {
      window.showNotification('来自 App Shell 的测试通知');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: isExpanded ? '400px' : '200px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 99999,
      fontSize: '12px',
      transition: 'width 0.3s ease'
    }}>
      <div
        style={{
          padding: '10px',
          backgroundColor: '#6c757d',
          color: 'white',
          borderRadius: '8px 8px 0 0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>🔍 JS隔离监控</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div style={{ padding: '15px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>检测到的冲突: {conflicts.length}</strong>
          </div>

          {conflicts.map((conflict, index) => (
            <div key={index} style={{
              marginBottom: '10px',
              padding: '8px',
              backgroundColor: '#fff',
              border: `1px solid ${getRiskColor(conflict.risk)}`,
              borderRadius: '4px'
            }}>
              <div style={{
                fontWeight: 'bold',
                color: getRiskColor(conflict.risk),
                marginBottom: '3px'
              }}>
                {conflict.type} - {conflict.risk}
              </div>
              <div style={{ marginBottom: '2px' }}>
                <strong>{conflict.name}</strong>
              </div>
              <div style={{ color: '#666', marginBottom: '3px' }}>
                {conflict.value}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                {conflict.description}
              </div>
            </div>
          ))}

          {conflicts.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#28a745',
              padding: '20px',
              fontStyle: 'italic'
            }}>
              暂未检测到冲突
            </div>
          )}

          <button
            onClick={handleTestGlobalState}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            测试全局状态
          </button>

          <div style={{
            marginTop: '10px',
            fontSize: '11px',
            color: '#666',
            borderTop: '1px solid #eee',
            paddingTop: '8px'
          }}>
            <div>💡 <strong>操作建议：</strong></div>
            <div>1. 先访问 Catalog 应用</div>
            <div>2. 再访问 Product 应用</div>
            <div>3. 观察冲突变化</div>
            <div>4. 按 ESC 键测试事件冲突</div>
          </div>
        </div>
      )}
    </div>
  );
};

// 辅助函数：获取事件监听器（在开发环境中可用）
function getEventListeners(element) {
  // 检查是否在浏览器开发工具环境中，且有全局 getEventListeners 函数
  if (typeof window !== 'undefined' && window.getEventListeners && typeof window.getEventListeners === 'function') {
    try {
      return window.getEventListeners(element);
    } catch (e) {
      console.warn('无法获取事件监听器信息:', e);
      return {};
    }
  }
  // 如果不在开发环境中，返回空对象
  return {};
}

export default GlobalConflictMonitor;