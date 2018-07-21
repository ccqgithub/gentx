import { map } from 'rxjs/operators';
import { log } from '../utils';

export function logMiddleware(input, opts={}) {
  let {flow, flowGroup, middleware} = opts;
  let typeMsg = { before: 'in', after: 'out' }[middleware];

  // not use as a middleware
  if (!middleware) return input;

  return input.pipe(
    map(value => {
      let logData;
      
      try {
        logData = JSON.parse(JSON.stringify(value));
      } catch(e) {
        logData = e.message;
      }

      log(`[gentx log] ~ flow ${typeMsg} <${flowGroup}>.<${flow}>:`, logData);

      return value;
    })
  );
}
