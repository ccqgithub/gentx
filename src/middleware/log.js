import { map } from 'rxjs/operators';
import { log } from '../utils';

export function logMiddleware(input, opts={}) {
  let {groupName, flowName, middleware} = opts;
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

      log(`gent-data log ~ flow ${typeMsg} <${groupName}>.<${flowName}>:`, logData);

      return value;
    })
  );
}
