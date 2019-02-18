const { Cmd } = require('../index.js')
const assert = require('assert')
describe('parse common js', () => {
  describe('parse require', () => {
    it('require a from "a.js"', () => {
      let code = "const a = require('a.js')"
      const fromCmd = new Cmd(code)
      let from = fromCmd.parse().importInfo
      let to = [{ type: 'cjs', file: 'a.js', token: [{ from: 'default', to: 'a' }] }]
      assert.deepEqual(from, to)
    })
    it('require {a,b} from "a.js"', () => {
      let code = "const {a,b} = require('a.js')"
      const fromCmd = new Cmd(code)
      let from = fromCmd.parse().importInfo
      let to = [{ type: 'cjs', file: 'a.js', token: [{ from: 'a', to: 'a' }, { from: 'b', to: 'b' }] }]
      assert.deepEqual(from, to)
    })
  })
  describe('parse export', () => {
    it('module.exports', () => {
      const fromCmd = new Cmd("module.exports={a:1}")
      let { exportInfo, code } = fromCmd.parse()
      let toExportInfo = [{ from: 'exports', to: 'default' }]
      let toCode = 'var exports={};exports={a:1}'
      assert.deepEqual(exportInfo, toExportInfo)
      assert.equal(code, toCode)
    })
    it('exports', () => {
      const fromCmd = new Cmd("exports.a=1")
      let { exportInfo, code } = fromCmd.parse()
      let toExportInfo = [{ from: 'exports', to: 'default' }]
      let toCode = 'var exports={};exports.a=1'
      assert.deepEqual(exportInfo, toExportInfo)
      assert.equal(code, toCode)
    })
  })
})
