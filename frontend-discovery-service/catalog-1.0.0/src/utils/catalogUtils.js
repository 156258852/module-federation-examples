// Catalog 应用的工具函数
export const searchProducts = (products, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return products;
  }
  
  const term = searchTerm.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(term) ||
    product.category.toLowerCase().includes(term) ||
    (product.description && product.description.toLowerCase().includes(term))
  );
};

export const sortProducts = (products, sortBy = 'name', order = 'asc') => {
  const sortedProducts = [...products];
  
  return sortedProducts.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // 处理字符串比较
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

export const filterByCategory = (products, category) => {
  if (!category || category === '全部') {
    return products;
  }
  
  return products.filter(product => product.category === category);
};

export const filterByPriceRange = (products, minPrice = 0, maxPrice = Infinity) => {
  return products.filter(product => 
    product.price >= minPrice && product.price <= maxPrice
  );
};

export const getCategories = (products) => {
  const categories = new Set();
  products.forEach(product => {
    if (product.category) {
      categories.add(product.category);
    }
  });
  return ['全部', ...Array.from(categories)];
};

export const getPaginatedProducts = (products, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    products: products.slice(startIndex, endIndex),
    totalPages: Math.ceil(products.length / pageSize),
    currentPage: page,
    totalProducts: products.length,
    hasNext: endIndex < products.length,
    hasPrev: page > 1
  };
};

// 目录数据处理函数
export const buildCategoryTree = (products) => {
  const tree = {};
  
  products.forEach(product => {
    const category = product.category || '未分类';
    if (!tree[category]) {
      tree[category] = {
        name: category,
        count: 0,
        products: []
      };
    }
    tree[category].count++;
    tree[category].products.push(product);
  });
  
  return tree;
};