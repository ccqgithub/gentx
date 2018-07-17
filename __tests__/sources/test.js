import { of } from 'rxjs';
import { observePromise, observeValue } from '../../index';

// sync transform
export function sync(res, observer) {
  observeValue(`${res}-sync`, observer);
}

// promise
export function promise(res, observer) {
  let promise = Promise.resolve(`${res}-promise`);
  observePromise(promise, observer);
}

// Observable
export function observable(res, observer) {
  let observable = of(`${res}-observable`);
  return observable.subscribe(observer);
}

// can cancel source
export function cancel(res, observer) {
  let timer = null;
  let promise = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      resolve(`${res}-cancel`);
    }, 2000);
  });

  observePromise(promise, observer);

  return function cancel() {
    clearTimeout(timer);
  }
}

// error
export function error(res, observer) {
  observePromise(Promise.reject(`${res}-error`), observer);
}