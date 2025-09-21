import React from 'react';
import { HashRouter, Route, Switch, Link, useLocation } from 'react-router-dom';
import { MicroApp } from './components/MicroApp';
import { MicroAppContainer } from './components/MicroAppContainer';

import { Button } from 'my_project_product_1_0_0/share-com'


// 导入主样式文件
import './styles/main.scss';

// 导出工具函数供外部使用
export { clearMFECache, refreshMFEData } from './utils/discovery';
export { MicroApp, MicroAppContainer };

// 页面组件
const HomePage = () => (
  <div className="home-page__container">
    <div className="home-page__header">
      <h1>欢迎使用微前端应用</h1>
      <p className="subtitle">这是一个基于 Module Federation 的微前端应用示例</p>
      <p className="description">请选择要访问的应用，体验微前端架构的强大功能</p>
    </div>
    <div className="home-page__grid">
      <Link to="/catalog" className="home-page__card">
        <div className="home-page__card-icon">📦</div>
        <h3 className="home-page__card-title">Catalog 应用</h3>
        <p className="home-page__card-description">产品目录管理系统，提供商品分类和展示功能</p>
        <div className="home-page__card-status">
          <span className="status-dot"></span>
          <span>运行中</span>
        </div>
      </Link>
      <Link to="/product" className="home-page__card">
        <div className="home-page__card-icon">🛍️</div>
        <h3 className="home-page__card-title">Product 应用</h3>
        <p className="home-page__card-description">产品详情管理系统，提供商品信息维护功能</p>
        <div className="home-page__card-status">
          <span className="status-dot"></span>
          <span>运行中</span>
        </div>
      </Link>
    </div>
  </div>
);

const CatalogPage = () => (
  <div className="app-page__container">
    <div className="app-page__header">
      <div className="app-page__header-content">
        <h2 className="app-page__header-title">
          <div className="app-page__header-title-icon">📦</div>
          Catalog 应用
        </h2>
        <p className="app-page__header-description">
          产品目录管理系统，提供商品分类和展示功能
        </p>
        <div className="app-page__header-meta">
          <div className="app-page__header-meta-item">
            <span className="status-indicator__dot status-indicator__dot--success"></span>
            <span>运行中</span>
          </div>
        </div>
      </div>
    </div>
    <div className="app-page__main">
      <div className="app-page__micro-app">
        <MicroApp name="my-project/catalog" module="my-project/catalog" />
      </div>
    </div>
  </div>
);

const ProductPage = () => (
  <div className="app-page__container">
    <div className="app-page__header">
      <div className="app-page__header-content">
        <h2 className="app-page__header-title">
          <div className="app-page__header-title-icon">🛍️</div>
          Product 应用
        </h2>
        <p className="app-page__header-description">
          产品详情管理系统，提供商品信息维护功能
        </p>
        <div className="app-page__header-meta">
          <div className="app-page__header-meta-item">
            <span className="status-indicator__dot status-indicator__dot--success"></span>
            <span>运行中</span>
          </div>
        </div>
      </div>
    </div>
    <div className="app-page__main">
      <div className="app-page__micro-app">
        <MicroApp name="my-project/product" module="my-project/product" />
      </div>
    </div>
  </div>
);

// 导航组件
const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="app-shell__navigation">
      <div className="app-shell__navigation-container">
        <Link to="/" className="app-shell__navigation-brand">
          微前端应用示例
        </Link>
        <ul className="app-shell__navigation-menu">
          <li>
            <Link
              to="/"
              className={`app-shell__navigation-link ${location.pathname === '/' ? 'app-shell__navigation-link--active' : ''
                }`}
            >
              首页
            </Link>
          </li>
          <li>
            <Link
              to="/catalog"
              className={`app-shell__navigation-link ${location.pathname === '/catalog' ? 'app-shell__navigation-link--active' : ''
                }`}
            >
              Catalog
            </Link>
          </li>
          <li>
            <Link
              to="/product"
              className={`app-shell__navigation-link ${location.pathname === '/product' ? 'app-shell__navigation-link--active' : ''
                }`}
            >
              Product
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

// 主应用组件
function App() {
  return (
    <HashRouter>
      <MicroAppContainer>
        <Button />
        <div className="app-shell__container">
          <Navigation />
          <div className="app-shell__content">
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route path="/catalog" component={CatalogPage} />
              <Route path="/product" component={ProductPage} />
              <Route render={() => (
                <div className="app-page__error">
                  <div className="app-page__error-icon">⚠️</div>
                  <h2 className="app-page__error-title">页面未找到</h2>
                  <p className="app-page__error-message">您访问的页面不存在，请检查路径是否正确。</p>
                  <div className="app-page__error-actions">
                    <Link to="/" className="app-page__error-button app-page__error-button--primary">
                      返回首页
                    </Link>
                  </div>
                </div>
              )} />
            </Switch>
          </div>
        </div>
      </MicroAppContainer>
    </HashRouter>
  );
}

export default App;
