import { uglify } from "rollup-plugin-uglify";
import obfuscator from 'rollup-plugin-obfuscator';


export default {
  input: 'src/_1sparkjs.js',
  output: {
    file: 'dist/1sparkjs.min.js',
    format: 'esm',
    banner: `/**
 * OneSparkJS JavaScript Game Engine
 * Version 1.0.0.0
 * Created by Jason Bramble
 * Copyright (c) 2023 Spark Innovations Corp
 * Licensed under the OneSparkJS License Agreement
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to use, copy, modify, and distribute the Software
 * in non-commercial projects subject to the following conditions:
 *
 * - The above copyright notice and this permission notice shall be included in all copies or substantial
 *   portions of the Software.
 * - Credit shall be given to "OneSparkJS by Spark Innovations Corp" in any accompanying documentation or README file.
 *
 * Permission is also granted to use, copy, modify, and distribute the Software in commercial or revenue-generating
 * projects with the explicit permission of Spark Innovations Corp. To request permission, please contact us
 * at support@sparkinnovationscorp.com.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */`
  },
  plugins: [
  /*
     commented out for debuging
    uglify({ 
        mangle: true,
        output: {
          comments: /OneSparkJS JavaScript Game Engine/,
        }
      }),
	obfuscator({
		options: {}
	})
  */
  ],
};