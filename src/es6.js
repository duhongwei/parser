/**
 * parse es6 module
 */
const dynamicImport = require('acorn-dynamic-import').default
const acorn = require('acorn')
const acornWalk = require('acorn-walk')

const inject = require('acorn-dynamic-import/lib/walk').default
let walk = inject(acornWalk);
let dynamicAcorn = acorn.Parser.extend(dynamicImport)

const { base } = acornWalk

base.Import = () => { }

module.exports = class {
  constructor(code, opts = {}) {
    //ast里面，raw ,value的不同为 如果是string ,raw是 "'a'",value 是 "a"
    this.ast = dynamicAcorn.parse(code, { sourceType: 'module' })

    this.dynamicImportReplacer = opts.dynamicImportReplacer
    this.dynamicImportKeyConvert = opts.dynamicImportKeyConvert

    this.exportAllCb = opts.exportAllCb
    this.code = code
    this.delPosition = []
  }
  parse() {
    const importInfo = this._parseImport()

    let exportInfo = this._parseExport()
    const mergeInfo = this._parseExportFromImport()

    const code = this._delCode()

    for (const item of mergeInfo) {
      importInfo.push({
        type: 'js',
        file: item.file,
        token: item.importToken
      })
      exportInfo = exportInfo.concat(item.exportToken)
    }
    return {
      importInfo,
      exportInfo,
      code
    }
  }
  //================= private ====================
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

    code += this.code.slice(start)
    return code

  }
  _parseImport() {
    var importInfo = []
    var that = this
    walk.simple(this.ast, {
      ImportDeclaration(node) {
        let file = node.source.value
        let type = 'js'
        let token = that._parseSpecifiers(node.specifiers)
        if (node.specifiers.length === 0) {
          if (file.endsWith('.css')) {
            type = 'css'
          }
          if (file.endsWith('.less')) {
            type = 'less'
          }
          if (file.endsWith('.ts')) {
            type = 'ts'
          }
        }
        if ((type === 'js' || type === 'ts') && token.length === 0) {
          throw new Error('no support "import module"')
        }
        importInfo.push({
          type,
          file,
          token
        })

        that.delPosition.push([node.start, node.end])
      },
      CallExpression(node) {
        if (node.callee.type === 'Import') {
          if (!that.dynamicImportReplacer) {
            throw new Error('dynamicImportReplacer required')
          }
          importInfo.push({
            type: 'djs',
            file: node.arguments[0].value,
            token: null
          })
          that.delPosition.push([node.callee.start, node.callee.end, that.dynamicImportReplacer])
          if (that.dynamicImportKeyConvert) {
            that.delPosition.push([node.arguments[0].start, node.arguments[0].end, `"${that.dynamicImportKeyConvert(node.arguments[0].value)}"`])
          }
        }
      }
    })
    return importInfo
  }
  _parseExport() {
    let exportList = []
    var getKey = (function () {
      var index = 0;
      return function () {
        return '_k_' + index++
      }
    })()
    const that = this

    walk.simple(this.ast, {
      ExportDefaultDeclaration(node) {

        let delStart = node.start
        let delEnd = node.declaration.start
        let key = getKey()
        that.delPosition.push([delStart, delEnd, `var ${key}=`])
        exportList.push({
          from: key,
          to: 'default'
        })
      },
      ExportNamedDeclaration(node) {
        let delStart = node.start
        let delEnd = node.end
        //like export var a=1
        if (node.specifiers.length === 0) {
          delEnd = delStart + 6
        }
        let result = that._parseNamedDeclarationNode(node)
        if (result) {
          that.delPosition.push([delStart, delEnd])
          exportList = exportList.concat(result)
        }
      },

      ExportAllDeclaration(node) {
        that.delPosition.push([node.start, node.end])
        if (!that.exportAllCb) {
          throw new Error('exportAllCb required！')
        }
        const thisExportInfo = that.exportAllCb(node.source.value)
        for (const item of thisExportInfo) {
          if (item.from !== 'default') {
            exportList.push(item)
          }
        }
      }
    })
    return exportList
  }
  _parseSpecifiers(specifiers) {
    let token = []
    for (const item of specifiers) {
      switch (item.type) {
        case 'ImportDefaultSpecifier':
          token = [{ from: 'default', to: item.local.name }]
          break
        case 'ImportSpecifier':
          token.push({
            from: item.imported ? item.imported.name : item.local.name,
            to: item.local.name
          })
          break;
        case 'ImportNamespaceSpecifier':
          token.push({
            from: '*',
            to: item.local.name
          })
          break;
        case 'ExportSpecifier':
          token.push({
            from: item.local.name,
            to: item.exported.name
          })
          break
        default:
          throw new Error('不支持 ' + item.type)
      }
    }
    return token
  }
  _parseNamedDeclarationNode(node) {
    let result = []

    if (node.source) {
      return false
    }
    if (node.declaration) {
      let id = null
      switch (node.declaration.type) {
        case 'VariableDeclaration':
          id = node.declaration.declarations[0].id.name
          break;
        case 'FunctionDeclaration':
        case 'ClassDeclaration':
          id = node.declaration.id.name
          break
        default:
          break
      }
      result.push({ from: id, to: id })
    }
    else if (node.specifiers.length > 0) {
      for (const item of node.specifiers) {
        result.push({
          from: item.local.name,
          to: item.exported.name
        })
      }
    }
    return result
  }
  _parseExportFromImport() {
    const mergeList = []
    //default can not be a variable
    var getKey = (function () {
      var index = 0;
      return function () {
        return '_z_' + index++
      }
    })()
    const that = this
    walk.simple(this.ast, {
      ExportNamedDeclaration(node) {
        //complex
        if (!node.source) {
          return
        }
        let delStart = node.start
        let delEnd = node.end
        let token = that._parseSpecifiers(node.specifiers)

        let importToken = []
        let exportToken = []
        for (let item of token) {
          let key = getKey()
          importToken.push({
            from: item.from,
            to: key
          })
          exportToken.push({
            from: key,
            to: item.to
          })
        }
        mergeList.push({
          file: node.source.value,
          importToken: importToken,
          exportToken: exportToken
        })
        that.delPosition.push([delStart, delEnd])
      }

    })
    return mergeList
  }
}
