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
    await this.updateTimerStatus();
    await this.updateCleanerStatus();
    await this.updateStats();
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

  // 开始番茄钟
  async startPomodoro() {
    try {
      if (!this.currentTab) return;
      
      await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'START_POMODORO'
      });
      
      console.log('Pomodoro started');
    } catch (error) {
      console.error('Failed to start pomodoro:', error);
    }
  }

  // 停止番茄钟
  async stopPomodoro() {
    try {
      if (!this.currentTab) return;
      
      await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'STOP_POMODORO'
      });
      
      console.log('Pomodoro stopped');
    } catch (error) {
      console.error('Failed to stop pomodoro:', error);
    }
  }

  // 切换净化模式
  async toggleCleaner() {
    try {
      if (!this.currentTab) return;
      
      await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'TOGGLE_CLEANER'
      });
      
      console.log('Cleaner toggled');
    } catch (error) {
      console.error('Failed to toggle cleaner:', error);
    }
  }

  // 添加当前网站到黑名单
  async addCurrentSiteToBlacklist() {
    try {
      if (!this.currentTab?.url) return;
      
      const url = new URL(this.currentTab.url);
      const hostname = url.hostname;
      
      // 发送消息给background script添加黑名单
      await chrome.runtime.sendMessage({
        type: 'ADD_TO_BLACKLIST',
        url: hostname
      });
      
      console.log('Added to blacklist:', hostname);
    } catch (error) {
      console.error('Failed to add to blacklist:', error);
    }
  }

  // 更新统计数据
  async updateStats() {
    try {
      const result = await chrome.storage.sync.get('stats');
      const stats = result.stats || {};
      
      document.getElementById('total-pomodoros').textContent = stats.totalPomodoros || 0;
      document.getElementById('focus-time').textContent = stats.totalFocusTime || 0;
    } catch (error) {
      console.error('Failed to update stats:', error);
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

