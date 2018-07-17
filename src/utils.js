// if condition is false, throw message 
export function invariant(condition, message) {
  if (condition) return;
  throw new Error(message);
}

// log
export function log(...args) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  };
}

// catch error
export function catchError(fn) {
  return function(...args) {
    try {
      return fn.bind(this)(...args);
    } catch (e) {
      console.log('uncaught exception:', e);
      throw e;
    }
  }
}