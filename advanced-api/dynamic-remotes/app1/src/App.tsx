import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { init, loadRemote } from '@module-federation/runtime';
import { createDefaultPlugins } from '../../runtime-plugins';
import type { RemoteComponentProps, DynamicImportHook } from '../../types/module-federation';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Remote component error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2em', 
          border: '2px solid #ff6b6b', 
          borderRadius: '4px', 
          backgroundColor: '#ffe0e0',
          color: '#c92a2a'
        }}>
          <h3>⚠️ Component Failed to Load</h3>
          <p>Unable to load the remote component. Please try again or check the remote application.</p>
          <details>
            <summary>Error Details</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ 
              marginTop: '1em', 
              padding: '0.5em 1em', 
              backgroundColor: '#c92a2a', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const getRemoteEntry = (port: number): string => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_REMOTE_BASE_URL || window.location.origin)
    : 'http://localhost';
  return `${baseUrl}:${port}/remoteEntry.js`;
};

// Initialize runtime with plugins for enhanced error handling and performance
init({
  name: 'app1',
  remotes: [
    {
      name: 'app2',
      entry: getRemoteEntry(3002),
    },
    {
      name: 'app3',
      entry: getRemoteEntry(3003),
    },
  ],
  plugins: createDefaultPlugins({
    retry: {
      onRetry: (attempt: any, error: any, args: any) => {
        console.log(`Retrying ${args.id} (attempt ${attempt}):`, error.message);
      },
      onFailure: (error: any, args: any) => {
        console.error(`Failed to load ${args.id} after all retries:`, error);
      }
    },
    performance: {
      onSlowLoad: (loadTime: any, args: any) => {
        console.warn(`Slow load detected for ${args.id}: ${loadTime}ms`);
      }
    },
    errorBoundary: {
      onError: (errorInfo: any) => {
        // In a real app, you might send this to an error reporting service
        console.error('Module Federation Error Report:', errorInfo);
      }
    }
  })
});

// useDynamicImport hook - 提供错误处理和重试机制
function useDynamicImport({ module, scope }: RemoteComponentProps): DynamicImportHook {
  const [component, setComponent] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const loadComponent = async (isRetry: boolean = false): Promise<void> => {
    if (isRetry) {
      setRetryCount(prev => prev + 1);
    } else {
      setRetryCount(0);
    }
    
    setLoading(true);
    setError(null);
    if (!isRetry) setComponent(null);

    try {
      console.log(`Loading remote module: ${scope}/${module}${isRetry ? ` (retry ${retryCount + 1})` : ''}`);
      const remoteModule = await loadRemote<any>(`${scope}/${module}`);
      console.log('🔍 Remote module loaded:', remoteModule);
      console.log('🔍 Remote module keys:', Object.keys(remoteModule || {}));
      console.log('🔍 Remote module type:', typeof remoteModule);
      
      // 处理不同的导出格式
      let Component: React.ComponentType;
      if (remoteModule?.default) {
        console.log('🔍 Using default export:', typeof remoteModule.default);
        Component = remoteModule.default;
      } else if (typeof remoteModule === 'function') {
        console.log('🔍 Using direct function export');
        Component = remoteModule;
      } else {
        console.error('Invalid component format:', remoteModule);
        throw new Error(`Invalid component format from ${scope}/${module}: got ${typeof remoteModule}`);
      }
      
      if (!Component || typeof Component !== 'function') {
        console.error('Component is not a function:', Component, typeof Component);
        throw new Error(`Failed to load valid component ${scope}/${module}: expected function, got ${typeof Component}`);
      }
      
      // 验证组件是否可渲染
      try {
        const testElement = React.createElement(Component);
        const componentName = typeof testElement?.type === 'function' ? testElement.type.name : 'Anonymous';
        console.log('📝 Component validation successful:', componentName);
      } catch (validationError) {
        console.error('Component validation failed:', validationError);
        throw new Error(`Component validation failed for ${scope}/${module}: ${validationError}`);
      }
      
      setComponent(() => Component);
      console.log(`Successfully loaded: ${scope}/${module}`);
    } catch (error) {
      console.error(`Error loading remote module ${scope}/${module}:`, error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!module || !scope) {
      setComponent(null);
      setError(null);
      setRetryCount(0);
      return;
    }

    loadComponent();
  }, [module, scope]);

  return { component, loading, error, retryCount, retry: () => loadComponent(true) };
}

// 通用的远程组件页面
function RemoteWidgetPage({ scope, displayName }: { scope: string; displayName: string }) {
  const { component: Component, loading, error, retryCount, retry } = useDynamicImport({ 
    module: 'Widget', 
    scope 
  });

  const renderRemoteComponent = (): React.ReactNode => {
    if (loading) {
      return (
        <div style={{ 
          padding: '2em', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          border: '2px dashed #dee2e6' 
        }}>
          <div>🔄 Loading {scope}/Widget...</div>
          {retryCount > 0 && (
            <div style={{ fontSize: '0.9em', color: '#666', marginTop: '0.5em' }}>
              Retry attempt {retryCount}
            </div>
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ 
          padding: '2em', 
          border: '2px solid #ffc107', 
          borderRadius: '4px', 
          backgroundColor: '#fff3cd',
          color: '#856404'
        }}>
          <h3>⚠️ Failed to Load Remote Component</h3>
          <p>Could not load {scope}/Widget</p>
          {retryCount > 0 && (
            <p style={{ fontStyle: 'italic', marginBottom: '1em' }}>
              Retry attempts: {retryCount}
            </p>
          )}
          <div style={{ marginBottom: '1em' }}>
            <button 
              onClick={retry}
              disabled={loading}
              style={{ 
                padding: '0.5em 1em',
                backgroundColor: loading ? '#ccc' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginRight: '1em'
              }}
            >
              {loading ? 'Retrying...' : 'Retry Load'}
            </button>
          </div>
          <details>
            <summary>Error Details</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto', marginTop: '1em' }}>
              {error.toString()}
            </pre>
          </details>
        </div>
      );
    }

    if (Component) {
      console.log('🚀 Rendering component:', Component.name || 'Anonymous', typeof Component);
      return (
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>
      );
    }

    return (
      <div style={{
        padding: '2em',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '2px dashed #dee2e6'
      }}>
        <h3>等待加载 {displayName} 组件</h3>
        <p>正在准备加载远程组件...</p>
      </div>
    );
  };

  return (
    <div style={{ marginTop: '2em' }}>
      <Suspense fallback={
        <div style={{ 
          padding: '2em', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          border: '2px dashed #dee2e6' 
        }}>
          <div>🔄 Initializing {displayName} component...</div>
        </div>
      }>
        {renderRemoteComponent()}
      </Suspense>
    </div>
  );
}

// App2 Widget 组件页面
function App2WidgetPage() {
  return <RemoteWidgetPage scope="app2" displayName="App2" />;
}

// App3 Widget 组件页面
function App3WidgetPage() {
  return <RemoteWidgetPage scope="app3" displayName="App3" />;
}

// 主页组件
function HomePage() {
  return (
    <div style={{ marginTop: '2em' }}>
      <div style={{
        padding: '2em',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '2px dashed #dee2e6'
      }}>
        <h3>欢迎使用动态路由系统</h3>
        <p>点击上方的导航链接来懒加载不同的远程组件</p>
        <p>这个系统使用 Module Federation 和 React Router 实现懒加载</p>
      </div>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <Router>
      <div
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        }}
      >
        <h1>Dynamic System Host</h1>
        <h2>App 1 - 路由懒加载版本</h2>
        <p>
          这个动态系统使用 Module Federation <strong>remotes</strong> 和{' '}
          <strong>exposes</strong>，结合 React Router 实现路由级的懒加载。
          它不会加载已经加载过的组件。
        </p>
        
        {/* 导航菜单 */}
        <nav style={{ marginBottom: '1em' }}>
          <Link 
            to="/" 
            style={{ 
              marginRight: '1em', 
              padding: '0.5em 1em',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            首页
          </Link>
          <Link 
            to="/widget/app2" 
            style={{ 
              marginRight: '1em', 
              padding: '0.5em 1em',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            加载 App 2 Widget
          </Link>
          <Link 
            to="/widget/app3" 
            style={{ 
              padding: '0.5em 1em',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            加载 App 3 Widget
          </Link>
        </nav>

        {/* 路由配置 */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/widget/app2" element={<App2WidgetPage />} />
          <Route path="/widget/app3" element={<App3WidgetPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
