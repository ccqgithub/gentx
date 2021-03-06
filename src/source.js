import { Observable, from } from 'rxjs';

// create observable from a `observable input` and a `cancel function`
export function makeObservable(input, cancel) {
  let observable = from(input);
  return Observable.create(observer => {
    let subscription = observable.subscribe(observer);
    return function unsubscribe() {
      if (typeof cancel === 'function') cancel();
      subscription.unsubscribe();
    }
  });
}