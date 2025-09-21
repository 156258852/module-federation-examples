// Product 应用的工具函数
export const calculatePrice = (basePrice, discount = 0) => {
  return basePrice * (1 - discount / 100);
};

export const formatCurrency = (amount, currency = 'CNY') => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim() === '') {
    errors.push('产品名称不能为空');
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('产品价格必须大于0');
  }
  
  if (!product.category) {
    errors.push('产品分类不能为空');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateProductId = () => {
  return 'PROD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// 异步函数示例 - 模拟API调用
export const fetchProductDetails = async (productId) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: productId,
    name: `产品 ${productId}`,
    price: Math.floor(Math.random() * 1000) + 100,
    category: '电子产品',
    description: `这是产品 ${productId} 的详细描述`,
    inStock: Math.random() > 0.3
  };
};

// 产品分析函数
export const analyzeProducts = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return {
      total: 0,
      averagePrice: 0,
      categories: {},
      inStockCount: 0
    };
  }

  const total = products.length;
  const totalPrice = products.reduce((sum, product) => sum + (product.price || 0), 0);
  const averagePrice = totalPrice / total;
  
  const categories = products.reduce((acc, product) => {
    const category = product.category || '未分类';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  const inStockCount = products.filter(product => product.inStock).length;

  return {
    total,
    averagePrice: Math.round(averagePrice * 100) / 100,
    categories,
    inStockCount,
    outOfStockCount: total - inStockCount
  };
};