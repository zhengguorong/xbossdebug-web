/**
 * @author suman
 * @fileoverview report
 * @date 2017/02/15
 */


var utils = {
  typeDecide: function ( o, type ) {
      return Object.prototype.toString.call( o ) === "[object " + type + "]";
  },
  isFunction: function ( f ) {
      return utils.typeDecide( f, 'Function' );
  },
  isString: function ( f ) {
      return utils.typeDecide( f, 'String' );
  },
  serializeObj: function ( obj ) {
      let parames = '';
      Object.keys( obj ).forEach( name => {
          if ( utils.typeDecide( obj[ name ], 'Object' ) ) {
              parames += name + '=' + utils.stringify( obj[ name ] );
          } else {
              parames += name + '=' + obj[ name ] + '^';
          }
      } );
      console.log(parames);
      return encodeURIComponent( parames.substr( 0, parames.length - 1 ) );
  },
  stringify: function ( obj ) {
      if ( window.JSON && window.JSON.stringify ) {
          return JSON.stringify( obj );
      }
      var t = typeof ( obj );
      if ( t != "object" || obj === null ) {
          // simple data type
          if ( t == "string" ) obj = '"' + obj + '"';
          return String( obj );
      } else {
          // recurse array or object
          var n, v, json = [],
              arr = ( obj && obj.constructor == Array );

          // fix.
          var self = arguments.callee;

          for ( n in obj ) {
              if ( obj.hasOwnProperty( n ) ) {

                  v = obj[ n ];
                  t = typeof ( v );
                  if ( obj.hasOwnProperty( n ) ) {
                      if ( t == "string" ) v = '"' + v + '"';
                      else if ( t == "object" && v !== null )
                          // v = jQuery.stringify(v);
                          v = self( v );
                      json.push( ( arr ? "" : '"' + n + '":' ) + String( v ) );
                  }
              }
          }
          return ( arr ? "[" : "{" ) + String( json ) + ( arr ? "]" : "}" );
      }
  },
  parse: function ( str ) {
      return window.JSON && window.JSON.parse ? JSON.parse( str ) : new Function( 'return ' + str )();
  },
  getServerPort: function () {
      return window.location.port === '' ? ( window.location.protocol === 'http:' ? '80' : '443' ) : window.location.port;
  },
  getUserAgent: function () {
      return window.navigator.userAgent;
  },
  getPlatType: function () {
      try {
          document.createEvent( "TouchEvent" );
          return 'Mobile';
      } catch ( e ) {
          return 'PC';
      }
  },
  flashVer: function () {
      let f = "-";
      let n = navigator;
      let ii;
      if ( n.plugins && n.plugins.length ) {
          for ( ii = 0; ii < n.plugins.length; ii++ ) {
              if ( n.plugins[ ii ].name.indexOf( 'Shockwave Flash' ) !== -1 ) {
                  f = n.plugins[ ii ].description.split( 'Shockwave Flash ' )[ 1 ];
                  break;
              }
          }
      } else if ( window.ActiveXObject ) {
          for ( ii = 10; ii >= 2; ii-- ) {
              try {
                  var fl = new Function( "return new ActiveXObject('ShockwaveFlash.ShockwaveFlash." + ii + "');" )();
                  if ( fl ) {
                      f = ii + '.0';
                      break;
                  }
              } catch ( e ) {}
          }
      }
      return f;
  },
  // 从字符串 src 中查找 k+sp 和  e 之间的字符串，如果 k==e 且 k 只有一个，或者 e 不存在，从 k+sp 截取到字符串结束
  // abcd=1&b=1&c=3;
  // abdc=1;b=1;a=3;
  stringSplice: function ( src, k, e, sp ) {
      if ( src === "" ) {
          return "";
      }
      sp = ( sp === "" ) ? "=" : sp;
      k += sp;
      var ps = src.indexOf( k );
      if ( ps < 0 ) {
          return "";
      }
      ps += k.length;
      var pe = pe < ps ? src.length : src.indexOf( e, ps );
      return src.substring( ps, pe );
  },
  getReferer: function () {
      let ref = document.referrer.toLowerCase();
      let re = /^[^\?&#]*.swf([\?#])?/;
      // 如果页面 Referer 为空，从 URL 中获取
      if ( ( ref === "" ) || ( ref.match( re ) ) ) {
          ref = utils.stringSplice( window.location.href, "ref", "&", "" );
          if ( ref !== "" ) {
              return encodeURIComponent( ref );
          }
      }
      return encodeURIComponent( ref );
  },
  getSystemParams: function () {
      let scr = window.screen;
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
  toArray: function ( arr ) {
      return Array.prototype.slice.call( arr );
  },
  getCookie: function ( key ) {
      let cookieList = document.cookie.split( '; ' );
      let str = '';
      for ( var i = 0; i < cookieList.length; i++ ) {
          var item = cookieList[ i ].split( '=' );
          if ( item[ 0 ] == key ) {
              str = item[ 1 ];
              break;
          }
      }
      return str;
  },
  addCookie: function ( name, value, days ) {
      var times = new Date();
      times.setDate( times.getDate() + ( days || 365 ) );
      document.cookie = name + "=" + value + "; expires=" + times.toGMTString();
      return utils.getCookie( name );
  },
  noop: function () {},
  clearCookie: function ( name ) {
      utils.addCookie( name, '', -1 );
      return utils.getCookie( name );
  },
  assignObject: function ( obj1, obj2 ) {
      for ( let name in obj2 ) {
          if ( obj2.hasOwnProperty( name ) ) {
              obj1[ name ] = obj2[ name ];
          }
      }
      return obj1;
  },
  getErrorInfo: function(ex){
      if (typeof ex.stack === 'undefined' || !ex.stack) {
          return {

              'msg': ex.name + ':' + ex.message,
              'level': 4
          };
      }else{
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
          if ((parts = chrome.exec(lines[1]))) {
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
          } else if ( parts = winjs.exec(lines[1]) ) {
              element = {
                  'url': parts[2],
                  'line': +parts[3],
                  'column': parts[4] ? +parts[4] : null
              };
          } else if ((parts = gecko.exec(lines[1]))) {
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

export default utils;
