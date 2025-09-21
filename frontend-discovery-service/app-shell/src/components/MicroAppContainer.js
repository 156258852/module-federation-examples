import React from 'react';

/**
 * 微前端容器组件 - 可选的，用于统一管理多个微前端
 */
export function MicroAppContainer({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}