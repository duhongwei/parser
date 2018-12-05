# @hotpack/parser #
A es6 module parser

[![Build Status](https://travis-ci.org/duhongwei/hotpack.svg?branch=master)](https://travis-ci.org/duhongwei/perser)
[![Coverage Status](https://coveralls.io/repos/github/duhongwei/parser/badge.svg?branch=master)](https://coveralls.io/github/duhongwei/parser?branch=master)

## examples ##

```js
const Parser=require('@hotpack/parser')
let parser=new Parser('import a from "a.js";let a=1;export {a};')
let {importInfo,importInfo,code}=parser.parse()
//importInfo [{type:'js',file:'a.js',tokens:[{from:'default',to:'a'}] }]
//exportInfo [{from:'a',to:'a'}]
//code let a=1;

//dynamic Import,simply repalce 'import' with a function name
parser=new Parser('import("a.js")',{dynamicImportReplacer: 'load'})
let {importInfo}=parser.parse()
//importInfo [{type:'djs',file:'a.js',tokens:null}]
//code load('a.js')
```
