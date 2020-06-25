# @duhongwei/parser #
A es6 module parser

[![Build Status](https://travis-ci.org/duhongwei/parser.svg?branch=master)](https://travis-ci.org/duhongwei/perser)
[![Coverage Status](https://coveralls.io/repos/github/duhongwei/parser/badge.svg?branch=master)](https://coveralls.io/github/duhongwei/parser?branch=master)

## examples ##

```js
const parser=require('@duhongwei/parser')
let es6Parser=new parser.Es6('import a from "a.js";let a=1;export {a};')
let {importInfo,exportInfo,code}=es6Parser.parse()
//importInfo [{key:'a.js',tokens:[{from:'default',to:'a'}] }]
//exportInfo [{from:'a',to:'a'}]
//dynamicImportInfo:[]
//code let a=1;

//dynamic Import,simply repalce 'import' with a function name
es6Parser=new parser.Es6('import("a.js")',{dynamicImportReplacer: `load`,convertKey: (key) => {return `views/${key}`}})
let {importInfo}=parser.parse()
//importInfo:[],
//exportInfo:[],
//dynamicImportInfo [{file:'a.js',tokens:[]}]
//code load("views/a.js")
```
welcome to my blog [https://www.duhongwei.site](https://www.duhongwei.site)
