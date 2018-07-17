import { Observable } from 'rxjs';
import { concatMap, mergeMap, switchMap } from 'rxjs/operators';

// bind promise with observer
export function observePromise(promise, observer) {
  promise.then(
    (data) => {
      observer.next(data);
      observer.complete();
    },
    (error) => {
      observer.error(error);
      observer.complete();
    }
  );
}

// bind value with observer
export function observeValue(value, observer) {
  observer.next(value);
  observer.complete();
}

// convert source to observable
export function sourceToObservable(fn, res) {
  return Observable.create((observer) => {
    return fn(res, observer);
  });
}

// concatMap source to flow
export function concatMapSource(source) {
  return (input) => {
    return input.pipe(
      concatMap((data) => sourceToObservable(source, data))
    );
  };
}

// mergeMap source to flow
export function mergeMapSource(source) {
  return (input) => {
    return input.pipe(
      mergeMap((data) => sourceToObservable(source, data))
    );
  };
}

// switchMap source to flow
export function switchMapSource(source) {
  return (input) => {
    return input.pipe(
      switchMap((data) => sourceToObservable(source, data))
    );
  };
}