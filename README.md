# @duhongwei/parser #
A es6 module parser

[![Build Status](https://travis-ci.org/duhongwei/parser.svg?branch=master)](https://travis-ci.org/duhongwei/perser)
[![Coverage Status](https://coveralls.io/repos/github/duhongwei/parser/badge.svg?branch=master)](https://coveralls.io/github/duhongwei/parser?branch=master)

## examples ##

```js
const parser=require('@duhongwei/parser')
let parser=new parser.Es6('import a from "a.js";let a=1;export {a};')
let {importInfo,exportInfo,code}=parser.parse()
//importInfo [{type:'js',file:'a.js',tokens:[{from:'default',to:'a'}] }]
//exportInfo [{from:'a',to:'a'}]
//code let a=1;

//dynamic Import,simply repalce 'import' with a function name
parser=new parser.Es6('import("a.js")',{dynamicImportReplacer: `load('views/a.js`})
let {importInfo}=parser.parse()
//importInfo [{type:'djs',file:'a.js',tokens:null}]
//code load('views/a.js')
```
it can also parse cmd module.

welcome to my blog [https://www.duhongwei.site](https://www.duhongwei.site)
