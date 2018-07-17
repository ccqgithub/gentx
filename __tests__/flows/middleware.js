import { map } from 'rxjs/operators';

export function logMiddleware(input, opts={}) {
  let {groupName, flowName, middleware} = opts;

  return input.pipe(
    map(value => {
      return `${value}-middleware-${middleware}-${groupName}.${flowName}`
    })
  );
}
