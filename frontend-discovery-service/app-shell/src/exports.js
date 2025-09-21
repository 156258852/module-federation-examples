// 微前端组件统一导出文件

export { MicroApp } from './components/MicroApp';
export { MicroAppContainer } from './components/MicroAppContainer';
export { MicroAppLoader } from './components/MicroAppLoader';

export { 
  initMFEData, 
  clearMFECache, 
  refreshMFEData, 
  getAppConfig 
} from './utils/discovery';

export { 
  useDynamicScript, 
  loadComponent 
} from './hooks/useDynamicScript';

// 默认导出主App组件
export { default } from './App';