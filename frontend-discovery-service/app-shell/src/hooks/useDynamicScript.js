import React from 'react';

/**
 * 加载远程组件
 */
function loadComponent(scope, module, exportName) {
  return async () => {
    await __webpack_init_sharing__('default');
    const container = window[scope];
    if (!container) {
      throw new Error(`Container ${scope} not found`);
    }
    await container.init(__webpack_share_scopes__.default);
    const factory = await container.get(`./${module}`);
    const Module = factory();
    return Module
  };
}

/**
 * 带重试的动态脚本加载Hook
 */
export const useDynamicScript = (url, maxRetries = 3) => {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  const loadScript = React.useCallback((url, attempt = 1) => {
    return new Promise((resolve, reject) => {
      // 检查脚本是否已经加载
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript && existingScript.dataset?.scope === 'true') {
        resolve()
        return;
      }

      const element = document.createElement('script');
      element.src = url;
      element.type = 'text/javascript';
      element.async = true;

      element.onload = () => {
        console.log(`Dynamic Script Loaded (attempt ${attempt}): ${url}`);
        element.dataset.scope = "true";
        resolve();
      };

      element.onerror = () => {
        console.error(`Dynamic Script Error (attempt ${attempt}): ${url}`);
        document.head.removeChild(element);
        reject(new Error(`Failed to load script: ${url}`));
      };

      document.head.appendChild(element);
    });
  }, []);

  React.useEffect(() => {
    if (!url) {
      setReady(false);
      setFailed(false);
      setLoading(false);
      setRetryCount(0);
      return;
    }

    const attemptLoad = async () => {
      setLoading(true);
      setFailed(false);

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          setRetryCount(attempt);
          await loadScript(url, attempt);
          setReady(true);
          setLoading(false);
          return;
        } catch (error) {
          console.warn(`Script load attempt ${attempt} failed:`, error.message);

          if (attempt === maxRetries) {
            setFailed(true);
            setLoading(false);
            console.error(`All ${maxRetries} attempts failed for: ${url}`);
            return;
          }

          // 等待一段时间再重试
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    };

    attemptLoad();
  }, [url, maxRetries, loadScript]);

  return { ready, failed, loading, retryCount };
};

export { loadComponent };