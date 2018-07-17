import fs from 'fs';
import path from 'path';
import { testFlows } from '../flowGroups/test';
import { of } from 'rxjs';
import { logMiddleware } from '../flows/middleware';

const timeout = 5000;
const copy = (data) => {
  return JSON.parse(JSON.stringify(data));
}

describe(
  'GentData Test',
  () => {
   
    beforeAll(async () => {
      //
    }, timeout);

    const ob = of('hello');

    const testFlowOb = testFlows.flow('test')(ob);
    it('testFlow', async () => {
      let promise = new Promise((resolve, reject) => {
        testFlowOb.subscribe({
          next(v) { resolve({ rst: v }) }
        })
      });
      await expect(promise)
        .resolves
        .toHaveProperty('rst', 'hello-test'); 
    });

    const syncOb = testFlows.flow('source.sync')(testFlowOb);
    it('sync', async () => {
      let promise = new Promise((resolve, reject) => {
        syncOb.subscribe({
          next(v) { resolve({ rst: v }) }
        })
      });
      await expect(promise)
        .resolves
        .toHaveProperty('rst', 'hello-test-sync'); 
    });

    const promiseOb = testFlows.flow('source.promise')(syncOb);
    it('promise', async () => {
      let promise = new Promise((resolve, reject) => {
        promiseOb.subscribe({
          next(v) { resolve({ rst: v }) }
        })
      });
      await expect(promise)
        .resolves
        .toHaveProperty('rst', 'hello-test-sync-promise'); 
    });

    const observableOb = testFlows.flow('source.observable')(promiseOb);
    it('observable', async () => {
      let promise = new Promise((resolve, reject) => {
        observableOb.subscribe({
          next(v) { resolve({ rst: v }) }
        })
      });
      await expect(promise)
        .resolves
        .toHaveProperty('rst', 'hello-test-sync-promise-observable'); 
    });

    const cancelOb = testFlows.flow('source.cancel')(observableOb);
    it('cancel', async () => {
      let promise = new Promise((resolve, reject) => {
        let subscription = cancelOb.subscribe({
          next(v) { resolve({ rst: v }) }
        });
        subscription.unsubscribe();

        setTimeout(() => {
          reject(new Error('canceled'));
        }, 1000);
      });
      await expect(promise)
        .rejects
        .toHaveProperty('message', 'canceled'); 
    });

    const errorOb = testFlows.flow('source.error')(cancelOb);
    it('error', async () => {
      let promise = new Promise((resolve, reject) => {
        errorOb.subscribe({
          error(v) { reject(new Error(v)) }
        })
      });
      await expect(promise)
        .rejects
        .toHaveProperty('message', 'hello-test-sync-promise-observable-cancel-error'); 
    });

    testFlows.setBeforeMiddlewares([logMiddleware]);
    testFlows.setAfterMiddlewares([logMiddleware]);
    const middlewareOb = testFlows.flow('test')(cancelOb);
    it('middleware', async () => {
      let promise = new Promise((resolve, reject) => {
        middlewareOb.subscribe({
          next(v) { resolve({ rst: v }) }
        })
      });
      let middlewareBeforeMsg = `-middleware-before-group.test`;
      let middlewareAfterMsg = `-middleware-after-group.test`;
      await expect(promise)
        .resolves
        .toHaveProperty('rst', `hello-test-sync-promise-observable-cancel${middlewareBeforeMsg}-test${middlewareAfterMsg}`); 
    });

  },
  timeout
);