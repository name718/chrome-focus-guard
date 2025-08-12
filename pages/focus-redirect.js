// Focus Redirect Page Logic
class FocusRedirectPage {
  constructor() {
    this.countdown = 300; // 5分钟倒计时
    this.timer = null;
    this.originalUrl = null;
    this.settings = null;
    
    this.init();
  }

  async init() {
    try {
      // 获取原始URL
      const urlParams = new URLSearchParams(window.location.search);
      this.originalUrl = urlParams.get('redirect') || 'https://www.google.com';
      
      // 获取设置
      this.settings = await this.getSettings();
      
      // 初始化页面
      this.initPage();
      this.startCountdown();
      this.loadStats();
      
    } catch (error) {
      console.error('FocusRedirectPage init error:', error);
    }
  }

  // 获取设置
  async getSettings() {
    try {
      // 从storage获取设置
      const result = await chrome.storage.sync.get(null);
      return result;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {};
    }
  }

  // 初始化页面
  initPage() {
    // 设置激励文字
    const motivationText = document.getElementById('motivation-text');
    if (motivationText && this.settings.motivation?.customMessage) {
      motivationText.textContent = this.settings.motivation.customMessage;
    }

    // 设置待办事项
    this.loadTodoList();
  }

  // 加载待办事项
  loadTodoList() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;

    // 这里可以从Todoist等第三方服务获取待办事项
    // 目前使用默认的待办事项
    const defaultTodos = [
      '完成今日最重要的任务',
      '回复重要邮件',
      '整理工作笔记',
      '准备明天的会议材料',
      '回顾本周的工作成果'
    ];

    todoList.innerHTML = '';
    defaultTodos.forEach(todo => {
      const todoItem = document.createElement('div');
      todoItem.className = 'todo-item';
      todoItem.innerHTML = `
        <div class="todo-checkbox" onclick="focusRedirectPage.toggleTodo(this)"></div>
        <div class="todo-text">${todo}</div>
      `;
      todoList.appendChild(todoItem);
    });
  }

  // 切换待办事项状态
  toggleTodo(checkbox) {
    const todoText = checkbox.nextElementSibling;
    checkbox.classList.toggle('checked');
    todoText.classList.toggle('completed');
  }

  // 开始倒计时
  startCountdown() {
    this.timer = setInterval(() => {
      this.countdown--;
      this.updateTimer();
      
      if (this.countdown <= 0) {
        this.enableUnlock();
        clearInterval(this.timer);
      }
    }, 1000);
  }

  // 更新计时器显示
  updateTimer() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      const minutes = Math.floor(this.countdown / 60);
      const seconds = this.countdown % 60;
      timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  // 启用解锁按钮
  enableUnlock() {
    const unlockButton = document.getElementById('unlock-button');
    if (unlockButton) {
      unlockButton.disabled = false;
      unlockButton.textContent = '现在可以访问';
    }
  }

  // 解锁网站
  unlockSite() {
    if (this.countdown > 0) {
      alert('请等待倒计时结束');
      return;
    }

    // 记录解锁事件
    this.recordUnlock();
    
    // 跳转到原始URL
    window.location.href = this.originalUrl;
  }

  // 记录解锁事件
  async recordUnlock() {
    try {
      // 发送消息给background script记录解锁事件
      chrome.runtime.sendMessage({
        type: 'SITE_UNLOCKED',
        originalUrl: this.originalUrl,
        unlockTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to record unlock:', error);
    }
  }

  // 加载统计数据
  async loadStats() {
    try {
      const stats = await this.getStats();
      
      // 更新统计显示
      const totalPomodoros = document.getElementById('total-pomodoros');
      const focusTime = document.getElementById('focus-time');
      const streakDays = document.getElementById('streak-days');
      
      if (totalPomodoros) {
        totalPomodoros.textContent = stats.totalPomodoros || 0;
      }
      
      if (focusTime) {
        focusTime.textContent = stats.totalFocusTime || 0;
      }
      
      if (streakDays) {
        streakDays.textContent = stats.streakDays || 0;
      }
      
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  // 获取统计数据
  async getStats() {
    try {
      const result = await chrome.storage.sync.get('stats');
      return result.stats || {};
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {};
    }
  }

  // 销毁页面
  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// 全局函数供HTML调用
function toggleTodo(checkbox) {
  if (window.focusRedirectPage) {
    window.focusRedirectPage.toggleTodo(checkbox);
  }
}

function unlockSite() {
  if (window.focusRedirectPage) {
    window.focusRedirectPage.unlockSite();
  }
}

// 初始化页面
const focusRedirectPage = new FocusRedirectPage();
window.focusRedirectPage = focusRedirectPage;

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  focusRedirectPage.destroy();
});
