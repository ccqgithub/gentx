import { map } from 'rxjs/operators';

export function testFlow(input) {
  return input.pipe(
    map(v => `${v}-test`)
  );
}