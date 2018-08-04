import { flowSources, groupFlows } from '../../index';
import * as TestSoureces from '../sources/test';
import { testFlow } from '../flows/test';
import { logGuard } from '../logGuard';

export const srcFlows = groupFlows(flowSources(TestSoureces), {
  groupName: 'src'
});

export const guardFlows = groupFlows({
  test: testFlow
}, {
  groupName: 'guard',
  beforeGuards: [logGuard],
  afterGuards: [logGuard]
});