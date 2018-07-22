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

exports.catchError = catchError;
exports.logGuard = logGuard;
exports.makeObservable = makeObservable;
exports.groupFlows = groupFlows;
exports.flowSource = flowSource;
exports.flowSources = flowSources;
//# sourceMappingURL=gentx.common.js.map