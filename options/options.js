// Options page logic for FocusGuard extension
class FocusGuardOptions {
  constructor() {
    this.settings = null;
    this.init();
  }

  async init() {
    try {
      // 获取当前设置
      await this.loadSettings();
      
      // 初始化UI
      this.initUI();
      
      // 绑定事件
      this.bindEvents();
      
    } catch (error) {
      console.error('Options init error:', error);
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(null);
      this.settings = result;
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = {};
    }
  }

  initUI() {
    // 创建选项页面UI
    const container = document.getElementById('options-container');
    if (!container) return;

    container.innerHTML = `
      <div class="options-section">
        <h2>⚙️ 基本设置</h2>
        
        <div class="setting-group">
          <label>
            <input type="checkbox" id="focus-schedule-enabled">
            启用专注时间计划
          </label>
          <small>在指定时间段自动开启专注模式</small>
        </div>

        <div class="setting-group">
          <label>工作日：</label>
          <div class="checkbox-group">
            <label><input type="checkbox" value="1" class="workday"> 周一</label>
            <label><input type="checkbox" value="2" class="workday"> 周二</label>
            <label><input type="checkbox" value="3" class="workday"> 周三</label>
            <label><input type="checkbox" value="4" class="workday"> 周四</label>
            <label><input type="checkbox" value="5" class="workday"> 周五</label>
            <label><input type="checkbox" value="6" class="workday"> 周六</label>
            <label><input type="checkbox" value="0" class="workday"> 周日</label>
          </div>
        </div>

        <div class="setting-group">
          <label>专注时间：</label>
          <input type="time" id="focus-start-time" value="09:00">
          <span>至</span>
          <input type="time" id="focus-end-time" value="12:00">
        </div>
      </div>

      <div class="options-section">
        <h2>🚫 黑名单管理</h2>
        
        <div class="setting-group">
          <label>
            <input type="checkbox" id="blacklist-enabled">
            启用黑名单功能
          </label>
          <small>关闭后黑名单网站将不会被屏蔽</small>
        </div>

        <div class="setting-group">
          <label>黑名单模式：</label>
          <select id="blacklist-mode">
            <option value="always">始终屏蔽</option>
            <option value="schedule">专注时间屏蔽</option>
          </select>
          <small>始终屏蔽：随时屏蔽黑名单网站<br>专注时间屏蔽：只在专注时间内屏蔽</small>
        </div>

        <div class="setting-group">
          <label>添加网站到黑名单：</label>
          <input type="text" id="add-blacklist-url" placeholder="例如: weibo.com">
          <button id="add-blacklist-btn">添加</button>
        </div>

        <div class="setting-group">
          <label>当前黑名单：</label>
          <div id="blacklist-container" class="blacklist-list"></div>
        </div>
      </div>

      <div class="options-section">
        <h2>🧹 页面净化设置</h2>
        
        <div class="setting-group">
          <label>自定义净化规则：</label>
          <textarea id="custom-cleaner-rules" placeholder="每行一个CSS选择器，例如：&#10;.sidebar&#10;.recommendations&#10;.comments"></textarea>
          <button id="save-cleaner-rules-btn">保存规则</button>
        </div>
      </div>

      <div class="options-section">
        <h2>⏰ 番茄钟设置</h2>
        
        <div class="setting-group">
          <label>专注时长（分钟）：</label>
          <input type="number" id="work-duration" value="25" min="1" max="120">
        </div>

        <div class="setting-group">
          <label>休息时长（分钟）：</label>
          <input type="number" id="break-duration" value="5" min="1" max="30">
        </div>

        <div class="setting-group">
          <label>长休息时长（分钟）：</label>
          <input type="number" id="long-break-duration" value="15" min="1" max="60">
        </div>

        <div class="setting-group">
          <label>长休息间隔（番茄钟数）：</label>
          <input type="number" id="long-break-interval" value="4" min="1" max="10">
        </div>
      </div>

      <div class="options-section">
        <h2>📊 数据管理</h2>
        
        <div class="setting-group">
          <button id="export-stats-btn">导出统计数据</button>
          <button id="reset-stats-btn">重置统计数据</button>
          <button id="reset-settings-btn">重置所有设置</button>
        </div>
      </div>

      <div class="options-section">
        <button id="save-settings-btn" class="save-btn">💾 保存所有设置</button>
      </div>
    `;

    // 加载当前设置到UI
    this.loadSettingsToUI();
  }

  loadSettingsToUI() {
    if (!this.settings) return;

    // 专注时间计划
    const focusSchedule = this.settings.focusSchedule || {};
    document.getElementById('focus-schedule-enabled').checked = focusSchedule.enabled || false;
    document.getElementById('focus-start-time').value = focusSchedule.startTime || '09:00';
    document.getElementById('focus-end-time').value = focusSchedule.endTime || '12:00';

    // 工作日
    const workdays = focusSchedule.workdays || [1, 2, 3, 4, 5];
    document.querySelectorAll('.workday').forEach(checkbox => {
      checkbox.checked = workdays.includes(parseInt(checkbox.value));
    });

    // 番茄钟设置
    const pomodoro = this.settings.pomodoro || {};
    document.getElementById('work-duration').value = pomodoro.workDuration || 25;
    document.getElementById('break-duration').value = pomodoro.breakDuration || 5;
    document.getElementById('long-break-duration').value = pomodoro.longBreakDuration || 15;
    document.getElementById('long-break-interval').value = pomodoro.longBreakInterval || 4;

    // 黑名单设置
    document.getElementById('blacklist-enabled').checked = this.settings.blacklistEnabled !== false;
    document.getElementById('blacklist-mode').value = this.settings.blacklistMode || 'always';

    // 黑名单
    this.updateBlacklistDisplay();

    // 自定义净化规则
    const customRules = this.settings.cleaningRules?.customSelectors || [];
    document.getElementById('custom-cleaner-rules').value = customRules.join('\n');
  }

  updateBlacklistDisplay() {
    const container = document.getElementById('blacklist-container');
    const blacklist = this.settings.blacklist || [];
    
    container.innerHTML = blacklist.map(url => `
      <div class="blacklist-item">
        <span>${url}</span>
        <button class="remove-blacklist-btn" data-url="${url}">删除</button>
      </div>
    `).join('');
  }

  bindEvents() {
    // 保存设置
    document.getElementById('save-settings-btn').addEventListener('click', () => {
      this.saveSettings();
    });

    // 添加黑名单
    document.getElementById('add-blacklist-btn').addEventListener('click', () => {
      this.addToBlacklist();
    });

    // 删除黑名单
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-blacklist-btn')) {
        const url = e.target.dataset.url;
        this.removeFromBlacklist(url);
      }
    });

    // 保存净化规则
    document.getElementById('save-cleaner-rules-btn').addEventListener('click', () => {
      this.saveCleanerRules();
    });

    // 数据管理
    document.getElementById('export-stats-btn').addEventListener('click', () => {
      this.exportStats();
    });

    document.getElementById('reset-stats-btn').addEventListener('click', () => {
      this.resetStats();
    });

    document.getElementById('reset-settings-btn').addEventListener('click', () => {
      this.resetSettings();
    });
  }

  async saveSettings() {
    try {
      const settings = {
        focusSchedule: {
          enabled: document.getElementById('focus-schedule-enabled').checked,
          workdays: Array.from(document.querySelectorAll('.workday:checked')).map(cb => parseInt(cb.value)),
          startTime: document.getElementById('focus-start-time').value,
          endTime: document.getElementById('focus-end-time').value
        },
        pomodoro: {
          workDuration: parseInt(document.getElementById('work-duration').value),
          breakDuration: parseInt(document.getElementById('break-duration').value),
          longBreakDuration: parseInt(document.getElementById('long-break-duration').value),
          longBreakInterval: parseInt(document.getElementById('long-break-interval').value)
        },
        blacklistEnabled: document.getElementById('blacklist-enabled').checked,
        blacklistMode: document.getElementById('blacklist-mode').value
      };

      await chrome.storage.sync.set(settings);
      this.settings = { ...this.settings, ...settings };
      
      this.showMessage('设置已保存', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showMessage('保存失败', 'error');
    }
  }

  async addToBlacklist() {
    const url = document.getElementById('add-blacklist-url').value.trim();
    if (!url) {
      this.showMessage('请输入网站地址', 'error');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'ADD_TO_BLACKLIST',
        url: url
      });

      if (response && response.success) {
        this.settings.blacklist = this.settings.blacklist || [];
        if (!this.settings.blacklist.includes(url)) {
          this.settings.blacklist.push(url);
        }
        this.updateBlacklistDisplay();
        document.getElementById('add-blacklist-url').value = '';
        this.showMessage('已添加到黑名单', 'success');
      } else {
        this.showMessage(response?.message || '添加失败', 'error');
      }
    } catch (error) {
      console.error('Failed to add to blacklist:', error);
      this.showMessage('添加失败', 'error');
    }
  }

  async removeFromBlacklist(url) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'REMOVE_FROM_BLACKLIST',
        url: url
      });

      if (response && response.success) {
        this.settings.blacklist = this.settings.blacklist || [];
        const index = this.settings.blacklist.indexOf(url);
        if (index > -1) {
          this.settings.blacklist.splice(index, 1);
        }
        this.updateBlacklistDisplay();
        this.showMessage('已从黑名单移除', 'success');
      } else {
        this.showMessage(response?.message || '移除失败', 'error');
      }
    } catch (error) {
      console.error('Failed to remove from blacklist:', error);
      this.showMessage('移除失败', 'error');
    }
  }

  async saveCleanerRules() {
    const rulesText = document.getElementById('custom-cleaner-rules').value;
    const rules = rulesText.split('\n').filter(rule => rule.trim());

    try {
      const settings = {
        cleaningRules: {
          customSelectors: rules
        }
      };

      await chrome.storage.sync.set(settings);
      this.settings = { ...this.settings, ...settings };
      this.showMessage('净化规则已保存', 'success');
    } catch (error) {
      console.error('Failed to save cleaner rules:', error);
      this.showMessage('保存失败', 'error');
    }
  }

  async exportStats() {
    try {
      const result = await chrome.storage.sync.get(null);
      const stats = {};
      
      // 收集所有番茄钟统计数据
      Object.keys(result).forEach(key => {
        if (key.startsWith('pomodoro_')) {
          stats[key] = result[key];
        }
      });

      const dataStr = JSON.stringify(stats, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `focusguard-stats-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      this.showMessage('统计数据已导出', 'success');
    } catch (error) {
      console.error('Failed to export stats:', error);
      this.showMessage('导出失败', 'error');
    }
  }

  async resetStats() {
    if (confirm('确定要重置所有统计数据吗？此操作不可恢复。')) {
      try {
        const result = await chrome.storage.sync.get(null);
        const keysToRemove = Object.keys(result).filter(key => key.startsWith('pomodoro_'));
        
        if (keysToRemove.length > 0) {
          await chrome.storage.sync.remove(keysToRemove);
        }
        
        this.showMessage('统计数据已重置', 'success');
      } catch (error) {
        console.error('Failed to reset stats:', error);
        this.showMessage('重置失败', 'error');
      }
    }
  }

  async resetSettings() {
    if (confirm('确定要重置所有设置吗？此操作不可恢复。')) {
      try {
        await chrome.storage.sync.clear();
        this.settings = {};
        this.loadSettingsToUI();
        this.showMessage('设置已重置', 'success');
      } catch (error) {
        console.error('Failed to reset settings:', error);
        this.showMessage('重置失败', 'error');
      }
    }
  }

  showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      z-index: 999999;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 3000);
  }
}

// 初始化选项页面
const options = new FocusGuardOptions();
