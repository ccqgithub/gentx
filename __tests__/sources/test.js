import { of, from, Observable } from 'rxjs';
import { makeObservable } from '../../index';

// sync transform
export function sync(res) {
  return of(`${res}-sync`);
}

// promise
export function promise(res) {
  let promise = Promise.resolve(`${res}-promise`);
  return makeObservable(promise);
}

// Observable
export function observable(res) {
  let observable = Observable.create(observer => {
    observer.next(`${res}-observable`);
  });
  return makeObservable(observable);
}

// can cancel source
export function cancel(res) {
  let timer = null;
  let promise = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      resolve(`${res}-cancel`);
    }, 2000);
  });

  return makeObservable(promise, () => {
    clearTimeout(timer);
  });
}

// error
export function error(res) {
  from(Promise.reject(`${res}-error`));
}