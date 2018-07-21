import { flowGroupSources } from '../../index';
import { logMiddleware } from '../flows/middleware';
import * as TestSoureces from '../sources/test';

export const testFlows = flowGroupSources(TestSoureces, {
  beforeMiddlewares: [logMiddleware],
  afterMiddlewares: [logMiddleware],
  groupName: 'test'
});