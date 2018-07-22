import { map } from 'rxjs/operators';

export function logGuard(input, opts={}) {
  let {groupName, flowName, guardType} = opts;

  return input.pipe(
    map(value => {
      return `${value}-guard-${guardType}-${groupName}.${flowName}`
    })
  );
}
