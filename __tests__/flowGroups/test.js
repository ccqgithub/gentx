import { FlowGroup } from '../../index';
import { logMiddleware } from '../flows/middleware';
import { testFlow } from '../flows/test';
import * as TestSoureces from '../sources/test';

const testFlows = new FlowGroup({
  name: 'group'
});

testFlows.addFlow(testFlow, 'test');

testFlows.addSources(TestSoureces, 'source');

export { testFlows };