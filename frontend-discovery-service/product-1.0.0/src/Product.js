import React, { useEffect, useState } from 'react';

const Product = () => {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    // 🚨 问题1: 覆盖其他应用的全局配置
    window.globalConfig = {
      theme: 'product-light', // 与 Catalog 冲突
      apiUrl: 'https://product-api.example.com', // 与 Catalog 冲突
      version: '2.0.0', // 与 Catalog 冲突
      productSettings: {
        showPrices: true,
        currency: 'USD'
      }
    };

    // 🚨 问题2: 覆盖全局函数，可能破坏其他应用的功能
    window.showNotification = (message) => {
      // 与 Catalog 的实现不同，会覆盖原有的
      console.log(`[Product Override] ${message}`);
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: red; color: white; padding: 10px;
        border-radius: 4px; z-index: 9999;
      `;
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    };

    // 🚨 问题3: 相同的事件监听器，会与其他应用冲突
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        console.log('Product: Escape key pressed - CONFLICTING with Catalog!');
        // 这会与 Catalog 的 Escape 处理冲突
      }
      if (e.key === 'Enter') {
        console.log('Product: Enter key pressed');
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 🚨 问题4: CSS 样式冲突和覆盖
    const style = document.createElement('style');
    style.textContent = `
      body { 
        background-color: #ffe4e1 !important; /* 与 Catalog 的样式冲突 */
        font-family: 'Times New Roman', serif !important;
      }
      .product-item { 
        color: red !important; /* 覆盖 Catalog 的蓝色 */
        font-weight: bold !important;
      }
      h2 { color: darkred !important; }
    `;
    document.head.appendChild(style);

    // 🚨 问题5: 第三方库版本覆盖
    if (window.lodash) {
      console.warn('Product: Overriding existing lodash version', window.lodash.version);
    }
    window.lodash = {
      version: '3.10.1', // 更旧的版本，可能破坏其他应用
      isArray: () => 'Product version'
    };
    console.log('Product: Loaded lodash 3.10.1 (older version!)');

    // 🚨 问题6: 操作其他应用的 DOM 元素
    setTimeout(() => {
      const catalogElements = document.querySelectorAll('[style*="border: 2px solid blue"]');
      catalogElements.forEach(el => {
        el.style.border = '3px solid red';
        el.style.backgroundColor = '#ffeeee';
      });
    }, 1000);

    // 模拟库存数据
    setInventory([
      { id: 1, name: 'Product商品X', stock: 50 },
      { id: 2, name: 'Product商品Y', stock: 30 }
    ]);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTestOverride = () => {
    // 测试覆盖情况
    console.log('当前全局配置:', window.globalConfig);
    if (window.showNotification) {
      window.showNotification('Product已覆盖通知系统!');
    }
    console.log('Lodash版本:', window.lodash?.version);
  };

  return (
    <div style={{ padding: '20px', border: '2px solid red', marginTop: '20px' }}>
      <h2>Hi, I'm the Product V1 (无JS隔离)</h2>
      <p>⚠️ 此应用会覆盖其他应用的设置:</p>
      <ul>
        <li>✗ 覆盖 globalConfig (从 Catalog 的 1.0.0 到 Product 的 2.0.0)</li>
        <li>✗ 覆盖 showNotification 函数行为</li>
        <li>✗ 相同的事件监听器造成冲突</li>
        <li>✗ CSS 样式覆盖 (背景色、字体等)</li>
        <li>✗ Lodash 版本降级 (4.17.21 → 3.10.1)</li>
        <li>✗ 直接修改其他应用的 DOM</li>
      </ul>

      <div style={{ margin: '20px 0' }}>
        <h3>库存信息:</h3>
        {inventory.map(item => (
          <div key={item.id} className="product-item" style={{ padding: '10px', margin: '5px', border: '1px solid #ccc' }}>
            {item.name} - 库存: {item.stock}
          </div>
        ))}
      </div>

      <button onClick={handleTestOverride} style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
        测试覆盖效果
      </button>

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <p>点击按钮后，观察 Catalog 应用的通知行为变化</p>
        <p>注意页面样式和 Catalog 应用边框颜色的变化</p>
      </div>
    </div>
  );
};

export default Product;
