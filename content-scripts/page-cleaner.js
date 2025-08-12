// Page Cleaner for FocusGuard extension
class PageCleaner {
  constructor() {
    this.isActive = false;
    this.cleanedElements = new Set();
    this.settings = null;
    this.observer = null;
    
    this.init();
  }

  async init() {
    try {
      const storage = await import('../utils/storage.js');
      this.settings = await storage.default.getSettings();
      
      // 监听来自popup的消息
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'TOGGLE_CLEANER') {
          this.toggleCleaner();
          sendResponse({ success: true, isActive: this.isActive });
        } else if (message.type === 'GET_CLEANER_STATUS') {
          sendResponse({ isActive: this.isActive });
        }
      });
    } catch (error) {
      console.error('PageCleaner init error:', error);
    }
  }

  // 切换净化模式
  toggleCleaner() {
    if (this.isActive) {
      this.disableCleaner();
    } else {
      this.enableCleaner();
    }
  }

  // 启用净化模式
  enableCleaner() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.cleanPage();
    this.startObserver();
    
    // 发送状态更新
    chrome.runtime.sendMessage({
      type: 'CLEANER_ENABLED'
    });
  }

  // 禁用净化模式
  disableCleaner() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.restoreElements();
    this.stopObserver();
    
    // 发送状态更新
    chrome.runtime.sendMessage({
      type: 'CLEANER_DISABLED'
    });
  }

  // 清理页面
  cleanPage() {
    const hostname = window.location.hostname;
    const selectors = this.getSelectorsForSite(hostname);
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        this.hideElement(element);
      });
    });
  }

  // 根据网站获取选择器
  getSelectorsForSite(hostname) {
    const siteRules = {
      'bilibili.com': [
        '.bili-video-card__info--right',
        '.bili-video-card__info--left',
        '.bili-video-card__stats',
        '.bili-video-card__up',
        '.bili-video-card__tag',
        '.bili-video-card__cover',
        '.bili-video-card__info--right',
        '.bili-video-card__info--left',
        '.bili-video-card__stats',
        '.bili-video-card__up',
        '.bili-video-card__tag',
        '.bili-video-card__cover'
      ],
      'youtube.com': [
        '#secondary',
        '#related',
        '#comments',
        '#meta',
        '#info',
        '#description',
        '#subscribe-button',
        '#channel-name',
        '#channel-info',
        '#channel-stats',
        '#channel-description',
        '#channel-links'
      ],
      'zhihu.com': [
        '.HotList',
        '.TopstoryItem',
        '.Feed',
        '.Card',
        '.HotQuestions',
        '.TopstoryItem',
        '.Feed',
        '.Card',
        '.HotQuestions'
      ],
      'weibo.com': [
        '.WB_feed',
        '.WB_cardwrap',
        '.WB_feed_type',
        '.WB_feed_handle',
        '.WB_feed_opt',
        '.WB_feed_opt_forward',
        '.WB_feed_opt_comment',
        '.WB_feed_opt_like'
      ]
    };

    // 获取网站特定规则
    const siteSelectors = siteRules[hostname] || [];
    
    // 合并用户自定义规则
    const customSelectors = this.settings?.cleaningRules?.customSelectors || [];
    
    return [...siteSelectors, ...customSelectors];
  }

  // 隐藏元素
  hideElement(element) {
    if (this.cleanedElements.has(element)) return;
    
    // 保存原始样式
    const originalDisplay = element.style.display;
    const originalVisibility = element.style.visibility;
    
    // 隐藏元素
    element.style.display = 'none';
    element.style.visibility = 'hidden';
    
    // 记录清理的元素
    this.cleanedElements.add(element);
    
    // 保存原始样式以便恢复
    element._focusGuardOriginalDisplay = originalDisplay;
    element._focusGuardOriginalVisibility = originalVisibility;
  }

  // 恢复元素
  restoreElements() {
    this.cleanedElements.forEach(element => {
      if (element._focusGuardOriginalDisplay !== undefined) {
        element.style.display = element._focusGuardOriginalDisplay;
        element.style.visibility = element._focusGuardOriginalVisibility;
        delete element._focusGuardOriginalDisplay;
        delete element._focusGuardOriginalVisibility;
      }
    });
    
    this.cleanedElements.clear();
  }

  // 开始观察DOM变化
  startObserver() {
    if (this.observer) return;
    
    this.observer = new MutationObserver((mutations) => {
      if (!this.isActive) return;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.cleanNewElements(node);
          }
        });
      });
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 停止观察
  stopObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  // 清理新添加的元素
  cleanNewElements(element) {
    const hostname = window.location.hostname;
    const selectors = this.getSelectorsForSite(hostname);
    
    selectors.forEach(selector => {
      const elements = element.querySelectorAll ? 
        element.querySelectorAll(selector) : 
        (element.matches && element.matches(selector) ? [element] : []);
      
      elements.forEach(el => {
        this.hideElement(el);
      });
    });
  }

  // 获取当前状态
  getStatus() {
    return {
      isActive: this.isActive,
      cleanedCount: this.cleanedElements.size
    };
  }

  // 销毁清理器
  destroy() {
    this.disableCleaner();
    this.stopObserver();
  }
}

// 初始化页面清理器
const pageCleaner = new PageCleaner();

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  pageCleaner.destroy();
});
