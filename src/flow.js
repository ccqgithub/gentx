import { concatMap, mergeMap, switchMap } from 'rxjs/operators';

// concatMap source to flow
export function concatMapSource(source) {
  return (input) => {
    return input.pipe(
      concatMap((value) => source(value))
    );
  };
}

// mergeMap source to flow
export function mergeMapSource(source) {
  return (input) => {
    return input.pipe(
      mergeMap((value) => source(value))
    );
  };
}

// switchMap source to flow
export function switchMapSource(source) {
  return (input) => {
    return input.pipe(
      switchMap((value) => source(value))
    );
  };
}

// create a flow
export function flow(flowFn, {
  groupName='',
  name='',
  beforeMiddlewares=[],
  afterMiddlewares=[]
}) {
  const flowName = name || flowFn.name || 'Anonymous';

  // before middlewares
  const befores = beforeMiddlewares.map(middleware => {
    return (input, opts={}) => {
      return middleware(input, { middleware: 'before', ...opts });
    }
  });

  // after middlewares
  const afters = afterMiddlewares.map(middleware => {
    return (input, opts={}) => {
      return middleware(input, { middleware: 'after', ...opts });
    }
  });;

  // concat middlewares with flow
  const fns = befores.concat(flowFn).concat(afters);

  // generate flow
  const flow = function flow(input) {
    const opts = {
      flow: flowName,
      flowGroup: groupName
    };
    return fns.reduce((prev, currFn) => currFn(prev, opts), input);
  }

  return flow;
}

// create a group flows
export function flowGroup(flowMap={}, opts={}) {
  const groupName = opts.name || 'Anonymous';
  const flows = {};

  Object.keys(flowMap).forEach(key => {
    flows[key] = flow(flowMap[key], {
      ...opts,
      groupName: groupName,
      name: key
    });
  });

  return flows;
}

// create flow from source
export function flowSource(source, operatorType='concatMap', opts={}) {
  let flowName = opts.name || source.name || 'Anonymous';
  let operator = {
    'concatMap': concatMapSource,
    'mergeMap': mergeMapSource,
    'switchMap': switchMapSource
  }[operatorType];

  if (!operator) {
    throw new Error(`[gentx error] operatorType must in ['concatMap', 'mergeMap', 'switchMap'], but get <${operatorType}> when flowSource <${flowName}>.`)
  }

  return flow(operator(source), { ...opts, name: flowName });
}

// crate a flow group from sources
export function flowGroupSources(sourceMap, operatorType='concatMap', opts={}) {
  const groupName = opts.groupName || 'Anonymous';
  const flows = {};

  Object.keys(sourceMap).forEach(key => {
    flows[name] = this.flowSource(sourceMap[key], operatorType, {
      ...opts,
      groupName: groupName,
      name: key
    });
  });

  return flows;
}