// Storage utility for FocusGuard extension
class FocusGuardStorage {
  constructor() {
    this.defaultSettings = {
      // 黑名单网站
      blacklist: [
        'weibo.com',
        'douyin.com',
        'zhihu.com/hot',
        'bilibili.com',
        'youtube.com',
        'twitter.com',
        'facebook.com',
        'instagram.com'
      ],
      // 专注时间计划
      focusSchedule: {
        enabled: false,
        workdays: [1, 2, 3, 4, 5], // 周一到周五
        startTime: '09:00',
        endTime: '12:00'
      },
      // 番茄钟设置
      pomodoro: {
        workDuration: 25, // 分钟
        breakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4
      },
      // 页面净化规则
      cleaningRules: {
        enabled: false,
        customSelectors: []
      },
      // 用户激励设置
      motivation: {
        customMessage: '写完PPT再刷！',
        showTodoList: true,
        unlockDelay: 300 // 5分钟解锁延迟
      },
      // 统计数据
      stats: {
        totalPomodoros: 0,
        totalFocusTime: 0,
        streakDays: 0,
        lastFocusDate: null
      }
    };
  }

  // 获取设置
  async getSettings() {
    try {
      const result = await chrome.storage.sync.get(null);
      return { ...this.defaultSettings, ...result };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return this.defaultSettings;
    }
  }

  // 保存设置
  async saveSettings(settings) {
    try {
      await chrome.storage.sync.set(settings);
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  // 更新特定设置
  async updateSetting(key, value) {
    try {
      const settings = await this.getSettings();
      settings[key] = value;
      await this.saveSettings(settings);
      return true;
    } catch (error) {
      console.error('Failed to update setting:', error);
      return false;
    }
  }

  // 添加黑名单网站
  async addToBlacklist(url) {
    try {
      const settings = await this.getSettings();
      if (!settings.blacklist.includes(url)) {
        settings.blacklist.push(url);
        await this.saveSettings(settings);
      }
      return true;
    } catch (error) {
      console.error('Failed to add to blacklist:', error);
      return false;
    }
  }

  // 从黑名单移除
  async removeFromBlacklist(url) {
    try {
      const settings = await this.getSettings();
      settings.blacklist = settings.blacklist.filter(item => item !== url);
      await this.saveSettings(settings);
      return true;
    } catch (error) {
      console.error('Failed to remove from blacklist:', error);
      return false;
    }
  }

  // 更新统计数据
  async updateStats(stats) {
    try {
      const settings = await this.getSettings();
      settings.stats = { ...settings.stats, ...stats };
      await this.saveSettings(settings);
      return true;
    } catch (error) {
      console.error('Failed to update stats:', error);
      return false;
    }
  }

  // 重置统计数据
  async resetStats() {
    try {
      const settings = await this.getSettings();
      settings.stats = this.defaultSettings.stats;
      await this.saveSettings(settings);
      return true;
    } catch (error) {
      console.error('Failed to reset stats:', error);
      return false;
    }
  }
}

// 导出单例实例
const focusGuardStorage = new FocusGuardStorage();
export default focusGuardStorage;
