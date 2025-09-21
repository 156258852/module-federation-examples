import React, { useEffect, useState } from 'react';

const Catalog = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // 🚨 问题1: 全局变量污染
    window.globalConfig = {
      theme: 'catalog-dark',
      apiUrl: 'https://catalog-api.example.com',
      version: '1.0.0'
    };

    // 🚨 问题2: 全局函数污染
    window.showNotification = (message) => {
      alert(`[Catalog] ${message}`);
    };

    // 🚨 问题3: 全局事件监听器冲突
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        console.log('Catalog: Escape key pressed');
        // 可能与其他应用的 Escape 处理冲突
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 🚨 问题4: DOM 操作干扰
    const style = document.createElement('style');
    style.textContent = `
      body { background-color: #f0f8ff !important; }
      .product-item { color: blue !important; }
    `;
    document.head.appendChild(style);

    // 🚨 问题5: 第三方库版本冲突（模拟）
    if (!window.lodash) {
      window.lodash = { version: '4.17.21' };
      console.log('Catalog: Loaded lodash 4.17.21');
    } else {
      console.warn('Catalog: lodash already exists with version:', window.lodash.version);
    }

    // 模拟产品数据
    setProducts([
      { id: 1, name: 'Catalog产品A', price: 99 },
      { id: 2, name: 'Catalog产品B', price: 199 }
    ]);

    // 清理函数（但实际上全局污染很难完全清理）
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // 注意：style、全局变量等很难清理干净
    };
  }, []);

  const handleTestGlobalConflict = () => {
    // 测试全局变量冲突
    if (window.globalConfig) {
      console.log('当前全局配置:', window.globalConfig);
      window.showNotification && window.showNotification('Catalog测试通知');
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid blue' }}>
      <h2>Hi, I'm the Catalog V1 (无JS隔离)</h2>
      <p>⚠️ 此应用存在以下JS隔离问题:</p>
      <ul>
        <li>✗ 全局变量污染 (window.globalConfig)</li>
        <li>✗ 全局函数污染 (window.showNotification)</li>
        <li>✗ 事件监听器冲突 (keydown)</li>
        <li>✗ CSS样式干扰 (body背景色)</li>
        <li>✗ 第三方库版本冲突 (lodash)</li>
      </ul>

      <div style={{ margin: '20px 0' }}>
        <h3>产品列表:</h3>
        {products.map(product => (
          <div key={product.id} className="product-item" style={{ padding: '10px', margin: '5px', border: '1px solid #ccc' }}>
            {product.name} - ¥{product.price}
          </div>
        ))}
      </div>

      <button onClick={handleTestGlobalConflict} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
        测试全局变量冲突
      </button>

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <p>打开浏览器控制台查看冲突详情</p>
        <p>按 ESC 键测试事件冲突</p>
      </div>
    </div>
  );
};

export default Catalog;
