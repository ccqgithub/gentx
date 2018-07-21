import { map } from 'rxjs/operators';
import { flow } from '../../index';

export const testFlow = flow(function testFlow(input) {
  return input.pipe(
    map(v => `${v}-test`)
  );
});