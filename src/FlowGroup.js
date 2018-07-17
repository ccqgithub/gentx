import { invariant } from './utils';
import { 
  concatMapSource,
  mergeMapSource,
  switchMapSource
} from './source';

export class FlowGroup {
  constructor({
    name = 'Anonymous',
    beforeMiddlewares = [],
    afterMiddlewares = []
  } = {}) {
    this._name = name;
    this._beforeMiddlewares = beforeMiddlewares;
    this._afterMiddlewares = afterMiddlewares;

    // flows map
    this._flows = {};
  }

  // add a flow to the group
  // return a new flow
  addFlow(fn, name="Anonymous") {
    invariant(
      typeof this._flows[name] === 'undefined',
      `gent-data error ~ flow<${name}> can't be duplicated in this group<${this._name}>!`
    );

    // generate flow
    this._flows[name] = fn;

    return this.flow(name);
  }

  // add a flows map
  // { a: flowAFn, b: flowBFn}
  addFlows(flowMap={}, context="") {
    const flows = {};

    Object.keys(flowMap).forEach(key => {
      const name = context ? `${context}.${key}` : key;
      flows[name] = this.addFlow(flowMap[key], name);
    });

    return flows;
  }

  // add source as flow to flowGroup
  addSource(source, name="Anonymous", operatorType="concatMap") {
    let operator = {
      'concatMap': concatMapSource,
      'mergeMap': mergeMapSource,
      'switchMap': switchMapSource
    }[operatorType];

    if (!operator) {
      throw new Error(`gent-data error ~ operatorType must in ['concatMap', 'mergeMap', 'switchMap'], but get <${operatorType}> when addSource <${name}>.`)
    }

    return this.addFlow(operator(source), name);
  }

  // add sources as flow to flowGroup
  addSources(sourceMap, context="", operatorType="concatMap") {
    const flows = {};

    Object.keys(sourceMap).forEach(key => {
      const name = context ? `${context}.${key}` : key;
      flows[name] = this.addSource(sourceMap[key], name, operatorType);
    });

    return flows;
  }

  // set before middlewares
  setBeforeMiddlewares(middlewares=[]) {
    this._beforeMiddlewares = middlewares;
  }

  // set after middlewares
  setAfterMiddlewares(middlewares=[]) {
    this._afterMiddlewares = middlewares;
  }

  // get flow
  flow(name) {
    const self = this;

    invariant(
      typeof this._flows[name] === 'function',
      `gent-data error ~ flow<${name}> can't be found in this group<${this._name}>!`
    );

    const flowFn = this._flows[name];

    // add middleware opts
    const beforeMiddlewares = this._beforeMiddlewares.map(middleware => {
      return (input, opts={}) => {
        return middleware(input, { middleware: 'before', ...opts });
      }
    });

    // add middleware opts
    const afterMiddlewares = this._afterMiddlewares.map(middleware => {
      return (input, opts={}) => {
        return middleware(input, { middleware: 'after', ...opts });
      }
    });;

    // concat middlewares with flow
    const fns = beforeMiddlewares.concat(flowFn).concat(afterMiddlewares);

    // generate flow
    const flow = function flow(input) {
      const opts = {
        groupName: self._name,
        flowName: name
      };
      return fns.reduce((prev, currFn) => currFn(prev, opts), input);
    }

    return flow;
  }
}