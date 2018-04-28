class XbossDebug {
  constructor(options) {
    super(options)
  }
  // 由于有些浏览器onError的时候信息不一致，为了兼容不同浏览器，重写onError方法，如果没有错误信息，获取调用栈自行组装
  rewriteError() {
    window.onError = function(msg, url, line, col, error) {
      // 有些浏览器没有col信息
      col = col || (window.event && window.event.errorCharacter) || 0;

    };
  }
}
export default XbossDebug;
