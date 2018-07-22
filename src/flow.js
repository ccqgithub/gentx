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

// create a flows group
export function groupFlows(flowMap={}, opts={}) {
  const {
    groupName= 'Anonymous',
    beforeGuards= [],
    afterGuards= []
  } = opts;
  const flows = {};

  Object.keys(flowMap).forEach(key => {
    const originFlow = flowMap[key];
    // before middlewares
    const befores = beforeGuards.map(guard => {
      return (input, opts={}) => {
        return guard(input, { 
          ...opts,
          guardType: 'before',  
          flowName: key,
          groupName: groupName
        });
      }
    });
    // after middlewares
    const afters = afterGuards.map(guard => {
      return (input, opts={}) => {
        return guard(input, { 
          ...opts,
          guardType: 'after',  
          flowName: key,
          groupName: groupName
        });
      }
    });
    // concat middlewares with flow
    const fns = befores.concat(originFlow).concat(afters);
    // generate flow
    const flow = function flow(input, opts={}) {
      return fns.reduce((prev, currFn) => currFn(prev, opts), input);
    }

    flows[key] = flow;
  });

  return flows;
}

// create flow from source
export function flowSource(source, operatorType='concatMap') {
  let operator = {
    'concatMap': concatMapSource,
    'mergeMap': mergeMapSource,
    'switchMap': switchMapSource
  }[operatorType];

  if (!operator) {
    throw new Error(`[gentx error] operatorType must in ['concatMap', 'mergeMap', 'switchMap'], but get <${operatorType}> when flowSource <${source.name}>.`)
  }

  return operator(source);
}

// crate flows from sources
export function flowSources(sourceMap, operatorType='concatMap') {
  const flows = {};

  Object.keys(sourceMap).forEach(key => {
    let source = sourceMap[key];
    flows[key] = flowSource(source, operatorType);
  });

  return flows;
}