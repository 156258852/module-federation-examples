/**
 * 创建动态远程模块加载器
 * @param {string} scope - 远程模块的作用域名称
 * @param {string} remoteUrl - 远程入口文件的URL，默认根据scope推断
 * @returns {string} 用于 ModuleFederationPlugin remotes 配置的 Promise 字符串
 */
const remoteLoader = (scope, remoteUrl) => {
  // 如果没有提供URL，根据scope推断默认URL
  if (!remoteUrl) {
    const portMap = {
      'my_project_product_1_0_0': '3002',
      'my_project_catalog_1_0_0': '3003',
      'my_project_catalog_2_0_0': '3004'
    };
    const port = portMap[scope] || '3002';
    remoteUrl = `http://localhost:${port}/remoteEntry.js`;
  }

  return `promise new Promise((resolve, reject) => {
      const scope = '${scope}'
      const remoteUrlWithVersion = '${remoteUrl}'
      
      // 检查是否已经加载过该远程模块
      const existingScript = document.querySelector('script[data-scope="' + scope + '"]');
      // 如果已经加载过该远程模块，并且判断data-scop 是否为scop， 判断init和 get方法，如果有， 则直接返回代理对象 ，否则继续加载
      if (existingScript && window[scope] && existingScript.dataset.scop === scop && typeof window[scope].get === 'function' && typeof window[scope].init === 'function') {
        console.log('Remote container already loaded:', scope);
        const proxy = {
          get: (request) => window[scope].get(request),
          init: (...arg) => {
            try {
              return window[scope].init(...arg)
            } catch(e) {
              console.log('remote container already initialized:', scope)
              return true;
            }
          }
        }
        resolve(proxy);
        return;
      }
      
      const script = document.createElement('script')
      script.src = remoteUrlWithVersion
      script.type = 'text/javascript'
      script.async = true
      
      // 设置加载超时
      const timeout = setTimeout(() => {
        console.error('Remote module load timeout:', scope, remoteUrlWithVersion);
        document.head.removeChild(script);
        reject(new Error('Remote module load timeout: ' + scope));
      }, 30000); // 30秒超时
      
      script.onload = () => {
        clearTimeout(timeout);
        
        // 验证容器对象是否可用
        if (!window[scope]) {
          const error = new Error('Remote container not available after script load: ' + scope);
          console.error(error.message);
          reject(error);
          return;
        }
        
        // 验证容器对象的必要方法
        if (typeof window[scope].get !== 'function' || typeof window[scope].init !== 'function') {
          const error = new Error('Remote container missing required methods: ' + scope);
          console.error(error.message);
          reject(error);
          return;
        }
        
        console.log('Remote container loaded successfully:', scope);
        
        const proxy = {
          get: (request) => {
            try {
              return window[scope].get(request);
            } catch(e) {
              console.error('Error getting remote module:', scope, request, e);
              throw e;
            }
          },
          init: (...args) => {
            try {
              return window[scope].init(...args)
            } catch(e) {
              console.log('remote container already initialized:', scope)
              return true;
            }
          }
        }
        
        script.dataset.scope = scope;
        resolve(proxy)
      }
      
      script.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Failed to load remote script:', scope, remoteUrlWithVersion, error);
        
        // 清理失败的script标签
        if (script.parentNode) {
          document.head.removeChild(script);
        }
        
        reject(new Error('Failed to load remote script: ' + scope + ' from ' + remoteUrlWithVersion));
      }
      
      // inject this script with the src set to the versioned remoteEntry.js
      document.head.appendChild(script);
    })`;
};





  

export {
  remoteLoader,
};