import { map } from 'rxjs/operators';

export function logMiddleware(input, opts={}) {
  let {flowGroup, flow, middleware} = opts;

  return input.pipe(
    map(value => {
      return `${value}-middleware-${middleware}-${flowGroup}.${flow}`
    })
  );
}
