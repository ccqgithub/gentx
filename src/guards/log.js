import { map } from 'rxjs/operators';
import { log } from '../utils';

export function logGuard(input, opts={}) {
  let {flowName, groupName, guardType} = opts;

  // not use as a middleware
  if (!guardType) return input;

  let typeMsg = { before: 'in', after: 'out' }[guardType];

  return input.pipe(
    map(value => {
      let logData;
      
      try {
        logData = JSON.parse(JSON.stringify(value));
      } catch(e) {
        logData = e.message;
      }

      log(`[gentx log] ~ flow ${typeMsg} <${groupName}>.<${flowName}>:`, logData);

      return value;
    })
  );
}
