const babel = require('rollup-plugin-babel');

let pkg = require('./package.json');
let external = [
  'rxjs',
  'rxjs/operators'
];

// external dependencies
external = external.concat(Object.keys(pkg.dependencies || {}));
// external peer dependencies
external = external.concat(Object.keys(pkg.peerDependencies || {}));

let plugins = [
  babel({
    babelrc: false,
    exclude: ['node_modules/**/*'],
    "presets": [
      ["@babel/preset-env", {
        "modules": false
      }]
    ]
  })
];

let config = {
  input: 'index.js',
  plugins: plugins,
  external: external,
  output: [
    {
      file: 'dist/gentx.common.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/gentx.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/gentx.umd.js',
      format: 'umd',
      name: 'GentX',
      sourcemap: true
    }
  ]
}

export default config;
