(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.XbossDebug = factory());
}(this, (function () { 'use strict';

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

  var XbossDebug = function () {
    function XbossDebug(options) {
      classCallCheck(this, XbossDebug);
    }
    // 由于有些浏览器onError的时候信息不一致，为了兼容不同浏览器，重写onError方法，如果没有错误信息，获取调用栈自行组装


    createClass(XbossDebug, [{
      key: "rewriteError",
      value: function rewriteError() {
        window.onError = function (msg, url, line, col, error) {
          // 有些浏览器没有col信息
          col = col || window.event && window.event.errorCharacter || 0;
        };
      }
    }]);
    return XbossDebug;
  }();

  return XbossDebug;

})));
