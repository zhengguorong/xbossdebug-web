import config from "./config";
import localStorage from "./localStorage";
import events from "./events";
import report from "./report";
import proxy from "./proxy";
import utils from "./utils";

class XbossDebug extends events(localStorage(report(proxy(config)))) {
  constructor(options) {
    super(options);
    this.breadcrumbs = [];
    this.rewriteError();
    this.rewritePromiseError();
    this.catchClickQueue(); // 用于收集用户操作路径
    setTimeout(() => {
      this.catchPerformance(); // 获取应用性能
    }, 1000);
  }
  // 由于有些浏览器onError的时候信息不一致，为了兼容不同浏览器，重写onError方法，如果没有错误信息，获取调用栈自行组装
  rewriteError() {
    let defaultOnerror = window.onerror || utils.noop;
    window.onerror = (msg, url, line, col, error) => {
      // 有些浏览器没有col信息
      col = col || (window.event && window.event.errorCharacter) || 0;
      // 为什么要这样子
      if (!this.trigger("error", utils.toArray(arguments))) {
        return false;
      }
      // 组装错误信息
      var reportMsg = msg;
      if (error && error.stack) {
        reportMsg = this.handleErrorStack(error);
      } else {
        // arguments.callee.caller为获取调用栈信息
        reportMsg = this._fixMsgByCaller(reportMsg, arguments.callee.caller);
      }
      if (utils.typeDecide(reportMsg, "Event")) {
        reportMsg += reportMsg.type
          ? "--" +
            reportMsg.type +
            "--" +
            (reportMsg.target
              ? reportMsg.target.tagName + "::" + reportMsg.target.src
              : "")
          : "";
      }
      if (reportMsg) {
        // error方法在report.js定义，还有"log", "debug", "info", "warn"
        this.error({
          msg: reportMsg,
          rowNum: line,
          colNum: col,
          targetUrl: url,
          level: 4,
          breadcrumbs: JSON.stringify(this.breadcrumbs)
        });
      }

      // 调用默认的错误对象
      defaultOnerror.call(null, msg, url, line, col, error);
    };
  }
  rewritePromiseError() {
    const defaultUnhandleRejection = window.onunhandledrejection || utils.noop;
    window.onunhandledrejection = error => {
      if (!this.trigger("error", utils.toArray(arguments))) {
        return false;
      }
      let msg = (error.reason && error.reason.message) || "";
      let stackObj = {};
      if (error.reason && error.reason.stack) {
        msg = this.handleErrorStack(error.reason);
        stackObj = this._parseErrorStack(error.reason.stack);
      } else {
        msg = this._fixMsgByCaller(msg, arguments.callee.caller);
      }
      if (msg) {
        this.error({
          msg: msg,
          rowNum: stackObj.line || 0,
          colNum: stackObj.col || 0,
          targetUrl: stackObj.targetUrl || "",
          level: 4,
          breadcrumbs: JSON.stringify(this.breadcrumbs)
        });
      }
      defaultUnhandledRejection.call(null, error);
    };
  }
  // 处理onerror返回的error.stack
  handleErrorStack(error) {
    let stackMsg = error.stack;
    let errorMsg = error.toString();
    if (errorMsg) {
      if (stackMsg.indexOf(errorMsg) === -1) {
        stackMsg += "@" + errorMsg;
      }
    } else {
      stackMsg = "";
    }
    return stackMsg;
  }
  // 不存在stack的话，取调用栈信息
  _fixMsgByCaller(msg, caller) {
    var ext = [];
    var f = caller,
      c = 3;
    while (f && c-- > 0) {
      ext.push(f.toString());
      if (f === f.caller) {
        break; // 如果有环
      }
      f = f.caller;
    }
    if (ext.length > 0) {
      msg += "@" + ext.join(",");
    }
    return msg;
  }
  // 从报错信息中获取行号、列号、url
  _parseErrorStack(stack) {
    const stackObj = {};
    const stackArr = stack.split("at");
    // 只取第一个堆栈信息，获取包含url、line、col的部分，如果有括号，去除最后的括号
    const info = stackArr[1].match(/http.*/)[0].replace(/\)$/, "");
    // 以冒号拆分
    const errorInfoArr = info.split(":");
    const len = errorInfoArr.length;
    // 行号、列号在最后位置
    stackObj.col = errorInfoArr[len - 1];
    stackObj.line = errorInfoArr[len - 2];
    // 删除最后两个（行号、列号）
    errorInfoArr.splice(len - 2, 2);
    stackObj.targetUrl = errorInfoArr.join(":");
    return stackObj;
  }
  // 监听点击事件，记录用户操作路径
  catchClickQueue() {
    if (window.addEventListener) {
      if ("ontouchstart" in document.documentElement) {
        window.addEventListener("touchstart", this._storeClickedDom, !0);
      } else {
        window.addEventListener("click", this._storeClickedDom, !0);
      }
    } else {
      document.attachEvent("onclick", this._storeClickedDom);
    }
  }
  _storeClickedDom = ele => {
    const target = ele.target ? ele.target : ele.srcElement;
    let info = {
      time: new Date().getTime()
    };
    if (target) {
      // 只保存存在的属性
      target.tagName && (info.tagName = target.tagName);
      target.id && (info.id = target.id);
      target.className && (info.className = target.className);
      target.name && (info.name = target.name);
      // 不存在id时，遍历父元素
      if (!target.id) {
        // 遍历三层父元素
        let i = 0,
          parent = target;
        while (i++ < 3 && parent.parentNode) {
          if (!parent.parentNode.outerHTML) break;
          parent = parent.parentNode;
          if (parent.id) break;
        }
        // 如果父元素中有id，则只保存id，保存规则为 父元素层级:id
        if (parent.id) {
          info.parentId = i + ":" + parent.id;
        } else {
          // 父元素没有id，则保存outerHTML
          let outerHTML = parent.outerHTML.replace(/>\s+</g, "><"); // 去除空白字符
          outerHTML &&
            outerHTML.length > 200 &&
            (outerHTML = outerHTML.slice(0, 200));
          info.outerHTML = outerHTML;
        }
      }
      // 加入浏览历史，只记录10条
      this.breadcrumbs.push(info);
      this.breadcrumbs.length > 10 && this.breadcrumbs.shift();
    }
  };
  catchPerformance() {
    window.performance && utils.handleAddListener("load", this._getTiming());
  }
  _getTiming = () => {
    var time = performance.timing;
    var timingObj = {};
    var loadTime = (time.loadEventEnd - time.loadEventStart) / 1000;
    if (loadTime < 0) {
      setTimeout(() => {
        this._getTiming();
      }, 200);
      return;
    }
    timingObj["request"] = time.responseEnd - time.requestStart;
    timingObj["domrender"] = time.domComplete - time.domInteractive; // dom解析时间
    timingObj["fp"] = time.responseStart - time.navigationStart; // 白屏时间
    timingObj["domready"] =
      time.domContentLoadedEventEnd - time.navigationStart;
    timingObj["onload"] = time.loadEventEnd - time.navigationStart;
    timingObj["fmp"] = parseInt(
      performance.getEntriesByType("paint")[0].startTime
    ); // 首次渲染
    timingObj["TTI"] = time.domInteractive - time.requestStart;
    var item;
    for (item in timingObj) {
      console.log(item + ":" + timingObj[item] + "毫秒(ms)");
    }
    this.reportPerformance(timingObj);
  };
}

export default XbossDebug;
