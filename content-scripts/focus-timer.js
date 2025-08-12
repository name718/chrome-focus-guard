// Focus Timer (Pomodoro) functionality for FocusGuard
class FocusTimer {
  constructor() {
    this.isRunning = false;
    this.isBreak = false;
    this.timeLeft = 0;
    this.totalTime = 0;
    this.timer = null;
    this.timerBar = null;
    this.breakOverlay = null;
    this.settings = null;
    this.pomodoroCount = 0;
    
    this.init();
  }

  async init() {
    try {
      // 获取设置
      const storage = await import('../utils/storage.js');
      this.settings = await storage.default.getSettings();
      
      // 创建计时器UI
      this.createTimerBar();
      
      // 监听来自popup的消息
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'START_POMODORO') {
          this.startPomodoro(message.duration || this.settings.pomodoro.workDuration);
          sendResponse({ success: true });
        } else if (message.type === 'STOP_POMODORO') {
          this.stopPomodoro();
          sendResponse({ success: true });
        } else if (message.type === 'GET_TIMER_STATUS') {
          sendResponse({
            isRunning: this.isRunning,
            isBreak: this.isBreak,
            timeLeft: this.timeLeft,
            totalTime: this.totalTime
          });
        }
      });
    } catch (error) {
      console.error('FocusTimer init error:', error);
    }
  }

  // 创建计时器进度条
  createTimerBar() {
    if (this.timerBar) return;

    this.timerBar = document.createElement('div');
    this.timerBar.id = 'focus-guard-timer';
    this.timerBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%);
      z-index: 999999;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
      pointer-events: none;
    `;

    document.body.appendChild(this.timerBar);
  }

  // 开始番茄钟
  startPomodoro(duration = 25) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isBreak = false;
    this.timeLeft = duration * 60; // 转换为秒
    this.totalTime = this.timeLeft;
    this.pomodoroCount++;

    this.updateTimerBar();
    this.startTimer();

    // 发送开始事件
    chrome.runtime.sendMessage({
      type: 'POMODORO_STARTED',
      duration: duration
    });
  }

  // 开始休息
  startBreak(isLongBreak = false) {
    if (this.isRunning) return;

    const breakDuration = isLongBreak ? 
      this.settings.pomodoro.longBreakDuration : 
      this.settings.pomodoro.breakDuration;

    this.isRunning = true;
    this.isBreak = true;
    this.timeLeft = breakDuration * 60;
    this.totalTime = this.timeLeft;

    this.updateTimerBar();
    this.startTimer();
  }

  // 开始计时器
  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerBar();

      if (this.timeLeft <= 0) {
        this.completeSession();
      }
    }, 1000);
  }

  // 停止番茄钟
  stopPomodoro() {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.isBreak = false;
    this.timeLeft = 0;
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.hideTimerBar();
    this.hideBreakOverlay();

    // 发送停止事件
    chrome.runtime.sendMessage({
      type: 'POMODORO_STOPPED',
      completed: false
    });
  }

  // 完成会话
  async completeSession() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.isRunning = false;

    if (this.isBreak) {
      // 休息结束，开始下一个番茄钟
      this.hideBreakOverlay();
      this.hideTimerBar();
      
      // 自动开始下一个番茄钟
      setTimeout(() => {
        this.startPomodoro();
      }, 1000);
    } else {
      // 番茄钟结束，开始休息
      this.recordPomodoro();
      this.showBreakOverlay();
      
      // 检查是否需要长休息
      const shouldLongBreak = this.pomodoroCount % this.settings.pomodoro.longBreakInterval === 0;
      this.startBreak(shouldLongBreak);
    }
  }

  // 记录番茄钟完成
  async recordPomodoro() {
    try {
      const focusStats = await import('../utils/focus-stats.js');
      await focusStats.default.recordPomodoro(this.settings.pomodoro.workDuration);
      
      // 发送完成事件
      chrome.runtime.sendMessage({
        type: 'POMODORO_COMPLETED',
        duration: this.settings.pomodoro.workDuration
      });
    } catch (error) {
      console.error('Failed to record pomodoro:', error);
    }
  }

  // 更新计时器进度条
  updateTimerBar() {
    if (!this.timerBar) return;

    const progress = 1 - (this.timeLeft / this.totalTime);
    this.timerBar.style.transform = `scaleX(${progress})`;

    // 根据剩余时间改变颜色
    if (this.timeLeft <= 60) { // 最后1分钟
      this.timerBar.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
    } else if (this.timeLeft <= 300) { // 最后5分钟
      this.timerBar.style.background = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
    } else {
      this.timerBar.style.background = this.isBreak ? 
        'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)' :
        'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)';
    }
  }

  // 隐藏计时器进度条
  hideTimerBar() {
    if (this.timerBar) {
      this.timerBar.style.transform = 'scaleX(0)';
    }
  }

  // 显示休息覆盖层
  showBreakOverlay() {
    if (this.breakOverlay) return;

    this.breakOverlay = document.createElement('div');
    this.breakOverlay.id = 'focus-guard-break-overlay';
    this.breakOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999998;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    this.breakOverlay.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2 style="margin: 0 0 20px; font-size: 24px;">🎉 专注时间结束！</h2>
        <p style="margin: 0 0 30px; font-size: 16px; opacity: 0.8;">
          深呼吸，放松一下...
        </p>
        <div style="margin: 20px 0;">
          <div style="width: 60px; height: 60px; border: 3px solid #10b981; border-radius: 50%; margin: 0 auto; animation: breathe 4s infinite;"></div>
        </div>
        <button id="focus-guard-confirm-break" style="
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
        ">确认休息</button>
      </div>
      <style>
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(this.breakOverlay);

    // 添加确认按钮事件
    document.getElementById('focus-guard-confirm-break').addEventListener('click', () => {
      this.hideBreakOverlay();
    });
  }

  // 隐藏休息覆盖层
  hideBreakOverlay() {
    if (this.breakOverlay) {
      this.breakOverlay.remove();
      this.breakOverlay = null;
    }
  }

  // 获取当前状态
  getStatus() {
    return {
      isRunning: this.isRunning,
      isBreak: this.isBreak,
      timeLeft: this.timeLeft,
      totalTime: this.totalTime,
      pomodoroCount: this.pomodoroCount
    };
  }

  // 销毁计时器
  destroy() {
    this.stopPomodoro();
    if (this.timerBar) {
      this.timerBar.remove();
      this.timerBar = null;
    }
    this.hideBreakOverlay();
  }
}

// 初始化计时器
const focusTimer = new FocusTimer();

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  focusTimer.destroy();
});
