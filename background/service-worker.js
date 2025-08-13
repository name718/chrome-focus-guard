// Service worker for chrome-focus-guard (Manifest V3)

// 内联存储管理功能
class FocusGuardStorage {
  constructor() {
    this.defaultSettings = {
      blacklist: [
        'weibo.com', 'douyin.com', 'zhihu.com/hot', 'bilibili.com',
        'youtube.com', 'twitter.com', 'facebook.com', 'instagram.com'
      ],
      focusSchedule: {
        enabled: false,
        workdays: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '12:00'
      }
    };
  }

  async getSettings() {
    try {
      const result = await chrome.storage.sync.get(null);
      return { ...this.defaultSettings, ...result };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return this.defaultSettings;
    }
  }
}

// 内联URL匹配功能
class URLMatcher {
  isInFocusTime(schedule) {
    if (!schedule.enabled) return false;
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    if (!schedule.workdays.includes(currentDay)) return false;
    
    const startMinutes = this.timeToMinutes(schedule.startTime);
    const endMinutes = this.timeToMinutes(schedule.endTime);
    
    return currentTime >= startMinutes && currentTime <= endMinutes;
  }

  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  isBlacklisted(url, blacklist) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      return blacklist.some(pattern => {
        if (pattern.includes('*')) {
          const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
          const regex = new RegExp(regexPattern, 'i');
          return regex.test(hostname);
        }
        return hostname.includes(pattern);
      });
    } catch (error) {
      console.error('URL matching error:', error);
      return false;
    }
  }
}

// 初始化工具实例
const storage = new FocusGuardStorage();
const urlMatcher = new URLMatcher();

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[FocusGuard] Extension installed/updated', details);
  
  // 初始化默认设置
  storage.getSettings().then(settings => {
    console.log('[FocusGuard] Settings loaded:', settings);
  });
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    await checkAndBlockSite(tabId, tab.url);
  }
});

// 监听标签页激活
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    await checkAndBlockSite(activeInfo.tabId, tab.url);
  }
});

// 检查并阻止网站
async function checkAndBlockSite(tabId, url) {
  try {
    const settings = await storage.getSettings();
    
    // 检查是否在专注时间内
    const isInFocusTime = urlMatcher.isInFocusTime(settings.focusSchedule);
    
    // 检查URL是否在黑名单中
    const isBlacklisted = urlMatcher.isBlacklisted(url, settings.blacklist);
    
    if (isInFocusTime && isBlacklisted) {
      // 重定向到专注页面
      const redirectUrl = chrome.runtime.getURL('pages/focus-redirect.html') + 
                         `?redirect=${encodeURIComponent(url)}`;
      
      await chrome.tabs.update(tabId, { url: redirectUrl });
      
      console.log('[FocusGuard] Blocked access to:', url);
    }
  } catch (error) {
    console.error('[FocusGuard] Error checking site:', error);
  }
}

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'FOCUS_GUARD_PING') {
    sendResponse({ ok: true, source: 'service-worker' });
  } else if (message?.type === 'POMODORO_STARTED') {
    console.log('[FocusGuard] Pomodoro started:', message.duration);
    sendResponse({ success: true });
  } else if (message?.type === 'POMODORO_COMPLETED') {
    console.log('[FocusGuard] Pomodoro completed:', message.duration);
    sendResponse({ success: true });
  } else if (message?.type === 'SITE_UNLOCKED') {
    console.log('[FocusGuard] Site unlocked:', message.originalUrl);
    sendResponse({ success: true });
  } else if (message?.type === 'CLEANER_ENABLED') {
    console.log('[FocusGuard] Page cleaner enabled');
    sendResponse({ success: true });
  } else if (message?.type === 'CLEANER_DISABLED') {
    console.log('[FocusGuard] Page cleaner disabled');
    sendResponse({ success: true });
  }
  
  // Keep the message channel open if we will respond async
  return false;
});

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'fg_start_pomodoro',
    title: '开始番茄钟',
    contexts: ['action']
  });
  
  chrome.contextMenus.create({
    id: 'fg_toggle_cleaner',
    title: '切换页面净化',
    contexts: ['action']
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'fg_start_pomodoro') {
    // 向当前标签页发送开始番茄钟消息
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'START_POMODORO' });
    }
  } else if (info.menuItemId === 'fg_toggle_cleaner') {
    // 向当前标签页发送切换净化模式消息
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_CLEANER' });
    }
  }
});

