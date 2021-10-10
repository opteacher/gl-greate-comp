import path from 'path'
import { writeFile } from 'fs/promises'
import cmpLib from '../resources/element-ui-vue_1.1.0-beta.19.json'
import { basicMapper, basicTypes, Compo, BasicType, Page, AttrType, CompoInfo } from '../utils/common.js'

const bscTyps = new Set(basicTypes)

function indent (deep: number): string {
  return ''.padStart(deep << 1)
}

function initDft (type: AttrType): string {
  switch (type) {
  case undefined:
    return ''
  case 'string':
    return '\'\''
  case 'number':
    return '0'
  case 'boolean':
    return 'false'
  case 'Object':
    return '{}'
  case 'Array':
    return '[]'
  default:
    return `{} as ${type}`
  }
}

function assignObj (
  src: string, tgt: string, type: AttrType,
  page: Page, tgtIsRef: boolean = false
): string {
  const fixTgt = tgtIsRef ? '.value' : ''
  const clazz = page.classes.find(cls => cls.name === type)
  if (clazz && clazz.copyable) {
    return `${clazz.name}.copy(${src}, ${tgt}${fixTgt})\n`
  } else {
    return `${tgt}${fixTgt} = ${src}\n`
  }
}

function scanCompoBuildTemp (page: Page, compo: Compo, deep: number): string {
  const rawCmpInf = cmpLib.data.find(cmpInf => {
    return cmpInf.name === compo.ctype
  })
  if (!rawCmpInf || !rawCmpInf.tag) {
    return ''
  }
  const cmpInf = CompoInfo.copy(rawCmpInf)
  let bindField = null
  if (cmpInf.slot) {
    for (const field of page.fields) {
      if (!field.bind.length) {
        continue
      }
      const lastBind = field.bind[field.bind.length - 1]
      if (lastBind === compo.name) {
        bindField = field
        break
      }
    }
  }
  let template = indent(deep) + `<${cmpInf.tag}`
  for (const [name, attr] of Object.entries(compo.toAttributes())) {
    template += ` ${name}="${attr}"`
  }
  if (bindField) {
    const vModel = bindField.flow === 'doubly' ? 'v-model' : ''
    template += ` ${vModel}:${cmpInf.slot}="${bindField.name}"`
  }
  const hasChild = compo.children.length || cmpInf.slot === '#inner'
  template += hasChild ? '' : '/' + '>\n'
  // 如果组件有绑定变量，变量会覆盖该组件的子组件
  if (bindField && cmpInf.slot === '#inner') {
    template += indent((++deep)) + `{{${bindField.name}}}\n`
  } else {
    for (const subCmp of compo.children) {
      template += scanCompoBuildTemp(page, subCmp, ++deep)
    }
  }
  if (hasChild) {
    --deep
    template += `</${cmpInf.tag}>\n`
  }
  return template
}

function buildScriptV3 (page: Page): string {
  let script = ''
  let deep = 0
  // @_@：默认使用vue3风格
  script += indent(deep) + 'import {\n'
  ++deep
  script += indent(deep) + 'defineComponent,\n'
  script += indent(deep) + 'ref, reactive,\n'
  script += indent(deep) + 'onMounted,\n'
  --deep
  script += indent(deep) + '} from \'vue\'\n'
  // @_@：默认使用axios后台访问
  script += indent(deep) + 'import axios from \'axios\'\n'
  script += '\n'
  for (const clazz of page.classes) {
    script += indent(deep) + `class ${clazz.name} {\n`
    ++deep
    for (const prop of clazz.props) {
      script += indent(deep) + `${prop.name}: ${prop.type}\n`
    }
    script += indent(deep) + 'constructor () {\n'
    ++deep
    for (const prop of clazz.props) {
      script += indent(deep) + `this.${prop.name} = ${
        prop.dftVal || initDft(prop.type)
      }\n`
    }
    --deep
    script += indent(deep) + '}\n'
    if (clazz.copyable) {
      script += indent(deep) + `static copy(src: any, tgt?: ${clazz.name}) {\n`
      ++deep
      script += indent(deep) + `tgt = tgt || new ${clazz.name}()\n`
      for (const prop of clazz.props) {
        script += indent(deep) + `tgt.${prop.name} = src.${prop.name} || tgt.${prop.name}\n`
      }
      script += indent(deep) + 'return tgt\n'
      --deep
      script += indent(deep) + '}\n'
    }
    --deep
    script += indent(deep) + '}\n'
  }
  script += '\n'
  script += indent(deep) + 'export default defineComponent({\n'
  ++deep
  script += indent(deep) + `name: \'${page.name}\',\n`
  const params = new Set()
  if (page.params.length) {
    script += indent(deep) + 'props: {\n'
    ++deep
    for (const param of page.params) {
      params.add(param.name)
      script += indent(deep) + `\'${param.name}\': { `
      script += `type: ${basicMapper[param.type as BasicType]}, `
      if (typeof param.required !== 'undefined') {
        script += `required: ${param.required ? 'true' : 'false'}, `
      }
      if (typeof param.dftVal !== 'undefined') {
        switch (param.type) {
        case 'string':
          script += `default: '${param.dftVal}', `
          break
        default:
          script += `default: ${param.dftVal}, `
        }
      }
      script += '},\n'
    }
    --deep
    script += indent(deep) + '},\n'
  }
  script += indent(deep) + `setup (${page.params.length ? 'props' : ''}) {\n`
  ++deep

  const dataSrc = page.dataSrc
  if (dataSrc.url) {
    script += indent(deep) + `const ${dataSrc.varName} = ref(`
    script += initDft(dataSrc.varType) + ')\n'
  }

  for (const field of page.fields) {
    const isBscType = bscTyps.has(field.type as BasicType)
    const isParam = params.has(field.source)

    script += indent(deep) + `const ${field.name} = `
    let dftVal = field.dftVal || initDft(field.type)
    // 直接注入且源为参数的，判定为参数
    if (field.build === 'direct' && isParam) {
      dftVal = `props.${field.source}`
    }
    if (field.flow === 'doubly') {
      if (isBscType) {
        script += `ref(${dftVal})\n`
      } else {
        script += `reactive(${dftVal})\n`
      }
    } else if (field.flow === 'single') {
      script += `${dftVal}\n`
    }
  }

  script += indent(deep) + 'onMounted(async () => {\n'
  ++deep
  if (dataSrc.url) {
    script += indent(deep) + `const url = \'${dataSrc.url}\'\n`
    script += indent(deep) + `const resp = await axios.${dataSrc.method.toLowerCase()}(url)\n`
    script += indent(deep) + assignObj(
      `resp.data.${dataSrc.prefix}`,
      dataSrc.varName,
      dataSrc.varType,
      page, true
    )
  }
  for (const field of page.fields) {
    const isBscType = bscTyps.has(field.type as BasicType)

    if (field.build === 'direct') {
      continue
    }
    script += indent(deep) + assignObj(
      field.source,
      field.name,
      field.type,
      page,
      field.flow === 'doubly' && isBscType
    )
  }
  --deep
  script += indent(deep) + '})\n'

  script += indent(deep) + 'return {\n'
  ++deep
  if (dataSrc.url) {
    script += indent(deep) + `${dataSrc.varName},\n`
  }
  for (const field of page.fields) {
    script += indent(deep) + `${field.name},\n`
  }
  --deep
  script += indent(deep) + '}\n'

  --deep
  script += indent(deep) + '}\n'
  --deep
  script += indent(deep) + '})\n'
  return script
}

export default async function generate (page: Page): Promise<string> {
  let template = '<template>\n'
  for (const compo of page.children) {
    template += scanCompoBuildTemp(page, compo, 1)
  }
  template += '</template>'

  // @_@：语言默认使用typescript
  let script = '<script lang=\'ts\'>\n'
  script += buildScriptV3(page)
  script += '</script>'

  const gPath = path.resolve('../dist', page.name + '.vue')
  await writeFile(gPath, `${template}\n\n${script}`)
  return gPath
}
