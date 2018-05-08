(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.XbossDebug = factory());
}(this, (function () { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  /**
   * @author suman
   * @fileoverview report
   * @date 2017/02/15
   */

  var utils = {
      typeDecide: function typeDecide(o, type) {
          return Object.prototype.toString.call(o) === "[object " + type + "]";
      },
      isFunction: function isFunction(f) {
          return utils.typeDecide(f, 'Function');
      },
      isString: function isString(f) {
          return utils.typeDecide(f, 'String');
      },
      serializeObj: function serializeObj(obj) {
          var parames = '';
          Object.keys(obj).forEach(function (name) {
              if (utils.typeDecide(obj[name], 'Object')) {
                  parames += name + '=' + utils.stringify(obj[name]);
              } else {
                  parames += name + '=' + obj[name] + '^';
              }
          });
          console.log(parames);
          return encodeURIComponent(parames.substr(0, parames.length - 1));
      },
      stringify: function stringify(obj) {
          if (window.JSON && window.JSON.stringify) {
              return JSON.stringify(obj);
          }
          var t = typeof obj === "undefined" ? "undefined" : _typeof(obj);
          if (t != "object" || obj === null) {
              // simple data type
              if (t == "string") obj = '"' + obj + '"';
              return String(obj);
          } else {
              // recurse array or object
              var n,
                  v,
                  json = [],
                  arr = obj && obj.constructor == Array;

              // fix.
              var self = arguments.callee;

              for (n in obj) {
                  if (obj.hasOwnProperty(n)) {

                      v = obj[n];
                      t = typeof v === "undefined" ? "undefined" : _typeof(v);
                      if (obj.hasOwnProperty(n)) {
                          if (t == "string") v = '"' + v + '"';else if (t == "object" && v !== null)
                              // v = jQuery.stringify(v);
                              v = self(v);
                          json.push((arr ? "" : '"' + n + '":') + String(v));
                      }
                  }
              }
              return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
          }
      },
      parse: function parse(str) {
          return window.JSON && window.JSON.parse ? JSON.parse(str) : new Function('return ' + str)();
      },
      getServerPort: function getServerPort() {
          return window.location.port === '' ? window.location.protocol === 'http:' ? '80' : '443' : window.location.port;
      },
      getUserAgent: function getUserAgent() {
          return window.navigator.userAgent;
      },
      getPlatType: function getPlatType() {
          try {
              document.createEvent("TouchEvent");
              return 'Mobile';
          } catch (e) {
              return 'PC';
          }
      },
      flashVer: function flashVer() {
          var f = "-";
          var n = navigator;
          var ii = void 0;
          if (n.plugins && n.plugins.length) {
              for (ii = 0; ii < n.plugins.length; ii++) {
                  if (n.plugins[ii].name.indexOf('Shockwave Flash') !== -1) {
                      f = n.plugins[ii].description.split('Shockwave Flash ')[1];
                      break;
                  }
              }
          } else if (window.ActiveXObject) {
              for (ii = 10; ii >= 2; ii--) {
                  try {
                      var fl = new Function("return new ActiveXObject('ShockwaveFlash.ShockwaveFlash." + ii + "');")();
                      if (fl) {
                          f = ii + '.0';
                          break;
                      }
                  } catch (e) {}
              }
          }
          return f;
      },
      // 从字符串 src 中查找 k+sp 和  e 之间的字符串，如果 k==e 且 k 只有一个，或者 e 不存在，从 k+sp 截取到字符串结束
      // abcd=1&b=1&c=3;
      // abdc=1;b=1;a=3;
      stringSplice: function stringSplice(src, k, e, sp) {
          if (src === "") {
              return "";
          }
          sp = sp === "" ? "=" : sp;
          k += sp;
          var ps = src.indexOf(k);
          if (ps < 0) {
              return "";
          }
          ps += k.length;
          var pe = pe < ps ? src.length : src.indexOf(e, ps);
          return src.substring(ps, pe);
      },
      getReferer: function getReferer() {
          var ref = document.referrer.toLowerCase();
          var re = /^[^\?&#]*.swf([\?#])?/;
          // 如果页面 Referer 为空，从 URL 中获取
          if (ref === "" || ref.match(re)) {
              ref = utils.stringSplice(window.location.href, "ref", "&", "");
              if (ref !== "") {
                  return encodeURIComponent(ref);
              }
          }
          return encodeURIComponent(ref);
      },
      getSystemParams: function getSystemParams() {
          var scr = window.screen;
          return {
              userAgent: utils.getUserAgent(),
              currentUrl: window.location.href,
              timestamp: +new Date() + Math.random(),
              projectType: utils.getPlatType(),
              flashVer: utils.flashVer(),
              title: document.title,
              screenSize: scr.width + "x" + scr.height,
              referer: location.hostname ? location.hostname : '',
              // referer: document.referer ? document.referer : '',
              host: window.location.protocol + '//' + window.location.hostname
          };
      },
      toArray: function toArray$$1(arr) {
          return Array.prototype.slice.call(arr);
      },
      getCookie: function getCookie(key) {
          var cookieList = document.cookie.split('; ');
          var str = '';
          for (var i = 0; i < cookieList.length; i++) {
              var item = cookieList[i].split('=');
              if (item[0] == key) {
                  str = item[1];
                  break;
              }
          }
          return str;
      },
      addCookie: function addCookie(name, value, days) {
          var times = new Date();
          times.setDate(times.getDate() + (days || 365));
          document.cookie = name + "=" + value + "; expires=" + times.toGMTString();
          return utils.getCookie(name);
      },
      noop: function noop() {},
      clearCookie: function clearCookie(name) {
          utils.addCookie(name, '', -1);
          return utils.getCookie(name);
      },
      assignObject: function assignObject(obj1, obj2) {
          for (var name in obj2) {
              if (obj2.hasOwnProperty(name)) {
                  obj1[name] = obj2[name];
              }
          }
          return obj1;
      },
      getErrorInfo: function getErrorInfo(ex) {
          if (typeof ex.stack === 'undefined' || !ex.stack) {
              return {

                  'msg': ex.name + ':' + ex.message,
                  'level': 4
              };
          } else {
              var chrome = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
                  gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i,
                  winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i,


              // Used to additionally parse URL/line/column from eval frames
              geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
                  chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/,
                  lines = ex.stack.split('\n'),
                  stack = [],
                  submatch,
                  parts,
                  element,
                  reference = /^(.*) is undefined$/.exec(ex.message);
              if (parts = chrome.exec(lines[1])) {
                  var isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
                  var isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
                  if (isEval && (submatch = chromeEval.exec(parts[2]))) {
                      // throw out eval line/column and use top-most line/column number
                      parts[2] = submatch[1]; // url
                      parts[3] = submatch[2]; // line
                      parts[4] = submatch[3]; // column
                  }
                  element = {
                      'url': !isNative ? parts[2] : null,
                      'line': parts[3] ? +parts[3] : null,
                      'column': parts[4] ? +parts[4] : null
                  };
              } else if (parts = winjs.exec(lines[1])) {
                  element = {
                      'url': parts[2],
                      'line': +parts[3],
                      'column': parts[4] ? +parts[4] : null
                  };
              } else if (parts = gecko.exec(lines[1])) {
                  var isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
                  if (isEval && (submatch = geckoEval.exec(parts[3]))) {
                      // throw out eval line/column and use top-most line number
                      parts[3] = submatch[1];
                      parts[4] = submatch[2];
                      parts[5] = null; // no column when eval
                  } else if (i === 0 && !parts[5] && typeof ex.columnNumber !== 'undefined') {
                      // FireFox uses this awesome columnNumber property for its top frame
                      // Also note, Firefox's column number is 0-based and everything else expects 1-based,
                      // so adding 1
                      // NOTE: this hack doesn't work if top-most frame is eval
                      stack[0].column = ex.columnNumber + 1;
                  }
                  element = {
                      'url': parts[3],
                      'line': parts[4] ? +parts[4] : null,
                      'column': parts[5] ? +parts[5] : null
                  };
              }

              return {
                  'msg': ex.name + ':' + ex.message,
                  'rowNum': element.line,
                  'colNum': element.column,
                  'targetUrl': element.url,
                  'level': 4
              };
          }
      }
  };

  var Config = function () {
      function Config(options) {
          classCallCheck(this, Config);

          this.config = {
              proxyAll: false,
              mergeReport: true, // mergeReport 是否合并上报， false 关闭， true 启动（默认）
              delay: 1000, // 当 mergeReport 为 true 可用，延迟多少毫秒，合并缓冲区中的上报（默认）
              url: "http://127.0.0.1", // 指定错误上报地址
              except: [/^Script error\.?/, /^Javascript error: Script error\.? on line 0/], // 忽略某个错误
              random: 1, // 抽样上报，1~0 之间数值，1为100%上报（默认 1）
              repeat: 5, // 重复上报次数(对于同一个错误超过多少次不上报)
              errorLSSign: 'mx-error', // error错误数自增 0
              maxErrorCookieNo: 20, // error错误数自增 最大的错
              validTime: 7
          };
          this.config = utils.assignObject(this.config, options);
      }

      createClass(Config, [{
          key: 'get',
          value: function get$$1(name) {
              return this.config[name];
          }
      }, {
          key: 'set',
          value: function set$$1(name, value) {
              this.config[name] = value;
              return this.config[name];
          }
      }]);
      return Config;
  }();

  /**
   * @author suman
   * @fileoverview localStorage
   * @date 2017/02/16
   */

  var hasLocal = !!window.localStorage;

  function InertLocalFunc(funcA, funcB) {
      return hasLocal ? funcA : funcB;
  }

  function callByArgs(func, args, global) {
      return func.apply(global, args);
  }

  var storage = {
      //设置cookie内json的key名
      getKey: function getKey(errorObj) {
          var isValid = function isValid(name) {
              return errorObj[name];
          };
          return ['msg', 'colNum', 'rowNum'].filter(isValid).map(isValid).join('@');
      },
      //检查是否有效
      deleteExpiresItem: function deleteExpiresItem(data) {
          var oData = data ? utils.parse(data) : {};

          var date = +new Date();
          for (var key in oData) {
              if (oData[key].expiresTime <= date) {
                  delete oData[key];
              }
          }
          return oData;
      },
      //设置失效时间
      getEpires: function getEpires(validTime) {
          return +new Date() + 1000 * 60 * 60 * 24 * validTime;
      },
      limitError: function limitError(source, number) {
          var keys = Object.keys(source);
          if (keys.length >= number) {
              delete source[keys[0]];
          }
          return source;
      },
      //获取cookie/localStorage内容体
      setInfo: function setInfo(key, errorObj, validTime, max) {
          var source = storage.getItem(key);
          if (errorObj) {
              var name = storage.getKey(errorObj);
              source = this.limitError(source, max);
              source[name] = {
                  expiresTime: storage.getEpires(validTime),
                  value: errorObj.msg
              };
          }
          return utils.stringify(source);
      },
      //设置cookie/localStorage
      setItem: InertLocalFunc(function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
          }

          localStorage.setItem(args[0], callByArgs(storage.setInfo, args, storage));
      }, function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
          }

          utils.addCookie(args[0], callByArgs(storage.setInfo, args, storage));
      }),
      //获取cookie/localStorage
      getItem: InertLocalFunc(function (key) {
          return storage.deleteExpiresItem(localStorage.getItem(key));
      }, function (key) {
          return storage.deleteExpiresItem(utils.getCookie(key));
      }),
      //清除cookie/localStorage
      clear: InertLocalFunc(function (key) {
          return key ? localStorage.removeItem(key) : localStorage.clear();
      }, function (key) {
          return key ? utils.clearCookie(key) : document.cookie.split('; ').forEach(utils.clearCookie);
      })
  };

  var Localstroage = function Localstroage(supperclass) {
      return function (_supperclass) {
          inherits(_class, _supperclass);

          function _class(options) {
              classCallCheck(this, _class);

              var _this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, options));

              _this.setItem();
              return _this;
          }
          //得到元素值 获取元素值 若不存在则返回''


          createClass(_class, [{
              key: 'getItem',
              value: function getItem(key) {
                  return storage.getItem(key);
              }
              // 设置一条localstorage或cookie

          }, {
              key: 'setItem',
              value: function setItem(errorObj) {
                  var _config = this.config;
                  storage.setItem(this.config.errorLSSign, errorObj, _config.validTime, _config.maxErrorCookieNo);
                  return utils.stringify(errorObj);
              }

              //清除ls/cookie 不传参数全部清空  传参之清当前ls/cookie

          }, {
              key: 'clear',
              value: function clear(key) {
                  storage.clear(key);
              }
          }]);
          return _class;
      }(supperclass);
  };

  /**
   * 事件管理器
   */
  var Events = function Events(supperclass) {
    return function (_supperclass) {
      inherits(_class, _supperclass);

      function _class(options) {
        classCallCheck(this, _class);

        var _this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, options));

        _this.handlers = {};
        return _this;
      }
      /**
       * 事件注册
       * @param {*} event 事件名字
       * @param {*} handlers 执行函数
       */


      createClass(_class, [{
        key: "on",
        value: function on(event, handlers) {
          this.handlers[event] = this.handlers[event] || [];
          this.handlers[event].push(handler);
          return this.handlers[event];
        }
        /**
         * 事件注销
         * @param {*} event 事件名字
         */

      }, {
        key: "off",
        value: function off(event) {
          if (this.handlers[event]) {
            delete this.handlers[event];
          }
        }
        /**
         * 触发事件
         * @param {*} event 事件名字
         * @param {*} args 执行参数
         */

      }, {
        key: "trigger",
        value: function trigger(event, args) {
          var _this2 = this;

          var arg = args || [];
          var funcs = this.handlers[event];
          if (funcs) {
            return funcs.every(function (f) {
              var ret = f.apply(_this2, arg);
              return ret === false ? false : true;
            });
          }
          return true;
        }
      }]);
      return _class;
    }(supperclass);
  };

  var Report = function Report(supperclass) {
    return function (_supperclass) {
      inherits(_class, _supperclass);

      function _class(options) {
        classCallCheck(this, _class);

        var _this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, options));

        _this.errorQueue = [];
        _this.repeatList = {};
        _this.url = _this.config.url + "?err_msg=";
        ["log", "debug", "info", "warn", "error"].forEach(function (type, index) {
          _this[type] = function (msg) {
            return _this.handleMsg(msg, type, index);
          };
        });
        return _this;
      }
      // 重复出现的错误，只上报config.repeat次


      createClass(_class, [{
        key: "repeat",
        value: function repeat(error) {
          var rowNum = error.rowNum || "";
          var colNum = error.colNum || "";
          var repeatName = error.msg + rowNum + colNum;
          this.repeatList[repeatName] = this.repeatList[repeatName] ? this.repeatList[repeatName] + 1 : 1;
          return this.repeatList[repeatName] > this.config.repeat;
        }
        // 忽略错误

      }, {
        key: "except",
        value: function except(error) {
          var oExcept = this.config.except;
          var result = false;
          var v = null;
          if (utils.typeDecide(oExcept, "Array")) {
            for (var i = 0, len = oExcept.length; i < len; i++) {
              v = oExcept[i];
              if (utils.typeDecide(v, "RegExp") && v.test(error.msg) || utils.typeDecide(v, "Function") && v(error, error.msg)) {
                result = true;
                break;
              }
            }
          }
          return result;
        }
        // 请求服务端

      }, {
        key: "request",
        value: function request(url, cb) {
          var img = new window.Image();
          img.onload = cb;
          img.src = url;
        }
      }, {
        key: "report",
        value: function report(cb) {
          var _this2 = this;

          var mergeReport = this.config.mergeReport;
          if (this.errorQueue.length === 0) return this.url;
          var curQueue = mergeReport ? this.errorQueue : [this.errorQueue.shift()];
          if (mergeReport) this.errorQueue = [];
          // 合并上报
          var parames = curQueue.map(function (obj) {
            _this2.setItem(obj);
            return utils.serializeObj(obj);
          }).join("|");
          var url = this.url + parames;
          this.request(url, function () {
            if (cb) {
              cb.call(_this2);
            }
            _this2.trigger("afterReport");
          });
          return url;
        }
      }, {
        key: "report",
        value: function report(cb) {
          var mergeReport = this.config.mergeReport;
          if (this.errorQueue.length === 0) return this.url;
          var curQueue = mergeReport ? this.errorQueue : [this.errorQueue.shift()];
        }
        // 发送

      }, {
        key: "send",
        value: function send(cb) {
          var _this3 = this;

          if (!this.trigger("beforeReport")) return;
          var callback = cb || utils.noop;
          var delay = this.config.mergeReport ? this.config.delay : 0;

          setTimeout(function () {
            _this3.report(callback);
          }, delay);
        }
        // push错误到pool

      }, {
        key: "catchError",
        value: function catchError(error) {
          var rnd = Math.random();
          if (rnd >= this.config.random) {
            return false;
          }
          if (this.repeat(error)) {
            return false;
          }
          if (this.except(error)) {
            return false;
          }
          this.errorQueue.push(error);
          return this.errorQueue;
        }
        // 手动上报

      }, {
        key: "handleMsg",
        value: function handleMsg(msg, type, level) {
          if (!msg) {
            return false;
          }
          if (utils.typeDecide(msg, "Object") && !msg.msg) {
            return false;
          }

          if (utils.typeDecide(msg, "Error")) {
            msg = {
              msg: msg.message,
              ext: {
                stack: msg.stack
              }
            };
          }

          var errorMsg = utils.typeDecide(msg, "Object") ? msg : {
            msg: msg,
            level: level
          };
          errorMsg = utils.assignObject(utils.getSystemParams(), errorMsg);
          if (this.catchError(errorMsg)) {
            this.send();
          }
          return errorMsg;
        }
      }]);
      return _class;
    }(supperclass);
  };

  var XbossDebug = function (_events) {
    inherits(XbossDebug, _events);

    function XbossDebug(options) {
      classCallCheck(this, XbossDebug);

      var _this = possibleConstructorReturn(this, (XbossDebug.__proto__ || Object.getPrototypeOf(XbossDebug)).call(this, options));

      _this._storeClickedDom = function (ele) {
        var target = ele.target ? ele.target : ele.srcElement;
        var info = {
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
            var i = 0,
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
              var outerHTML = parent.outerHTML.replace(/>\s+</g, "><"); // 去除空白字符
              outerHTML && outerHTML.length > 200 && (outerHTML = outerHTML.slice(0, 200));
              info.outerHTML = outerHTML;
            }
          }
          // 加入浏览历史，只记录10条
          _this.breadcrumbs.push(info);
          _this.breadcrumbs.length > 10 && _this.breadcrumbs.shift();
        }
      };

      _this.breadcrumbs = [];
      _this.rewriteError();
      _this.rewritePromiseError();
      _this.catchClickQueue(); // 用于收集用户操作路径
      return _this;
    }
    // 由于有些浏览器onError的时候信息不一致，为了兼容不同浏览器，重写onError方法，如果没有错误信息，获取调用栈自行组装


    createClass(XbossDebug, [{
      key: "rewriteError",
      value: function rewriteError() {
        var _this2 = this,
            _arguments = arguments;

        var defaultOnerror = window.onerror || utils.noop;
        window.onerror = function (msg, url, line, col, error) {
          // 有些浏览器没有col信息
          col = col || window.event && window.event.errorCharacter || 0;
          // 为什么要这样子
          if (!_this2.trigger("error", utils.toArray(_arguments))) {
            return false;
          }
          // 组装错误信息
          var reportMsg = msg;
          if (error && error.stack) {
            reportMsg = _this2.handleErrorStack(error);
          } else {
            // arguments.callee.caller为获取调用栈信息
            reportMsg = _this2._fixMsgByCaller(reportMsg, _arguments.callee.caller);
          }
          if (utils.typeDecide(reportMsg, "Event")) {
            reportMsg += reportMsg.type ? "--" + reportMsg.type + "--" + (reportMsg.target ? reportMsg.target.tagName + "::" + reportMsg.target.src : "") : "";
          }
          if (reportMsg) {
            // TODO errror 方法是在哪里定义的
            _this2.error({
              msg: reportMsg,
              rowNum: line,
              colNum: col,
              targetUrl: url,
              level: 4,
              breadcrumbs: JSON.stringify(_this2.breadcrumbs)
            });
          }

          // 调用默认的错误对象
          defaultOnerror.call(null, msg, url, line, col, error);
        };
      }
    }, {
      key: "rewritePromiseError",
      value: function rewritePromiseError() {
        var _this3 = this,
            _arguments2 = arguments;

        var defaultUnhandleRejection = window.onunhandledrejection || utils.noop;
        window.onunhandledrejection = function (error) {
          if (!_this3.trigger("error", utils.toArray(_arguments2))) {
            return false;
          }
          var msg = error.reason && error.reason.message || "";
          var stackObj = {};
          if (error.reason && error.reason.stack) {
            msg = _this3.handleErrorStack(error.reason);
            stackObj = _this3._parseErrorStack(error.reason.stack);
          } else {
            msg = _this3._fixMsgByCaller(msg, _arguments2.callee.caller);
          }
          if (msg) {
            _this3.error({
              msg: msg,
              rowNum: stackObj.line || 0,
              colNum: stackObj.col || 0,
              targetUrl: stackObj.targetUrl || "",
              level: 4,
              breadcrumbs: JSON.stringify(_this3.breadcrumbs)
            });
          }
          defaultUnhandledRejection.call(null, error);
        };
      }
      // 处理onerror返回的error.stack

    }, {
      key: "handleErrorStack",
      value: function handleErrorStack(error) {
        var stackMsg = error.stack;
        var errorMsg = error.toString();
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

    }, {
      key: "_fixMsgByCaller",
      value: function _fixMsgByCaller(msg, caller) {
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

    }, {
      key: "_parseErrorStack",
      value: function _parseErrorStack(stack) {
        var stackObj = {};
        var stackArr = stack.split("at");
        // 只取第一个堆栈信息，获取包含url、line、col的部分，如果有括号，去除最后的括号
        var info = stackArr[1].match(/http.*/)[0].replace(/\)$/, "");
        // 以冒号拆分
        var errorInfoArr = info.split(":");
        var len = errorInfoArr.length;
        // 行号、列号在最后位置
        stackObj.col = errorInfoArr[len - 1];
        stackObj.line = errorInfoArr[len - 2];
        // 删除最后两个（行号、列号）
        errorInfoArr.splice(len - 2, 2);
        stackObj.targetUrl = errorInfoArr.join(":");
        return stackObj;
      }
      // 监听点击事件，记录用户操作路径

    }, {
      key: "catchClickQueue",
      value: function catchClickQueue() {
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
    }]);
    return XbossDebug;
  }(Events(Localstroage(Report(Config))));

  return XbossDebug;

})));
