'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var operators = require('rxjs/operators');
var rxjs = require('rxjs');

// if condition is false, throw message 
function invariant(condition, message) {
  if (condition) return;
  throw new Error(message);
}

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
  var groupName = opts.groupName,
      flowName = opts.flowName,
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

    log('gent-data log ~ flow ' + typeMsg + ' <' + groupName + '>.<' + flowName + '>:', logData);

    return value;
  }));
}

// bind promise with observer
function observePromise(promise, observer) {
  promise.then(function (data) {
    observer.next(data);
    observer.complete();
  }, function (error) {
    observer.error(error);
    observer.complete();
  });
}

// bind value with observer
function observeValue(value, observer) {
  observer.next(value);
  observer.complete();
}

// convert source to observable
function sourceToObservable(fn, res) {
  return rxjs.Observable.create(function (observer) {
    return fn(res, observer);
  });
}

// concatMap source to flow
function concatMapSource(source) {
  return function (input) {
    return input.pipe(operators.concatMap(function (data) {
      return sourceToObservable(source, data);
    }));
  };
}

// mergeMap source to flow
function mergeMapSource(source) {
  return function (input) {
    return input.pipe(operators.mergeMap(function (data) {
      return sourceToObservable(source, data);
    }));
  };
}

// switchMap source to flow
function switchMapSource(source) {
  return function (input) {
    return input.pipe(operators.switchMap(function (data) {
      return sourceToObservable(source, data);
    }));
  };
}

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

var FlowGroup = function () {
  function FlowGroup() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$name = _ref.name,
        name = _ref$name === undefined ? 'Anonymous' : _ref$name,
        _ref$beforeMiddleware = _ref.beforeMiddlewares,
        beforeMiddlewares = _ref$beforeMiddleware === undefined ? [] : _ref$beforeMiddleware,
        _ref$afterMiddlewares = _ref.afterMiddlewares,
        afterMiddlewares = _ref$afterMiddlewares === undefined ? [] : _ref$afterMiddlewares;

    classCallCheck(this, FlowGroup);

    this._name = name;
    this._beforeMiddlewares = beforeMiddlewares;
    this._afterMiddlewares = afterMiddlewares;

    // flows map
    this._flows = {};
  }

  // add a flow to the group
  // return a new flow


  createClass(FlowGroup, [{
    key: 'addFlow',
    value: function addFlow(fn) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Anonymous";

      invariant(typeof this._flows[name] === 'undefined', 'gent-data error ~ flow<' + name + '> can\'t be duplicated in this group<' + this._name + '>!');

      // generate flow
      this._flows[name] = fn;

      return this.flow(name);
    }

    // add a flows map
    // { a: flowAFn, b: flowBFn}

  }, {
    key: 'addFlows',
    value: function addFlows() {
      var _this = this;

      var flowMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

      var flows = {};

      Object.keys(flowMap).forEach(function (key) {
        var name = context ? context + '.' + key : key;
        flows[name] = _this.addFlow(flowMap[key], name);
      });

      return flows;
    }

    // add source as flow to flowGroup

  }, {
    key: 'addSource',
    value: function addSource(source) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Anonymous";
      var operatorType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "concatMap";

      var operator = {
        'concatMap': concatMapSource,
        'mergeMap': mergeMapSource,
        'switchMap': switchMapSource
      }[operatorType];

      if (!operator) {
        throw new Error('gent-data error ~ operatorType must in [\'concatMap\', \'mergeMap\', \'switchMap\'], but get <' + operatorType + '> when addSource <' + name + '>.');
      }

      return this.addFlow(operator(source), name);
    }

    // add sources as flow to flowGroup

  }, {
    key: 'addSources',
    value: function addSources(sourceMap) {
      var _this2 = this;

      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      var operatorType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "concatMap";

      var flows = {};

      Object.keys(sourceMap).forEach(function (key) {
        var name = context ? context + '.' + key : key;
        flows[name] = _this2.addSource(sourceMap[key], name, operatorType);
      });

      return flows;
    }

    // set before middlewares

  }, {
    key: 'setBeforeMiddlewares',
    value: function setBeforeMiddlewares() {
      var middlewares = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      this._beforeMiddlewares = middlewares;
    }

    // set after middlewares

  }, {
    key: 'setAfterMiddlewares',
    value: function setAfterMiddlewares() {
      var middlewares = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      this._afterMiddlewares = middlewares;
    }

    // get flow

  }, {
    key: 'flow',
    value: function flow(name) {
      var self = this;

      invariant(typeof this._flows[name] === 'function', 'gent-data error ~ flow<' + name + '> can\'t be found in this group<' + this._name + '>!');

      var flowFn = this._flows[name];

      // add middleware opts
      var beforeMiddlewares = this._beforeMiddlewares.map(function (middleware) {
        return function (input) {
          var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          return middleware(input, _extends({ middleware: 'before' }, opts));
        };
      });

      // add middleware opts
      var afterMiddlewares = this._afterMiddlewares.map(function (middleware) {
        return function (input) {
          var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          return middleware(input, _extends({ middleware: 'after' }, opts));
        };
      });
      // concat middlewares with flow
      var fns = beforeMiddlewares.concat(flowFn).concat(afterMiddlewares);

      // generate flow
      var flow = function flow(input) {
        var opts = {
          groupName: self._name,
          flowName: name
        };
        return fns.reduce(function (prev, currFn) {
          return currFn(prev, opts);
        }, input);
      };

      return flow;
    }
  }]);
  return FlowGroup;
}();

exports.catchError = catchError;
exports.logMiddleware = logMiddleware;
exports.observePromise = observePromise;
exports.observeValue = observeValue;
exports.sourceToObservable = sourceToObservable;
exports.concatMapSource = concatMapSource;
exports.mergeMapSource = mergeMapSource;
exports.switchMapSource = switchMapSource;
exports.FlowGroup = FlowGroup;
//# sourceMappingURL=gent-data.common.js.map
