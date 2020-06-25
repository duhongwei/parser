
const { Es6 } = require('../index.js')
const assert = require('assert')
describe('fromEs6', () => {
  describe('parse import', () => {
    it('import css', () => {
      let code = "import 'a.css'"
      const fromEs6 = new Es6(code)
      let from = fromEs6.parse().importInfo
      let to = [{ key: 'a.css', token: [] }]
      assert.deepEqual(from, to)
    })
    it('import html', () => {
      let code = "import 'a.html'"
      const fromEs6 = new Es6(code, { convertKey: key => `abc/${key}` })
      let from = fromEs6.parse().importInfo
      let to = [{ key: 'abc/a.html', token: [] }]
      assert.deepEqual(from, to)
    })
    it('import a.js', () => {
      let code = "import 'a.js'"
      const fromEs6 = new Es6(code)
      let from = fromEs6.parse().importInfo
      let to = [{ key: 'a.js', token: [] }]
      assert.deepEqual(from, to)
    })
    it('import default', () => {
      let code = "import a from 'a.js'"
      const fromEs6 = new Es6(code)
      let from = fromEs6.parse().importInfo
      let to = [{ key: 'a.js', token: [{ from: 'default', to: 'a' }] }]
      assert.deepEqual(from, to)
    })
    it('import *', () => {
      let code = "import * as a from 'a.js'"
      const fromEs6 = new Es6(code)
      let from = fromEs6.parse().importInfo
      let to = [{ key: 'a.js', token: [{ from: '*', to: 'a' }] }]
      assert.deepEqual(from, to)
    })
    it('import named key', () => {
      let code = "import {a,b} from 'a.js'"
      const fromEs6 = new Es6(code)
      let from = fromEs6.parse().importInfo
      let to = [{ key: 'a.js', token: [{ from: 'a', to: 'a' }, { from: 'b', to: 'b' }] }]
      assert.deepEqual(from, to)
    })
    it('import named(a as b) key', () => {
      let code = "import {a as b} from 'a.js'"
      const fromEs6 = new Es6(code)
      let from = fromEs6.parse().importInfo
      let to = [{ key: 'a.js', token: [{ from: 'a', to: 'b' }] }]
      assert.deepEqual(from, to)
    })

  })
  describe('parse export default', () => {
    it('export default a digital', () => {
      const fromEs6 = new Es6("export default 1")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: '_k_0', to: 'default' }],
        code: 'var _k_0=1'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export default a class', () => {
      const fromEs6 = new Es6("export default class{}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: '_k_0', to: 'default' }],
        code: 'var _k_0=class{}'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export default a function', () => {
      const fromEs6 = new Es6("export default function(){}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: '_k_0', to: 'default' }],
        code: 'var _k_0=function(){}'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export default a variable', () => {
      const fromEs6 = new Es6("export default c")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: '_k_0', to: 'default' }],
        code: 'var _k_0=c'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
  })
  describe('parse export named', () => {
    it('export a digital', () => {
      const fromEs6 = new Es6("export var a=1")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: 'a', to: 'a' }],
        code: ' var a=1'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export a class', () => {
      const fromEs6 = new Es6("export class A{}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: 'A', to: 'A' }],
        code: ' class A{}'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export a function', () => {
      const fromEs6 = new Es6("export function a(){}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: 'a', to: 'a' }],
        code: ' function a(){}'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.deepEqual(code, to.code)
    })
    //"export c" 这种是错误的，不能直接导出一个变量,可以导出一个object
    it('export an object', () => {
      const fromEs6 = new Es6("export {a}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: 'a', to: 'a' }],
        code: ''
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export an object(a as b)', () => {
      const fromEs6 = new Es6("export {a as b}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: 'a', to: 'b' }],
        code: ''
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
  })
  describe('parse export from', () => {
    it('export named key', () => {
      const fromEs6 = new Es6("export {a} from 'a.js'")
      let { importInfo, exportInfo, code } = fromEs6.parse()
      let to = {
        importInfo: [{ key: 'a.js', token: [{ from: 'a', to: '_z_0' }] }],
        exportInfo: [{ from: '_z_0', to: 'a' }],
        code: ''
      }
      assert.deepEqual(importInfo, to.importInfo)
      assert.deepEqual(exportInfo, to.exportInfo)
      assert.equal(code, to.code)
    })
    it('export default key', () => {
      const fromEs6 = new Es6("export {default} from 'a.js'")
      let { importInfo, exportInfo, code } = fromEs6.parse()
      let to = {
        importInfo: [{ key: 'a.js', token: [{ from: 'default', to: '_z_0' }] }],
        exportInfo: [{ from: '_z_0', to: 'default' }],
        code: ''
      }
      assert.deepEqual(importInfo, to.importInfo)
      assert.deepEqual(exportInfo, to.exportInfo)
      assert.equal(code, to.code)
    })
    it('export a as b', () => {
      const fromEs6 = new Es6("export {a as b} from 'a.js'")
      let { importInfo, exportInfo, code } = fromEs6.parse()
      let to = {
        importInfo: [{ key: 'a.js', token: [{ from: 'a', to: '_z_0' }] }],
        exportInfo: [{ from: '_z_0', to: 'b' }],
        code: ''
      }
      assert.deepEqual(importInfo, to.importInfo)
      assert.deepEqual(exportInfo, to.exportInfo)
      assert.equal(code, to.code)
    })
    it('export * from,throw.', () => {
      const fromEs6 = new Es6('export * from "a.js"')
      assert.throws(() => {
        fromEs6.parse()
      })
    })
  })
  describe('parse dynamic import', () => {
    it('no replacer ,throw', () => {
      const fromEs6 = new Es6(`let a=1;import('a.js').then(()=>{});`)
      assert.throws(() => {

        fromEs6.parse()
      })

    })
    it('replace import with replacer ', () => {
      const fromEs6 = new Es6("let x=1;import('a').then(()=>{})", {
        convertKey: (key) => {
          return `views/${key}`
        },
        dynamicImportReplacer: `load`
      })
      let from = fromEs6.parse()
      let to = {
        exportInfo: [],
        importInfo: [],
        dynamicImportInfo: [{ key: 'views/a', token: [] }],
        code: `let x=1;load("views/a").then(()=>{})`
      }
      assert.deepEqual(from, to)
    })
  })
  //export * not include default
  describe('export all', () => {

    it('no exportAllCb ,trhow', () => {
      const fromEs6 = new Es6(`export * from 'a.js'`)
      assert.throws(() => {
        fromEs6.parse()
      })

    })
    it('export *', () => {
      const fromEs6 = new Es6(`export * from 'a.js'`, {
        exportAllCb(file) {
          return [{ from: 'a1', to: 'b1' }, { from: 'default', to: 'dd' }]
        }
      })
      let from = fromEs6.parse()
      let to = {
        code: '',
        importInfo: [],
        dynamicImportInfo: [],
        exportInfo: [{ from: 'a1', to: 'b1' }]
      }
      assert.deepEqual(from, to)
    })
  })
  //import b, { each} from 'a.js';
  describe('import more', () => {
    it('import b, { each} from "a.js"', () => {
      const fromEs6 = new Es6(`import b, { each} from 'a.js';`)
      let from = fromEs6.parse()
      let to = {
        code: '',
        importInfo: [{

          key: 'a.js',
          token: [
            { from: 'default', to: 'b' },
            { from: 'each', to: 'each' }
          ]
        }],
        dynamicImportInfo: [],
        exportInfo: []
      }
      assert.deepEqual(from, to)
    })
    it(`import a from 'a';import b from 'b'`, () => {
      const fromEs6 = new Es6(`import a from 'a';import b from 'b'`)
      let from = fromEs6.parse()
      let to = {
        code: '',
        importInfo: [{

          key: 'a',
          token: [
            { from: 'default', to: 'a' }
          ]
        },
        {

          key: 'b',
          token: [
            { from: 'default', to: 'b' }
          ]
        }],
        dynamicImportInfo: [],
        exportInfo: []
      }
      assert.deepEqual(from, to)
    })
  })

})
