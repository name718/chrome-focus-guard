// FocusGuard Popup Logic
class FocusGuardPopup {
  constructor() {
    this.currentTab = null;
    this.timerStatus = { isRunning: false, timeLeft: 0 };
    this.cleanerStatus = { isActive: false };
    
    this.init();
  }

  async init() {
    try {
      // 获取当前标签页
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tabs[0];
      
      // 初始化事件监听
      this.initEventListeners();
      
      // 加载初始状态
      await this.loadInitialState();
      
      // 开始状态更新循环
      this.startStatusUpdate();
      
    } catch (error) {
      console.error('Popup init error:', error);
    }
  }

  // 初始化事件监听
  initEventListeners() {
    // 番茄钟控制
    document.getElementById('start-pomodoro').addEventListener('click', () => {
      this.startPomodoro();
    });
    
    document.getElementById('stop-pomodoro').addEventListener('click', () => {
      this.stopPomodoro();
    });
    
    // 页面净化控制
    document.getElementById('toggle-cleaner').addEventListener('click', () => {
      this.toggleCleaner();
    });
    
    document.getElementById('add-to-blacklist').addEventListener('click', () => {
      this.addCurrentSiteToBlacklist();
    });
    
    // 快捷操作
    document.getElementById('open-options').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
    
    document.getElementById('view-stats').addEventListener('click', () => {
      this.viewStats();
    });
  }

  // 加载初始状态
  async loadInitialState() {
    console.log('Loading initial state for tab:', this.currentTab?.url);
    
    // 检查当前页面是否支持扩展功能
    const isSupported = await this.isContentScriptReady();
    console.log('Content script ready:', isSupported);
    
    if (!isSupported) {
      this.showPageNotSupportedWarning();
    } else {
      // 移除警告（如果存在）
      const warning = document.getElementById('page-not-supported-warning');
      if (warning) {
        warning.remove();
      }
    }
    
    await this.updateTimerStatus();
    await this.updateCleanerStatus();
    await this.updateStats();
    await this.checkCurrentSiteStatus();
  }

  // 显示页面不支持警告
  showPageNotSupportedWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'page-not-supported-warning';
    warningDiv.innerHTML = `
      <div style="
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 8px;
        padding: 12px;
        margin: 10px 0;
        color: #92400e;
        font-size: 14px;
        text-align: center;
      ">
        <strong>⚠️ 当前页面不支持扩展功能</strong><br>
        <small>请访问普通网页后重试</small>
      </div>
    `;
    
    // 插入到popup的顶部
    const popupBody = document.querySelector('body');
    popupBody.insertBefore(warningDiv, popupBody.firstChild);
  }

  // 开始状态更新循环
  startStatusUpdate() {
    setInterval(async () => {
      await this.updateTimerStatus();
      await this.updateCleanerStatus();
    }, 1000);
  }

  // 更新计时器状态
  async updateTimerStatus() {
    try {
      if (!this.currentTab) return;
      
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'GET_TIMER_STATUS'
      });
      
      if (response) {
        this.timerStatus = response;
        this.updateTimerDisplay();
      }
    } catch (error) {
      // 忽略错误，可能是页面还没有加载content script
      console.debug('Timer status update failed:', error.message);
    }
  }

  // 更新计时器显示
  updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    const timerStatus = document.getElementById('timer-status');
    const startBtn = document.getElementById('start-pomodoro');
    const stopBtn = document.getElementById('stop-pomodoro');
    
    if (this.timerStatus.isRunning) {
      const minutes = Math.floor(this.timerStatus.timeLeft / 60);
      const seconds = this.timerStatus.timeLeft % 60;
      timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (this.timerStatus.isBreak) {
        timerStatus.textContent = '休息时间';
        timerDisplay.style.color = '#8b5cf6';
      } else {
        timerStatus.textContent = '专注中...';
        timerDisplay.style.color = '#10b981';
      }
      
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      timerDisplay.textContent = '00:00';
      timerStatus.textContent = '准备就绪';
      timerDisplay.style.color = 'white';
      
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  }

  // 更新净化器状态
  async updateCleanerStatus() {
    try {
      if (!this.currentTab) return;
      
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'GET_CLEANER_STATUS'
      });
      
      if (response) {
        this.cleanerStatus = response;
        this.updateCleanerDisplay();
      }
    } catch (error) {
      // 忽略错误
      console.debug('Cleaner status update failed:', error.message);
    }
  }

  // 更新净化器显示
  updateCleanerDisplay() {
    const cleanerStatus = document.getElementById('cleaner-status');
    const toggleBtn = document.getElementById('toggle-cleaner');
    
    if (this.cleanerStatus.isActive) {
      cleanerStatus.textContent = '净化模式已开启';
      toggleBtn.textContent = '关闭净化';
    } else {
      cleanerStatus.textContent = '净化模式已关闭';
      toggleBtn.textContent = '开启净化';
    }
  }

  // 检查content script是否可用
  async isContentScriptReady() {
    try {
      if (!this.currentTab) return false;
      
      // 检查是否是受支持的页面类型
      if (this.currentTab.url.startsWith('chrome://') || 
          this.currentTab.url.startsWith('chrome-extension://') ||
          this.currentTab.url.startsWith('edge://') ||
          this.currentTab.url.startsWith('about:')) {
        console.log('Unsupported page type:', this.currentTab.url);
        return false;
      }
      
      // 尝试发送ping消息
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'FOCUS_GUARD_PING'
      });
      
      console.log('Ping response:', response);
      return response && (response.ok || response.source);
    } catch (error) {
      console.log('Ping failed:', error.message);
      return false;
    }
  }

  // 开始番茄钟
  async startPomodoro() {
    try {
      if (!this.currentTab) {
        this.showError('无法获取当前标签页');
        return;
      }
      
      // 检查页面类型
      if (this.currentTab.url.startsWith('chrome://') || 
          this.currentTab.url.startsWith('chrome-extension://') ||
          this.currentTab.url.startsWith('edge://') ||
          this.currentTab.url.startsWith('about:')) {
        this.showError('当前页面不支持此功能，请访问普通网页后重试');
        return;
      }
      
      await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'START_POMODORO'
      });
      
      console.log('Pomodoro started');
      this.showSuccess('番茄钟已开始');
    } catch (error) {
      console.error('Failed to start pomodoro:', error);
      this.showError('启动番茄钟失败，请刷新页面后重试');
    }
  }

  // 停止番茄钟
  async stopPomodoro() {
    try {
      if (!this.currentTab) {
        this.showError('无法获取当前标签页');
        return;
      }
      
      // 检查页面类型
      if (this.currentTab.url.startsWith('chrome://') || 
          this.currentTab.url.startsWith('chrome-extension://') ||
          this.currentTab.url.startsWith('edge://') ||
          this.currentTab.url.startsWith('about:')) {
        this.showError('当前页面不支持此功能，请访问普通网页后重试');
        return;
      }
      
      await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'STOP_POMODORO'
      });
      
      console.log('Pomodoro stopped');
      this.showSuccess('番茄钟已停止');
    } catch (error) {
      console.error('Failed to stop pomodoro:', error);
      this.showError('停止番茄钟失败，请刷新页面后重试');
    }
  }

  // 切换净化模式
  async toggleCleaner() {
    try {
      if (!this.currentTab) {
        this.showError('无法获取当前标签页');
        return;
      }
      
      // 检查页面类型
      if (this.currentTab.url.startsWith('chrome://') || 
          this.currentTab.url.startsWith('chrome-extension://') ||
          this.currentTab.url.startsWith('edge://') ||
          this.currentTab.url.startsWith('about:')) {
        this.showError('当前页面不支持此功能，请访问普通网页后重试');
        return;
      }
      
      await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'TOGGLE_CLEANER'
      });
      
      console.log('Cleaner toggled');
    } catch (error) {
      console.error('Failed to toggle cleaner:', error);
      this.showError('切换净化模式失败，请刷新页面后重试');
    }
  }

  // 添加当前网站到黑名单
  async addCurrentSiteToBlacklist() {
    try {
      if (!this.currentTab?.url) {
        this.showError('无法获取当前网站');
        return;
      }
      
      const url = new URL(this.currentTab.url);
      const hostname = url.hostname;
      
      // 发送消息给background script添加黑名单
      const response = await chrome.runtime.sendMessage({
        type: 'ADD_TO_BLACKLIST',
        url: hostname
      });
      
      if (response && response.success) {
        this.showSuccess(response.message || '已添加到黑名单');
        console.log('Added to blacklist:', hostname);
        
        // 检查当前网站是否在黑名单中
        await this.checkCurrentSiteStatus();
      } else {
        this.showError(response?.message || '添加失败');
      }
    } catch (error) {
      console.error('Failed to add to blacklist:', error);
      this.showError('添加黑名单失败');
    }
  }

  // 检查当前网站状态
  async checkCurrentSiteStatus() {
    try {
      if (!this.currentTab?.url) return;
      
      const url = new URL(this.currentTab.url);
      const hostname = url.hostname;
      
      // 获取黑名单和设置
      const blacklistResponse = await chrome.runtime.sendMessage({
        type: 'GET_BLACKLIST'
      });
      
      if (blacklistResponse && blacklistResponse.success) {
        const isBlacklisted = blacklistResponse.blacklist.includes(hostname);
        
        // 更新UI显示
        const statusElement = document.getElementById('current-site-status');
        if (statusElement) {
          if (isBlacklisted) {
            statusElement.textContent = '🚫 当前网站在黑名单中';
            statusElement.style.color = '#ef4444';
          } else {
            statusElement.textContent = '✅ 当前网站不在黑名单中';
            statusElement.style.color = '#10b981';
          }
        }
      }
    } catch (error) {
      console.error('Failed to check site status:', error);
    }
  }

  // 更新统计数据
  async updateStats() {
    try {
      const today = new Date().toDateString();
      const key = `pomodoro_${today}`;
      
      const result = await chrome.storage.sync.get(key);
      const todayStats = result[key] || { count: 0, totalTime: 0 };
      
      // 更新显示
      const totalPomodorosElement = document.getElementById('total-pomodoros');
      const focusTimeElement = document.getElementById('focus-time');
      
      if (totalPomodorosElement) {
        totalPomodorosElement.textContent = todayStats.count;
      }
      
      if (focusTimeElement) {
        focusTimeElement.textContent = todayStats.totalTime;
      }
      
      console.log('Stats updated:', todayStats);
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  // 显示错误提示
  showError(message) {
    this.showNotification(message, 'error');
  }

  // 显示成功提示
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  // 显示通知
  showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `focus-guard-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      z-index: 999999;
      max-width: 300px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease;
    `;

    // 根据类型设置颜色
    if (type === 'error') {
      notification.style.background = '#ef4444';
    } else if (type === 'success') {
      notification.style.background = '#10b981';
    } else {
      notification.style.background = '#3b82f6';
    }

    // 添加到页面
    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 3000);

    // 添加动画样式
    if (!document.getElementById('focus-guard-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'focus-guard-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 查看统计
  viewStats() {
    // 这里可以打开一个统计页面
    console.log('View stats clicked');
  }
}

// 初始化popup
const popup = new FocusGuardPopup();

