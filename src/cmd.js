/**
 * parse cmd module
 * 
 * 先在代码开始加上 var  exports={}
 * 然后在把module.exports中的 moudle. 删除
 * 导出exports 为default
 *
 */
const acorn = require('acorn')
const walk = require('acorn-walk')
const debug = require('debug')('parser/cmd')
module.exports = class {
  constructor(code) {
    this.ast = acorn.parse(code)
    debug(JSON.stringify(this.ast, null, 2))
    if (!code) { 
      throw new Error('code requireed')
    }
    this.code = code
    this.delPosition = []
  }
  parse() {
    //检查这个脚本是否为引导脚本。
    /* let realFile = this._checkIf()
    if (realFile) {
      return {
        link: realFile
      }
    } */
    const importInfo = this._parseImport()
    let exportInfo = this._parseExport()

    let code = this._delCode()
    code = `var exports={};${code}`
    return {
      importInfo,
      exportInfo,
      code
    }
  }
  //================= private ====================
  _testIf(testNode) {
    let code = `${testNode.left.raw}${testNode.operator}${testNode.right.raw}`
    debug(`test code: ${code}`)
    return eval(code)
  }
  _checkIf() {
    const that = this
    let result = false
    walk.simple(this.ast, {
      IfStatement(node) {
        if (!node.test.left || !node.test.right) {
          return
        }
        if (node.test.left.value === 'development' || node.test.left.value === 'production') {
          let requireNode = null

          if (that._testIf(node.test)) {
            requireNode = node.consequent

          }
          else {
            requireNode = node.alternate

          }
          if (requireNode) {
            walk.simple(requireNode, {
              CallExpression(node) {
                if (node.callee.name === 'require') {
                  result = node.arguments[0].value
                }
              }
            })
          }
        }
      }
    })
    return result
  }
  _delCode() {
    let code = ''
    let start = 0
    let end = 0

    const delPosition = this.delPosition.sort((a, b) => {

      if (a[0] > b[1]) {
        return 1
      }
      else {
        return -1
      }
    })
    for (const item of delPosition) {
      end = item[0]
      code += this.code.slice(start, end)
      start = item[1]
      if (item[2]) {
        code += item[2]
      }

    }
    this.delPosition = []
    code += this.code.slice(start)
    return code

  }
  _parseImport() {
    var importInfo = []
    var that = this
    walk.ancestor(this.ast, {
      CallExpression(node, ancestors) {
        if (node.callee.name !== 'require') {
          return
        }
        //取到直接上级
        let p = ancestors[ancestors.length - 2]
        //取到上级的上级
        let pp = ancestors[ancestors.length - 3]
        if (p.type === 'VariableDeclarator') {
          let { token, file } = that._parseDeclarations(pp.declarations)
          that.delPosition.push([pp.start, pp.end])
          if (!file) {
            return
          }
          importInfo.push({
            type: 'cjs',
            file,
            token
          })
        }
        if (p.type == 'AssignmentExpression') {
          throw new Error('暂时不能解析赋值，只能解析声明变量')
        }
      }

      /* VariableDeclaration(node) {
        let { token, file } = that._parseDeclarations(node.declarations)
        if (!file) {
          return
        }
        importInfo.push({
          type: 'cjs',
          file,
          token
        })
        that.delPosition.push([node.start, node.end])
      } */

    })
    return importInfo
  }
  _parseExport() {
    const that = this
    walk.simple(this.ast, {
      MemberExpression(node) {

        if (node.object.name != 'module') {
          return
        }
        if (node.property.name != 'exports') {
          return
        }
        that.delPosition.push([node.object.start, node.object.end + 1])
      }
    })
    return [{
      from: 'exports',
      to: 'default'
    }]
  }
  _parseDeclarations(declarations) {
    let token = []
    let file = null
    if (declarations.length > 1) {
      throw new Error('do not support multiple declaration in one statement');
    }
    let item = declarations[0]
    file = item.init.arguments[0].value
    if (item.id.type === 'Identifier') {
      token.push({
        from: 'default',
        to: item.id.name
      })
    }
    if (item.id.type === 'ObjectPattern') {
      for (let p of item.id.properties) {
        token.push({
          from: p.key.name,
          to: p.key.name
        })
      }
    }
    return {
      token,
      file
    }
  }
}
