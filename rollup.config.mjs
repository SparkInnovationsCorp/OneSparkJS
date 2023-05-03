import { uglify } from "rollup-plugin-uglify";

export default {
  input: 'src/_1sparkjs.js',
  output: {
    file: 'dist/1sparkjs.min.js',
    format: 'esm',
  },
  plugins: [
    uglify(),
  ],
};