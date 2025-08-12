// Focus statistics utility for FocusGuard extension
class FocusStats {
  constructor() {
    this.today = new Date().toDateString();
  }

  // 记录番茄钟完成
  async recordPomodoro(duration = 25) {
    try {
      const storage = await import('./storage.js');
      const currentStats = await storage.default.getSettings();
      
      const stats = currentStats.stats;
      const today = new Date().toDateString();
      
      // 更新统计数据
      stats.totalPomodoros += 1;
      stats.totalFocusTime += duration;
      
      // 检查连续天数
      if (stats.lastFocusDate !== today) {
        const lastDate = stats.lastFocusDate ? new Date(stats.lastFocusDate) : null;
        const currentDate = new Date(today);
        
        if (!lastDate || this.isConsecutiveDay(lastDate, currentDate)) {
          stats.streakDays += 1;
        } else {
          stats.streakDays = 1;
        }
        
        stats.lastFocusDate = today;
      }
      
      await storage.default.updateStats(stats);
      return stats;
    } catch (error) {
      console.error('Failed to record pomodoro:', error);
      return null;
    }
  }

  // 检查是否是连续天
  isConsecutiveDay(lastDate, currentDate) {
    const timeDiff = currentDate.getTime() - lastDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff === 1;
  }

  // 获取今日统计
  async getTodayStats() {
    try {
      const storage = await import('./storage.js');
      const settings = await storage.default.getSettings();
      const stats = settings.stats;
      
      return {
        totalPomodoros: stats.totalPomodoros,
        totalFocusTime: stats.totalFocusTime,
        streakDays: stats.streakDays,
        lastFocusDate: stats.lastFocusDate,
        isToday: stats.lastFocusDate === this.today
      };
    } catch (error) {
      console.error('Failed to get today stats:', error);
      return null;
    }
  }

  // 获取成就
  async getAchievements() {
    try {
      const stats = await this.getTodayStats();
      if (!stats) return [];
      
      const achievements = [];
      
      // 番茄钟成就
      if (stats.totalPomodoros >= 1) achievements.push('first_pomodoro');
      if (stats.totalPomodoros >= 5) achievements.push('pomodoro_beginner');
      if (stats.totalPomodoros >= 20) achievements.push('pomodoro_master');
      if (stats.totalPomodoros >= 100) achievements.push('pomodoro_expert');
      
      // 专注时间成就
      if (stats.totalFocusTime >= 60) achievements.push('one_hour_focus');
      if (stats.totalFocusTime >= 300) achievements.push('five_hour_focus');
      if (stats.totalFocusTime >= 1000) achievements.push('focus_legend');
      
      // 连续天数成就
      if (stats.streakDays >= 3) achievements.push('three_day_streak');
      if (stats.streakDays >= 7) achievements.push('week_streak');
      if (stats.streakDays >= 30) achievements.push('month_streak');
      if (stats.streakDays >= 100) achievements.push('century_streak');
      
      return achievements;
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  }

  // 获取成就描述
  getAchievementDescription(achievementId) {
    const descriptions = {
      first_pomodoro: { title: '初次专注', description: '完成第一个番茄钟' },
      pomodoro_beginner: { title: '专注新手', description: '完成5个番茄钟' },
      pomodoro_master: { title: '专注大师', description: '完成20个番茄钟' },
      pomodoro_expert: { title: '专注专家', description: '完成100个番茄钟' },
      one_hour_focus: { title: '一小时专注', description: '累计专注1小时' },
      five_hour_focus: { title: '五小时专注', description: '累计专注5小时' },
      focus_legend: { title: '专注传奇', description: '累计专注1000分钟' },
      three_day_streak: { title: '三日坚持', description: '连续专注3天' },
      week_streak: { title: '一周坚持', description: '连续专注7天' },
      month_streak: { title: '一月坚持', description: '连续专注30天' },
      century_streak: { title: '百日坚持', description: '连续专注100天' }
    };
    
    return descriptions[achievementId] || { title: '未知成就', description: '' };
  }

  // 格式化时间
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  }

  // 获取专注趋势数据（最近7天）
  async getWeeklyTrend() {
    try {
      const storage = await import('./storage.js');
      const settings = await storage.default.getSettings();
      
      // 这里可以扩展为存储每日详细数据
      // 目前返回简单的总体统计
      return {
        totalPomodoros: settings.stats.totalPomodoros,
        totalFocusTime: settings.stats.totalFocusTime,
        streakDays: settings.stats.streakDays,
        averagePerDay: settings.stats.totalPomodoros / Math.max(1, settings.stats.streakDays)
      };
    } catch (error) {
      console.error('Failed to get weekly trend:', error);
      return null;
    }
  }

  // 重置统计数据
  async resetStats() {
    try {
      const storage = await import('./storage.js');
      await storage.default.resetStats();
      return true;
    } catch (error) {
      console.error('Failed to reset stats:', error);
      return false;
    }
  }

  // 导出统计数据
  async exportStats() {
    try {
      const storage = await import('./storage.js');
      const settings = await storage.default.getSettings();
      const achievements = await this.getAchievements();
      
      return {
        stats: settings.stats,
        achievements: achievements,
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to export stats:', error);
      return null;
    }
  }
}

// 导出单例实例
const focusStats = new FocusStats();
export default focusStats;
