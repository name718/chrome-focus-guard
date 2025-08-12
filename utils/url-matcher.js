// URL matching utility for FocusGuard extension
class URLMatcher {
  constructor() {
    this.cache = new Map();
  }

  // 检查URL是否匹配黑名单
  isBlacklisted(url, blacklist) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      const fullUrl = urlObj.href;

      return blacklist.some(pattern => {
        // 检查缓存
        const cacheKey = `${pattern}:${fullUrl}`;
        if (this.cache.has(cacheKey)) {
          return this.cache.get(cacheKey);
        }

        const isMatch = this.matchPattern(pattern, hostname, pathname, fullUrl);
        this.cache.set(cacheKey, isMatch);
        return isMatch;
      });
    } catch (error) {
      console.error('URL matching error:', error);
      return false;
    }
  }

  // 匹配模式
  matchPattern(pattern, hostname, pathname, fullUrl) {
    // 支持通配符匹配
    if (pattern.includes('*')) {
      return this.matchWildcard(pattern, hostname, pathname, fullUrl);
    }

    // 精确匹配
    if (pattern.startsWith('http://') || pattern.startsWith('https://')) {
      return fullUrl.includes(pattern);
    }

    // 域名匹配
    if (pattern.includes('/')) {
      // 包含路径的匹配
      return hostname.includes(pattern.split('/')[0]) && 
             pathname.includes(pattern.split('/')[1]);
    }

    // 纯域名匹配
    return hostname.includes(pattern);
  }

  // 通配符匹配
  matchWildcard(pattern, hostname, pathname, fullUrl) {
    // 将通配符转换为正则表达式
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '\\.');

    const regex = new RegExp(regexPattern, 'i');
    
    // 尝试匹配完整URL、域名+路径、域名
    return regex.test(fullUrl) || 
           regex.test(hostname + pathname) || 
           regex.test(hostname);
  }

  // 检查是否在专注时间内
  isInFocusTime(schedule) {
    if (!schedule.enabled) {
      return false;
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 = 周日, 1 = 周一, ...
    const currentTime = now.getHours() * 60 + now.getMinutes(); // 转换为分钟

    // 检查是否是工作日
    if (!schedule.workdays.includes(currentDay)) {
      return false;
    }

    // 解析时间
    const startMinutes = this.timeToMinutes(schedule.startTime);
    const endMinutes = this.timeToMinutes(schedule.endTime);

    return currentTime >= startMinutes && currentTime <= endMinutes;
  }

  // 时间字符串转换为分钟
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // 清理缓存
  clearCache() {
    this.cache.clear();
  }

  // 获取匹配的规则
  getMatchingRules(url, blacklist) {
    const matchingRules = [];
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      const fullUrl = urlObj.href;

      blacklist.forEach(pattern => {
        if (this.matchPattern(pattern, hostname, pathname, fullUrl)) {
          matchingRules.push(pattern);
        }
      });
    } catch (error) {
      console.error('Error getting matching rules:', error);
    }

    return matchingRules;
  }

  // 验证URL格式
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // 标准化URL
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  }
}

// 导出单例实例
const urlMatcher = new URLMatcher();
export default urlMatcher;
