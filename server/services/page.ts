import path from 'path'
import { writeFile } from 'fs/promises'
import cmpLib from '../resources/element-ui-vue_1.1.0-beta.19.json'

export default async function generate (page: any): Promise<string> {
  let fcontent = '<template>\n'
  let deep = 1
  for (const compo of page.children) {
    const cmpInf = cmpLib.data.find(cmpInf => {
      return cmpInf.name === compo.ctype
    })
    if (!cmpInf) {
      continue
    }
    let indent = ''
    for (let i = 0; i < deep; i++) {
      indent += '  '
    }
    fcontent += `${indent}<${cmpInf.tag}${compo.children.length ? '' : '/'}>\n`
  }
  fcontent += '</template>'

  const gpath = path.resolve('../dist', page.name + '.vue')
  await writeFile(gpath, fcontent)
  return gpath
}
