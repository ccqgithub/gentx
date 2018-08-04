'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var operators = require('rxjs/operators');
var rxjs = require('rxjs');

// if condition is false, throw message 

// log
function log() {
  if (process.env.NODE_ENV !== 'production') {
    var _console;

    (_console = console).log.apply(_console, arguments);
  }}

// catch error
function catchError(fn) {
  return function () {
    try {
      return fn.bind(this).apply(undefined, arguments);
    } catch (e) {
      console.log('uncaught exception:', e);
      throw e;
    }
  };
}

function logGuard(input) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var flowName = opts.flowName,
      groupName = opts.groupName,
      guardType = opts.guardType;

  // not use as a middleware

  if (!guardType) return input;

  var typeMsg = { before: 'in', after: 'out' }[guardType];

  return input.pipe(operators.map(function (value) {
    var logData = void 0;

    try {
      logData = JSON.parse(JSON.stringify(value));
    } catch (e) {
      logData = e.message;
    }

    log('[gentx log] ~ flow ' + typeMsg + ' <' + groupName + '>.<' + flowName + '>:', logData);

    return value;
  }));
}

// create observable from a `observable input` and a `cancel function`
function makeObservable(input, cancel) {
  var observable = rxjs.from(input);
  return rxjs.Observable.create(function (observer) {
    var subscription = observable.subscribe(observer);
    return function unsubscribe() {
      if (typeof cancel === 'function') cancel();
      subscription.unsubscribe();
    };
  });
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

// concatMap source to flow
function concatMapSource(source) {
  return function (input) {
    return input.pipe(operators.concatMap(function (value) {
      return source(value);
    }));
  };
}

// mergeMap source to flow
function mergeMapSource(source) {
  return function (input) {
    return input.pipe(operators.mergeMap(function (value) {
      return source(value);
    }));
  };
}

// switchMap source to flow
function switchMapSource(source) {
  return function (input) {
    return input.pipe(operators.switchMap(function (value) {
      return source(value);
    }));
  };
}

// create a flows group
function groupFlows() {
  var flowMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _opts$groupName = opts.groupName,
      groupName = _opts$groupName === undefined ? 'Anonymous' : _opts$groupName,
      _opts$beforeGuards = opts.beforeGuards,
      beforeGuards = _opts$beforeGuards === undefined ? [] : _opts$beforeGuards,
      _opts$afterGuards = opts.afterGuards,
      afterGuards = _opts$afterGuards === undefined ? [] : _opts$afterGuards;

  var flows = {};

  Object.keys(flowMap).forEach(function (key) {
    var originFlow = flowMap[key];
    // before middlewares
    var befores = beforeGuards.map(function (guard) {
      return function (input) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        return guard(input, _extends({}, opts, {
          guardType: 'before',
          flowName: key,
          groupName: groupName
        }));
      };
    });
    // after middlewares
    var afters = afterGuards.map(function (guard) {
      return function (input) {
        var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        return guard(input, _extends({}, opts, {
          guardType: 'after',
          flowName: key,
          groupName: groupName
        }));
      };
    });
    // concat middlewares with flow
    var fns = befores.concat(originFlow).concat(afters);
    // generate flow
    var flow = function flow(input) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return fns.reduce(function (prev, currFn) {
        return currFn(prev, opts);
      }, input);
    };

    flows[key] = flow;
  });

  return flows;
}

// create flow from source
function flowSource(source) {
  var operatorType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'concatMap';

  var operator = {
    'concatMap': concatMapSource,
    'mergeMap': mergeMapSource,
    'switchMap': switchMapSource
  }[operatorType];

  if (!operator) {
    throw new Error('[gentx error] operatorType must in [\'concatMap\', \'mergeMap\', \'switchMap\'], but get <' + operatorType + '> when flowSource <' + source.name + '>.');
  }

  return operator(source);
}

// crate flows from sources
function flowSources(sourceMap) {
  var operatorType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'concatMap';

  var flows = {};

  Object.keys(sourceMap).forEach(function (key) {
    var source = sourceMap[key];
    flows[key] = flowSource(source, operatorType);
  });

  return flows;
}

function gentx() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var conf = {
    $bindSub: '$bindSub',
    $unsubscribe: '$unsubscribe'
  };

  function gentxDecorator(target) {
    target.prototype['_gentx_subs_'] = {};

    // bind sub
    target.prototype[conf.$bindSub] = function (sub) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'anonymous';
      var removePrevious = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      var vm = this;
      var subs = vm['_gentx_subs_'];

      // remove previous
      if (name != 'anonymous' && removePrevious) this[conf.$unsubscribe](name);

      // bind sub
      if (!subs[name]) subs[name] = [];
      subs[name].push(sub);
    };

    // unsubscribe
    target.prototype[conf.$unsubscribe] = function (ns) {
      var vm = this;
      var subs = vm['_gentx_subs_'];

      try {
        // unsubscribe one
        if (ns && subs[ns] && subs[ns].length) {
          subs[ns].forEach(function (sub) {
            if (sub && typeof sub.unsubscribe === 'function') {
              sub.unsubscribe();
            }
          });
          delete subs[ns];
          return;
        }

        // unsubscribe all
        Object.keys(subs).forEach(function (ns) {
          if (subs[ns] && subs[ns].length) {
            subs[ns].forEach(function (sub) {
              if (sub && typeof sub.unsubscribe === 'function') {
                sub.unsubscribe();
              }
            });
            delete subs[ns];
            return;
          }
        });
      } catch (e) {
        console.log(e);
      }
    };

    // componentWillUnMount
    target.prototype._gentx_componentWillUnMount_ = target.prototype.componentWillUnMount;
    target.prototype.componentWillUnMount = function () {
      this[conf.$unsubscribe]();
      this._gentx_componentWillUnMount_();
    };
  }

  // @gentx: opts is React.Component
  if (typeof opts === 'function' && _typeof(opts.prototype) === 'object') {
    return gentxDecorator(opts);
  }

  // @gentx({})
  conf = _extends({}, conf, opts);
  return gentxDecorator;
}

var VueGentX = {};

VueGentX.install = function (Vue) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$$bindSub = options.$bindSub,
      $bindSub = _options$$bindSub === undefined ? '$bindSub' : _options$$bindSub,
      _options$$unsubscribe = options.$unsubscribe,
      $unsubscribe = _options$$unsubscribe === undefined ? '$unsubscribe' : _options$$unsubscribe;

  // bind sub

  Vue.prototype[$bindSub] = function (sub) {
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'anonymous';
    var removePrevious = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    var subs = vm['_gentx_subs_'];

    // remove previous
    if (name != 'anonymous' && removePrevious) this[$unsubscribe](name);

    // bind sub
    if (!subs[name]) subs[name] = [];
    subs[name].push(sub);
  };

  // unsubscribe
  Vue.prototype[$unsubscribe] = function (ns) {
    var vm = this;
    var subs = vm['_gentx_subs_'];

    try {
      // unsubscribe one
      if (ns && subs[ns] && subs[ns].length) {
        subs[ns].forEach(function (sub) {
          if (sub && typeof sub.unsubscribe === 'function') {
            sub.unsubscribe();
          }
        });
        delete subs[ns];
        return;
      }

      // unsubscribe all
      Object.keys(subs).forEach(function (ns) {
        if (subs[ns] && subs[ns].length) {
          subs[ns].forEach(function (sub) {
            if (sub && typeof sub.unsubscribe === 'function') {
              sub.unsubscribe();
            }
          });
          delete subs[ns];
          return;
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  // mixin
  Vue.mixin({
    beforeCreate: function beforeCreate() {
      this._gentx_subs_ = {};
    },
    beforeDestroy: function beforeDestroy() {
      this[$unsubscribe]();
    }
  });
};

exports.catchError = catchError;
exports.logGuard = logGuard;
exports.makeObservable = makeObservable;
exports.groupFlows = groupFlows;
exports.flowSource = flowSource;
exports.flowSources = flowSources;
exports.gentx = gentx;
exports.VueGentX = VueGentX;
//# sourceMappingURL=gentx.common.js.map
