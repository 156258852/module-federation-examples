/**
 * JS隔离问题演示工具
 * 用于模拟和展示微前端架构中缺乏JS隔离导致的各种问题
 */

class JSIsolationDemo {
  constructor() {
    this.conflicts = [];
    this.originalValues = {};
    this.init();
  }

  init() {
    console.log('🔍 JS隔离问题演示工具已启动');
    this.captureInitialState();
    this.setupConflictDetection();
  }

  /**
   * 捕获初始全局状态
   */
  captureInitialState() {
    this.originalValues = {
      globalConfig: window.globalConfig ? JSON.parse(JSON.stringify(window.globalConfig)) : null,
      showNotification: window.showNotification,
      lodash: window.lodash ? { ...window.lodash } : null,
      bodyStyles: {
        backgroundColor: document.body.style.backgroundColor,
        fontFamily: document.body.style.fontFamily
      }
    };
  }

  /**
   * 设置冲突检测
   */
  setupConflictDetection() {
    // 监控全局变量变化
    const checkInterval = setInterval(() => {
      this.detectConflicts();
    }, 1000);

    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval);
    });
  }

  /**
   * 检测各种冲突
   */
  detectConflicts() {
    this.conflicts = [];

    // 1. 全局变量污染检测
    this.detectGlobalVariableConflicts();

    // 2. CSS样式冲突检测
    this.detectStyleConflicts();

    // 3. 事件监听器冲突检测  
    this.detectEventListenerConflicts();

    // 4. 第三方库版本冲突检测
    this.detectLibraryVersionConflicts();

    // 输出检测结果
    if (this.conflicts.length > 0) {
      console.warn('🚨 检测到JS隔离冲突:', this.conflicts);
    }
  }

  /**
   * 检测全局变量冲突
   */
  detectGlobalVariableConflicts() {
    // 检查 globalConfig 变化
    if (window.globalConfig) {
      const current = JSON.stringify(window.globalConfig);
      const original = JSON.stringify(this.originalValues.globalConfig);

      if (original && current !== original) {
        this.conflicts.push({
          type: 'Global Variable Override',
          target: 'window.globalConfig',
          original: this.originalValues.globalConfig,
          current: window.globalConfig,
          severity: 'HIGH',
          description: '全局配置对象被覆盖，可能影响其他微应用的正常工作'
        });
      }
    }

    // 检查全局函数覆盖
    if (window.showNotification && this.originalValues.showNotification) {
      if (window.showNotification !== this.originalValues.showNotification) {
        this.conflicts.push({
          type: 'Global Function Override',
          target: 'window.showNotification',
          severity: 'HIGH',
          description: '全局通知函数被覆盖，可能导致通知行为不一致'
        });
      }
    }
  }

  /**
   * 检测CSS样式冲突
   */
  detectStyleConflicts() {
    const currentBodyBg = document.body.style.backgroundColor;
    const currentBodyFont = document.body.style.fontFamily;

    if (currentBodyBg && currentBodyBg !== this.originalValues.bodyStyles.backgroundColor) {
      this.conflicts.push({
        type: 'CSS Style Override',
        target: 'body.backgroundColor',
        original: this.originalValues.bodyStyles.backgroundColor,
        current: currentBodyBg,
        severity: 'MEDIUM',
        description: 'body背景色被修改，影响整个页面外观'
      });
    }

    if (currentBodyFont && currentBodyFont !== this.originalValues.bodyStyles.fontFamily) {
      this.conflicts.push({
        type: 'CSS Style Override',
        target: 'body.fontFamily',
        original: this.originalValues.bodyStyles.fontFamily,
        current: currentBodyFont,
        severity: 'MEDIUM',
        description: 'body字体被修改，影响整个页面typography'
      });
    }
  }

  /**
   * 检测事件监听器冲突
   */
  detectEventListenerConflicts() {
    // 注意：在实际环境中，很难直接检测事件监听器的数量
    // 这里提供一个模拟实现
    const keydownListeners = this.getEventListenerCount('keydown');
    if (keydownListeners > 1) {
      this.conflicts.push({
        type: 'Event Listener Conflict',
        target: 'document.keydown',
        count: keydownListeners,
        severity: 'MEDIUM',
        description: `检测到${keydownListeners}个keydown事件监听器，可能产生冲突`
      });
    }
  }

  /**
   * 检测第三方库版本冲突
   */
  detectLibraryVersionConflicts() {
    if (window.lodash) {
      const currentVersion = window.lodash.version;
      const originalVersion = this.originalValues.lodash?.version;

      if (originalVersion && currentVersion !== originalVersion) {
        // 判断版本是否降级
        const isDowngrade = this.compareVersions(currentVersion, originalVersion) < 0;

        this.conflicts.push({
          type: 'Library Version Conflict',
          target: 'window.lodash',
          original: originalVersion,
          current: currentVersion,
          severity: isDowngrade ? 'CRITICAL' : 'HIGH',
          description: `Lodash版本从${originalVersion}变为${currentVersion}${isDowngrade ? '（版本降级！）' : ''}`
        });
      }
    }
  }

  /**
   * 获取事件监听器数量（模拟实现）
   */
  getEventListenerCount(eventType) {
    // 在实际环境中，这个功能需要特殊的浏览器API或开发工具
    // 这里返回一个模拟值
    return Math.random() > 0.5 ? 2 : 1;
  }

  /**
   * 比较版本号
   */
  compareVersions(version1, version2) {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }
    return 0;
  }

  /**
   * 生成详细的冲突报告
   */
  generateConflictReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalConflicts: this.conflicts.length,
      conflictsBySeverity: this.groupBySeverity(),
      conflicts: this.conflicts,
      recommendations: this.getRecommendations()
    };

    console.group('📊 JS隔离冲突报告');
    console.table(this.conflicts);
    console.log('推荐解决方案:', report.recommendations);
    console.groupEnd();

    return report;
  }

  /**
   * 按严重程度分组
   */
  groupBySeverity() {
    return this.conflicts.reduce((acc, conflict) => {
      acc[conflict.severity] = (acc[conflict.severity] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * 获取解决建议
   */
  getRecommendations() {
    const recommendations = [];

    if (this.conflicts.some(c => c.type.includes('Global'))) {
      recommendations.push('实现全局变量命名空间隔离');
      recommendations.push('使用模块化的状态管理方案');
    }

    if (this.conflicts.some(c => c.type.includes('CSS'))) {
      recommendations.push('实现CSS样式隔离（CSS Modules、Shadow DOM等）');
      recommendations.push('避免直接修改body等全局样式');
    }

    if (this.conflicts.some(c => c.type.includes('Event'))) {
      recommendations.push('实现事件监听器的应用级作用域管理');
      recommendations.push('在应用卸载时清理事件监听器');
    }

    if (this.conflicts.some(c => c.type.includes('Library'))) {
      recommendations.push('统一管理第三方库版本');
      recommendations.push('考虑使用模块联邦的共享依赖机制');
    }

    return recommendations;
  }

  /**
   * 模拟JS隔离问题
   */
  simulateIsolationProblems() {
    console.group('🧪 模拟JS隔离问题');

    // 模拟全局变量污染
    console.log('1. 模拟全局变量污染...');
    window.conflictTest = 'App1 设置的值';
    setTimeout(() => {
      window.conflictTest = 'App2 覆盖的值';
      console.log('全局变量被覆盖:', window.conflictTest);
    }, 1000);

    // 模拟CSS样式冲突
    console.log('2. 模拟CSS样式冲突...');
    document.body.style.backgroundColor = '#ffeeee';
    setTimeout(() => {
      document.body.style.backgroundColor = '#eeeeff';
      console.log('body背景色被修改');
    }, 2000);

    // 模拟事件监听器冲突
    console.log('3. 模拟事件监听器冲突...');
    const listener1 = () => console.log('App1 keydown handler');
    const listener2 = () => console.log('App2 keydown handler');
    document.addEventListener('keydown', listener1);
    setTimeout(() => {
      document.addEventListener('keydown', listener2);
      console.log('添加了多个keydown监听器');
    }, 3000);

    console.groupEnd();
  }
}

// 创建全局实例
window.jsIsolationDemo = new JSIsolationDemo();

// 导出供其他模块使用
export default JSIsolationDemo;