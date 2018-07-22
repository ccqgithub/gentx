import { of } from 'rxjs';
import { srcFlows, guardFlows } from '../flowGroups/all';
import { testFlow } from '../flows/test';

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

    const testFlowOb = testFlow(ob);
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

    const syncOb = srcFlows.sync(ob);
    it('sync', async () => {
      let promise = new Promise((resolve, reject) => {
        syncOb.subscribe({
          next(v) { resolve({ rst: v }) }
        })
      });
      await expect(promise)
        .resolves
        .toHaveProperty('rst', 'hello-sync'); 
    });

    const promiseOb = srcFlows.promise(ob);
    it('promise', async () => {
      let promise = new Promise((resolve, reject) => {
        promiseOb.subscribe({
          next(v) { resolve({ rst: v }) }
        })
      });
      await expect(promise)
        .resolves
        .toHaveProperty('rst', 'hello-promise'); 
    });

    const observableOb = srcFlows.observable(ob);
    it('observable', async () => {
      let promise = new Promise((resolve, reject) => {
        observableOb.subscribe({
          next(v) { resolve({ rst: v }) }
        })
      });
      await expect(promise)
        .resolves
        .toHaveProperty('rst', 'hello-observable'); 
    });

    const cancelOb = srcFlows.cancel(ob);
    it('cancel', async () => {
      let promise = new Promise((resolve, reject) => {
        let subscription = cancelOb.subscribe({
          next(v) { resolve({ rst: v }) }
        });
        subscription.unsubscribe();

        setTimeout(() => {
          reject(new Error('canceled'));
        }, 2000);
      });
      await expect(promise)
        .rejects
        .toHaveProperty('message', 'canceled'); 
    });

    const cancelOb2 = srcFlows.cancel(ob);
    it('not cancel', async () => {
      let promise = new Promise((resolve, reject) => {
        cancelOb2.subscribe({
          next(v) { resolve({ rst: v }) }
        });
      });
      await expect(promise)
        .resolves
        .toHaveProperty('rst', 'hello-cancel'); 
    });

    const errorOb = srcFlows.error(ob);
    it('error', async () => {
      let promise = new Promise((resolve, reject) => {
        errorOb.subscribe({
          error(v) { reject(new Error(v)) }
        })
      });
      await expect(promise)
        .rejects
        .toHaveProperty('message', 'hello-error'); 
    });

    const guardOb = guardFlows.test(ob);
    it('guard', async () => {
      let promise = new Promise((resolve, reject) => {
        guardOb.subscribe({
          next(v) { resolve({ rst: v }) }
        })
      });
      await expect(promise)
        .resolves
        .toHaveProperty('rst', 'hello-guard-before-guard.test-test-guard-after-guard.test'); 
    });

  },
  timeout
);