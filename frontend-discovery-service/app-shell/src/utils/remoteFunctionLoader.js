import { getAppConfig } from './discovery';

// 缓存已加载的远程函数模块
const moduleCache = new Map();

/**
 * 动态加载远程应用的函数模块
 * @param {string} appName - 应用名称 (如 'my-project/product')
 * @param {string} modulePath - 模块路径 (如 './utils/productUtils')
 * @param {boolean} useCache - 是否使用缓存，默认为 true
 * @returns {Promise<Object>} 返回模块的所有导出
 */
export const loadRemoteFunctions = async (appName, modulePath, useCache = true) => {
  const cacheKey = `${appName}:${modulePath}`;
  
  // 检查缓存
  if (useCache && moduleCache.has(cacheKey)) {
    console.log(`Using cached remote functions for ${cacheKey}`);
    return moduleCache.get(cacheKey);
  }

  try {
    // 获取应用配置
    const appConfig = await getAppConfig(appName, modulePath);
    
    if (!appConfig) {
      throw new Error(`无法找到应用配置: ${appName}`);
    }

    console.log(`Loading remote functions from ${appName}${modulePath}`);
    
    // 动态加载远程模块
    const container = window[appConfig.scope];
    
    if (!container) {
      throw new Error(`远程容器未找到: ${appConfig.scope}`);
    }

    await container.init(__webpack_share_scopes__.default);
    const factory = await container.get(modulePath);
    const module = factory();
    
    // 缓存模块
    if (useCache) {
      moduleCache.set(cacheKey, module);
    }
    
    console.log(`Successfully loaded remote functions from ${appName}${modulePath}`);
    return module;
    
  } catch (error) {
    console.error(`Failed to load remote functions from ${appName}${modulePath}:`, error);
    throw error;
  }
};

/**
 * 加载特定的远程函数
 * @param {string} appName - 应用名称
 * @param {string} modulePath - 模块路径
 * @param {string} functionName - 函数名称
 * @param {boolean} useCache - 是否使用缓存
 * @returns {Promise<Function>} 返回特定函数
 */
export const loadRemoteFunction = async (appName, modulePath, functionName, useCache = true) => {
  const module = await loadRemoteFunctions(appName, modulePath, useCache);
  
  if (!module[functionName]) {
    throw new Error(`函数 ${functionName} 在模块 ${appName}${modulePath} 中未找到`);
  }
  
  return module[functionName];
};

/**
 * Product 应用工具函数的便捷加载器
 */
export const loadProductUtils = () => {
  return loadRemoteFunctions('my-project/product', './utils/productUtils');
};

/**
 * Catalog 应用工具函数的便捷加载器
 */
export const loadCatalogUtils = () => {
  return loadRemoteFunctions('my-project/catalog', './utils/catalogUtils');
};

/**
 * 预加载所有远程函数模块
 * @param {Array} modules - 要预加载的模块配置数组
 */
export const preloadRemoteFunctions = async (modules = []) => {
  const defaultModules = [
    { appName: 'my-project/product', modulePath: './utils/productUtils' },
    { appName: 'my-project/catalog', modulePath: './utils/catalogUtils' }
  ];
  
  const modulesToLoad = modules.length > 0 ? modules : defaultModules;
  
  const promises = modulesToLoad.map(({ appName, modulePath }) => 
    loadRemoteFunctions(appName, modulePath).catch(error => {
      console.warn(`Failed to preload ${appName}${modulePath}:`, error);
      return null;
    })
  );
  
  const results = await Promise.allSettled(promises);
  const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
  
  console.log(`Preloaded ${successCount}/${modulesToLoad.length} remote function modules`);
  
  return results;
};

/**
 * 清除函数模块缓存
 * @param {string} cacheKey - 缓存键，不传则清除所有缓存
 */
export const clearFunctionCache = (cacheKey = null) => {
  if (cacheKey) {
    moduleCache.delete(cacheKey);
    console.log(`Cleared cache for ${cacheKey}`);
  } else {
    moduleCache.clear();
    console.log('Cleared all function cache');
  }
};

/**
 * 获取已缓存的模块信息
 */
export const getCachedModules = () => {
  return Array.from(moduleCache.keys());
};

/**
 * 创建远程函数的本地代理
 * 这个工具可以让你像使用本地函数一样使用远程函数
 */
export const createRemoteFunctionProxy = (appName, modulePath) => {
  let modulePromise = null;
  
  return new Proxy({}, {
    get(target, prop) {
      return async (...args) => {
        if (!modulePromise) {
          modulePromise = loadRemoteFunctions(appName, modulePath);
        }
        
        const module = await modulePromise;
        
        if (!module[prop] || typeof module[prop] !== 'function') {
          throw new Error(`函数 ${prop} 在 ${appName}${modulePath} 中不存在或不是函数`);
        }
        
        return module[prop](...args);
      };
    }
  });
};