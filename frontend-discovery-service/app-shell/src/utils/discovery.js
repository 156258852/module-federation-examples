// 服务发现相关工具函数

// 默认的发现端点和微前端配置
const DEFAULT_ENDPOINT = process.env.DISCOVERY_ENDPOINT;
const DEFAULT_MOCK_DATA = {
  schema: "https://raw.githubusercontent.com/awslabs/frontend-discovery/main/schema/v1-pre.json",
  microFrontends: {
    "my-project/catalog": [
      {
        url: "http://localhost:3003/remoteEntry.js",
        metadata: {
          version: "1.0.0",
          integrity: "e0d123e5f316bef78bfdf5a008837577"
        }
      }
    ],
    "my-project/product": [
      {
        url: "http://localhost:3002/remoteEntry.js",
        metadata: {
          version: "1.0.0",
          integrity: "e0d123e5f316bef78bfdf5a008837578"
        }
      }
    ]
  }
};

// 全局微前端数据缓存
const MFE_CACHE_KEY = 'micro-frontend-data';
let globalMFEData = null;
let isInitialized = false;

/**
 * 从sessionStorage获取缓存数据
 */
const getCachedMFEData = () => {
  try {
    const cached = sessionStorage.getItem(MFE_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to read MFE data from sessionStorage:', error);
    return null;
  }
};

/**
 * 将数据保存到sessionStorage
 */
const setCachedMFEData = (data) => {
  try {
    sessionStorage.setItem(MFE_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save MFE data to sessionStorage:', error);
  }
};

/**
 * 服务发现功能
 */
const discover = async (endpoint = DEFAULT_ENDPOINT, mockData = DEFAULT_MOCK_DATA) => {
  if (!endpoint) {
    console.log('No discovery endpoint provided, using mock data for local development');
    return mockData;
  }

  try {
    const res = await fetch(endpoint, { credentials: 'include' });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error('Failed to fetch from discovery endpoint, falling back to mock data:', error);
    return mockData;
  }
};

/**
 * 初始化微前端数据
 */
export const initMFEData = async () => {
  if (!isInitialized) {
    // 首先尝试从sessionStorage获取缓存数据
    const cachedData = getCachedMFEData();
    if (cachedData) {
      console.log('Using cached MFE data from sessionStorage');
      globalMFEData = cachedData;
      isInitialized = true;
      return globalMFEData;
    }

    // 如果没有缓存，则从服务发现获取
    console.log('Fetching MFE data from discovery service');
    globalMFEData = await discover();

    // 保存到sessionStorage
    setCachedMFEData(globalMFEData);
    isInitialized = true;
  }
  return globalMFEData;
};

/**
 * 清除缓存并重新初始化
 */
export const clearMFECache = () => {
  try {
    sessionStorage.removeItem(MFE_CACHE_KEY);
    globalMFEData = null;
    isInitialized = false;
    console.log('MFE cache cleared');
  } catch (error) {
    console.warn('Failed to clear MFE cache:', error);
  }
};

/**
 * 手动刷新微前端数据
 */
export const refreshMFEData = async () => {
  clearMFECache();
  return await initMFEData();
};

/**
 * 根据应用名称获取配置
 */
export const getAppConfig = async (name, module) => {
  const mfeData = await initMFEData();

  if (mfeData && mfeData.microFrontends[name]) {
    const mfe = mfeData.microFrontends[name][0];
    return {
      url: mfe.url,
      scope: `${(name + '/' + mfe.metadata.version).replace(/[\.\-\/]/gi, '_')}`,
      module: module || name,
    };
  }

  return null;
};