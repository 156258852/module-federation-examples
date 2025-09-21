import React, { useState, useEffect } from 'react';
import { 
  loadProductUtils, 
  loadCatalogUtils, 
  loadRemoteFunction,
  createRemoteFunctionProxy,
  preloadRemoteFunctions 
} from '../utils/remoteFunctionLoader';

const RemoteFunctionDemo = () => {
  const [productUtils, setProductUtils] = useState(null);
  const [catalogUtils, setCatalogUtils] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  // 创建远程函数代理
  const productProxy = createRemoteFunctionProxy('my-project/product', './utils/productUtils');
  const catalogProxy = createRemoteFunctionProxy('my-project/catalog', './utils/catalogUtils');

  useEffect(() => {
    // 预加载远程函数
    preloadRemoteFunctions();
  }, []);

  const loadUtils = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [prodUtils, catUtils] = await Promise.all([
        loadProductUtils(),
        loadCatalogUtils()
      ]);
      
      setProductUtils(prodUtils);
      setCatalogUtils(catUtils);
      
      addResult('✅ 成功加载所有远程工具函数');
    } catch (err) {
      setError(err.message);
      addResult(`❌ 加载失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addResult = (message) => {
    setResults(prev => [...prev, { id: Date.now(), message, time: new Date().toLocaleTimeString() }]);
  };

  const testProductFunctions = async () => {
    if (!productUtils) {
      addResult('❌ 请先加载 Product 工具函数');
      return;
    }

    try {
      // 测试价格计算
      const originalPrice = 1000;
      const discount = 20;
      const finalPrice = productUtils.calculatePrice(originalPrice, discount);
      addResult(`💰 计算价格: ¥${originalPrice} 打8折 = ¥${finalPrice}`);

      // 测试货币格式化
      const formatted = productUtils.formatCurrency(finalPrice);
      addResult(`💸 格式化货币: ${formatted}`);

      // 测试产品验证
      const product = { name: '测试产品', price: finalPrice, category: '电子产品' };
      const validation = productUtils.validateProduct(product);
      addResult(`✅ 产品验证: ${validation.isValid ? '通过' : '失败 - ' + validation.errors.join(', ')}`);

      // 测试 ID 生成
      const productId = productUtils.generateProductId();
      addResult(`🆔 生成产品ID: ${productId}`);

      // 测试异步函数
      const productDetails = await productUtils.fetchProductDetails(productId);
      addResult(`📦 获取产品详情: ${productDetails.name} - ${productDetails.price}元`);

    } catch (err) {
      addResult(`❌ Product 函数测试失败: ${err.message}`);
    }
  };

  const testCatalogFunctions = async () => {
    if (!catalogUtils) {
      addResult('❌ 请先加载 Catalog 工具函数');
      return;
    }

    try {
      // 测试数据
      const products = [
        { name: '笔记本电脑', price: 8000, category: '电子产品' },
        { name: '鼠标', price: 100, category: '电子产品' },
        { name: '咖啡杯', price: 50, category: '生活用品' },
        { name: '键盘', price: 300, category: '电子产品' }
      ];

      // 测试搜索
      const searchResults = catalogUtils.searchProducts(products, '电脑');
      addResult(`🔍 搜索结果: 找到 ${searchResults.length} 个包含"电脑"的产品`);

      // 测试排序
      const sortedProducts = catalogUtils.sortProducts(products, 'price', 'desc');
      addResult(`📊 按价格降序: ${sortedProducts[0].name}(¥${sortedProducts[0].price}) 最贵`);

      // 测试分类过滤
      const electronicProducts = catalogUtils.filterByCategory(products, '电子产品');
      addResult(`📱 电子产品筛选: 找到 ${electronicProducts.length} 个电子产品`);

      // 测试价格区间过滤
      const affordableProducts = catalogUtils.filterByPriceRange(products, 0, 200);
      addResult(`💵 价格筛选(0-200元): 找到 ${affordableProducts.length} 个产品`);

      // 测试分页
      const pagination = catalogUtils.getPaginatedProducts(products, 1, 2);
      addResult(`📄 分页结果: 第${pagination.currentPage}页，共${pagination.totalPages}页`);

    } catch (err) {
      addResult(`❌ Catalog 函数测试失败: ${err.message}`);
    }
  };

  const testRemoteFunctionProxy = async () => {
    try {
      // 使用代理直接调用远程函数
      const price = await productProxy.calculatePrice(500, 10);
      addResult(`🚀 代理调用: 计算价格结果 ¥${price}`);

      const formatted = await productProxy.formatCurrency(price);
      addResult(`🚀 代理调用: 格式化结果 ${formatted}`);

      // 使用 Catalog 代理
      const products = [
        { name: '测试产品1', price: 100, category: '测试' },
        { name: '测试产品2', price: 200, category: '测试' }
      ];
      const sorted = await catalogProxy.sortProducts(products, 'price', 'asc');
      addResult(`🚀 代理调用: 排序结果 ${sorted.map(p => p.name).join(', ')}`);

    } catch (err) {
      addResult(`❌ 代理调用失败: ${err.message}`);
    }
  };

  const testSpecificFunction = async () => {
    try {
      // 加载特定函数
      const calculatePrice = await loadRemoteFunction(
        'my-project/product', 
        './utils/productUtils', 
        'calculatePrice'
      );
      
      const result = calculatePrice(1000, 25);
      addResult(`🎯 特定函数调用: 1000元打75折 = ¥${result}`);
      
    } catch (err) {
      addResult(`❌ 特定函数调用失败: ${err.message}`);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>🔧 远程函数动态加载演示</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={loadUtils} disabled={loading} style={{ marginRight: '10px' }}>
          {loading ? '加载中...' : '加载远程工具函数'}
        </button>
        
        <button onClick={testProductFunctions} disabled={!productUtils} style={{ marginRight: '10px' }}>
          测试 Product 函数
        </button>
        
        <button onClick={testCatalogFunctions} disabled={!catalogUtils} style={{ marginRight: '10px' }}>
          测试 Catalog 函数
        </button>
        
        <button onClick={testRemoteFunctionProxy} style={{ marginRight: '10px' }}>
          测试函数代理
        </button>
        
        <button onClick={testSpecificFunction} style={{ marginRight: '10px' }}>
          测试特定函数
        </button>
        
        <button onClick={clearResults}>
          清空结果
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#ffebee', marginBottom: '20px' }}>
          错误: {error}
        </div>
      )}

      <div style={{ border: '1px solid #ccc', padding: '15px', background: '#f9f9f9', maxHeight: '400px', overflowY: 'auto' }}>
        <h3>📋 执行结果:</h3>
        {results.length === 0 ? (
          <p style={{ color: '#666' }}>点击上方按钮开始测试...</p>
        ) : (
          results.map(result => (
            <div key={result.id} style={{ marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>[{result.time}]</span> {result.message}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>💡 使用说明:</h4>
        <ul>
          <li><strong>加载远程工具函数:</strong> 动态加载 Product 和 Catalog 应用暴露的工具函数</li>
          <li><strong>测试 Product 函数:</strong> 演示价格计算、格式化、验证等功能</li>
          <li><strong>测试 Catalog 函数:</strong> 演示搜索、排序、筛选、分页等功能</li>
          <li><strong>测试函数代理:</strong> 演示如何像本地函数一样调用远程函数</li>
          <li><strong>测试特定函数:</strong> 演示如何加载单个远程函数</li>
        </ul>
      </div>
    </div>
  );
};

export default RemoteFunctionDemo;