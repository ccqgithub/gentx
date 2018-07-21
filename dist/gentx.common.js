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

function logMiddleware(input) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var flow = opts.flow,
      flowGroup = opts.flowGroup,
      middleware = opts.middleware;

  var typeMsg = { before: 'in', after: 'out' }[middleware];

  // not use as a middleware
  if (!middleware) return input;

  return input.pipe(operators.map(function (value) {
    var logData = void 0;

    try {
      logData = JSON.parse(JSON.stringify(value));
    } catch (e) {
      logData = e.message;
    }

    log('[gentx log] ~ flow ' + typeMsg + ' <' + flowGroup + '>.<' + flow + '>:', logData);

    return value;
  }));
}

// create observable from a `observable input` and a `cancel function`
function makeObservable(input, cancel) {
  var observable = rxjs.from(input);
  return rxjs.Observable.create(function (observer) {
    var unsub = observable.subscribe(observer);
    return function unsubscribe() {
      cancel();
      unsub();
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

// create a flow
function flow(flowFn, _ref) {
  var _ref$groupName = _ref.groupName,
      groupName = _ref$groupName === undefined ? '' : _ref$groupName,
      _ref$name = _ref.name,
      name = _ref$name === undefined ? '' : _ref$name,
      _ref$beforeMiddleware = _ref.beforeMiddlewares,
      beforeMiddlewares = _ref$beforeMiddleware === undefined ? [] : _ref$beforeMiddleware,
      _ref$afterMiddlewares = _ref.afterMiddlewares,
      afterMiddlewares = _ref$afterMiddlewares === undefined ? [] : _ref$afterMiddlewares;

  var flowName = name || flowFn.name || 'Anonymous';

  // before middlewares
  var befores = beforeMiddlewares.map(function (middleware) {
    return function (input) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return middleware(input, _extends({ middleware: 'before' }, opts));
    };
  });

  // after middlewares
  var afters = afterMiddlewares.map(function (middleware) {
    return function (input) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return middleware(input, _extends({ middleware: 'after' }, opts));
    };
  });
  // concat middlewares with flow
  var fns = befores.concat(flowFn).concat(afters);

  // generate flow
  var flow = function flow(input) {
    var opts = {
      flow: flowName,
      flowGroup: groupName
    };
    return fns.reduce(function (prev, currFn) {
      return currFn(prev, opts);
    }, input);
  };

  return flow;
}

// create a group flows
function flowGroup() {
  var flowMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var groupName = opts.name || 'Anonymous';
  var flows = {};

  Object.keys(flowMap).forEach(function (key) {
    flows[key] = flow(flowMap[key], _extends({}, opts, {
      groupName: groupName,
      name: key
    }));
  });

  return flows;
}

// create flow from source
function flowSource(source) {
  var operatorType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'concatMap';
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var flowName = opts.name || source.name || 'Anonymous';
  var operator = {
    'concatMap': concatMapSource,
    'mergeMap': mergeMapSource,
    'switchMap': switchMapSource
  }[operatorType];

  if (!operator) {
    throw new Error('[gentx error] operatorType must in [\'concatMap\', \'mergeMap\', \'switchMap\'], but get <' + operatorType + '> when flowSource <' + flowName + '>.');
  }

  return flow(operator(source), _extends({}, opts, { name: flowName }));
}

// crate a flow group from sources
function flowGroupSources(sourceMap) {
  var _this = this;

  var operatorType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'concatMap';
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var groupName = opts.groupName || 'Anonymous';
  var flows = {};

  Object.keys(sourceMap).forEach(function (key) {
    flows[name] = _this.flowSource(sourceMap[key], operatorType, _extends({}, opts, {
      groupName: groupName,
      name: key
    }));
  });

  return flows;
}

exports.catchError = catchError;
exports.logMiddleware = logMiddleware;
exports.makeObservable = makeObservable;
exports.flow = flow;
exports.flowGroup = flowGroup;
exports.flowSource = flowSource;
exports.flowGroupSources = flowGroupSources;
//# sourceMappingURL=gentx.common.js.map
