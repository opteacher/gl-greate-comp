import path from 'path'
import { writeFile } from 'fs/promises'
import cmpLib from '../resources/element-ui-vue_1.1.0-beta.19.json'
import { basicMapper, basicTypes, Compo, FieldType, Page } from '../utils/common.js'

function indent (deep: number): string {
  return ''.padStart(deep << 1)
}

function scanCompoBuildTemp (compo: Compo, deep: number): string {
  const cmpInf = cmpLib.data.find(cmpInf => {
    return cmpInf.name === compo.ctype
  })
  if (!cmpInf || !cmpInf.tag) {
    return ''
  }
  let template = indent(deep) + `<${cmpInf.tag}`
  for (const [name, attr] of Object.entries(compo.toAttributes())) {
    template += ` ${name}="${attr}"`
  }
  template += compo.children.length ? '' : '/' + '>\n'
  for (const subCmp of compo.children) {
    template += scanCompoBuildTemp(subCmp, ++deep)
  }
  if (compo.children.length) {
    template += `</${cmpInf.tag}>\n`
    --deep
  }
  return template
}

function buildScriptV3 (page: Page): string {
  let script = ''
  let deep = 0
  // @_@：默认使用vue3风格
  script += indent(deep) + 'import { defineComponent, ref, reactive, onMounted } from \'vue\'\n'
  // @_@：默认使用axios后台访问
  script += indent(deep) + 'import axios from \'axios\'\n'
  script += indent(deep) + 'export default defineComponent({\n'
  ++deep
  script += indent(deep) + `name: \'${page.name}\',\n`
  if (page.params.length) {
    script += indent(deep) + 'props: {\n'
    ++deep
    for (const param of page.params) {
      script += indent(deep) + `\'${param.name}\': { `
      script += `type: ${basicMapper[param.type as FieldType]}, `
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
    switch (dataSrc.varType) {
    case 'string':
      script += '\'\')\n'
      break
    case 'number':
      script += '0)\n'
      break
    case 'boolean':
      script += 'false)\n'
      break
    case 'Object':
      script += '{})\n'
      break
    case 'Array':
      script += '[])\n'
      break
    default:
      script += 'null)\n'
    }
  }

  for (const field of page.fields) {
    script += indent(deep) + `const ${field.name} = `
    if (field.flow === 'doubly') {
      let fSrc = field.source
      // 不等于所属页面，表示是来自外部的参数
      if (field.parent !== page.name) {
        fSrc = `props.${fSrc.substring(1)}`
      }
      if (basicTypes.includes(field.type as FieldType)) {
        script += `ref(${fSrc})\n`
      } else {
        script += `reactive(${fSrc})\n`
      }
    } else if (field.flow === 'single') {
      script += `${field.source}\n`
    }
  }

  script += indent(deep) + 'onMounted(async () => {\n'
  ++deep
  if (dataSrc.url) {
    script += indent(deep) + `${dataSrc.varName}.value = `
    script += `(await axios.${dataSrc.method.toLowerCase()}(`
    script += `'${dataSrc.url}')).${dataSrc.prefix}\n`
  }
  --deep
  script += indent(deep) + '})\n'

  script += indent(deep) + 'return {\n'
  ++deep
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
    template += scanCompoBuildTemp(compo, 1)
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
