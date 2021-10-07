import { ref, Ref } from 'vue'

export type Terminal = 'PC' | 'mobile' | 'miniapp'
export interface UiFramework {
  name: string
  title?: string
  platforms: Platform[]
}
export interface Platform {
  target: Terminal
  libraries: Library[]
}
export interface Library {
  name: string
  styles?: string // UI库的样式集位置
  components: string // UI库的组件集位置
}

export function copyUiFmwk (src: any, tgt?: UiFramework): UiFramework {
  tgt = tgt || { name: '', platforms: [] }
  tgt.name = src.name
  tgt.title = src.title || ''
  tgt.platforms = []
  for (const platform of src.platforms) {
    tgt.platforms.push({
      target: platform.target,
      libraries: platform.libraries.map((lib: any) => {
        return {
          name: lib.name,
          styles: lib.styles || '',
          components: lib.components || ''
        }
      })
    })
  }
  return tgt
}
export interface SelUiFwkFormState {
  platform: string
  framework: string
  library: string
}

export async function waitFor (
  iden: string, reqFun?: (el: any) => boolean, lpLimit = 500
) {
  let ret = null
  for (let i = 0; i < lpLimit; ++i) {
    ret = document.getElementById(iden)
    if (ret) {
      if (reqFun) {
        if (reqFun(ret)) {
          return Promise.resolve(ret)
        }
      } else {
        return Promise.resolve(ret)
      }
    }
    await new Promise(res => setTimeout(res, 200))
  }
  return Promise.resolve(ret)
}

export async function until (reqFun: () => any, lpLimit = 500) {
  for (let i = 0; i < lpLimit; ++i) {
    const ret = reqFun()
    if (ret) {
      return Promise.resolve(ret)
    }
    await new Promise(res => setTimeout(res, 200))
  }
  return Promise.reject()
}
export class CompoInfo {
  name: string
  clazz: string
  desc: string
  cover: string
  lib: string
  tag: string
  imported: any

  constructor () {
    this.name = ''
    this.clazz = ''
    this.desc = ''
    this.cover = ''
    this.lib = ''
    this.tag = ''
    this.imported = null
  }

  public static copy (src: any, tgt?: CompoInfo): CompoInfo {
    tgt = tgt || new CompoInfo()
    tgt.name = src.name
    tgt.clazz = src.clazz || ''
    tgt.desc = src.desc || ''
    tgt.cover = src.cover || ''
    tgt.lib = src.lib || ''
    tgt.tag = src.tag || ''
    return tgt
  }
}
export class Point {
  x: number
  y: number

  constructor (x?: number, y?: number) {
    this.x = x || -1
    this.y = y || -1
  }

  public isValuable (): boolean {
    return this.x >= 0 && this.y >= 0
  }

  public toInvaluable () {
    this.x = -1
    this.y = -1
  }

  public static copy (src: any, tgt?: Point): Point {
    tgt = tgt || new Point()
    tgt.x = src.x
    tgt.y = src.y
    return tgt
  }
}
export class Rect {
  left: number
  top: number
  width: number
  height: number

  constructor (left?: number, top?: number, width?: number, height?: number) {
    this.left = left || 0
    this.top = top || 0
    this.width = width || 0
    this.height = height || 0
  }

  public insideByXY (x: number, y: number): boolean {
    return x >= this.left && x <= this.left + this.width
      && y >= this.top && y <= this.top + this.height
  }

  public insideByPoi (pos: Point): boolean {
    return pos.x >= this.left && pos.x <= this.left + this.width
      && pos.y >= this.top && pos.y <= this.top + this.height
  }

  public static copy (src: any, tgt?: Rect): Rect {
    tgt = tgt || new Rect()
    tgt.left = src.left
    tgt.top = src.top
    tgt.width = src.width
    tgt.height = src.height
    return tgt
  }
}
export class StrIterable {
  [idx: string]: any
}

export enum Unit {
  px = 'px',
  '%' = '%',
  pt = 'pt',
  rpx = 'rpx',
  vw = 'vw',
  vh = 'vh',
  em = 'em'
}

export const UnitAry = Object.entries(Unit)
  .map((keyVal: [string, string]) => ({
    title: keyVal[0], value: keyVal[1]
  }))

export type PageType = 'item' | 'list' | 'form' | 'other'
// auto指的尺寸由内部组件决定
export type NumSize = [number, Unit]
// export type NbSzWithAuto = NumSize | 'auto'
// export type SizeType = NbSzWithAuto | 'fill-parent' | 'no-wrap'

// export const SpcSzAry = ['auto', 'fill-parent', 'no-wrap']
export class Size extends StrIterable {
  width: NumSize
  height: NumSize
  paddingLeft: NumSize
  paddingTop: NumSize
  paddingRight: NumSize
  paddingBottom: NumSize
  marginLeft: NumSize
  marginTop: NumSize
  marginRight: NumSize
  marginBottom: NumSize

  constructor () {
    super()
    this.width = [NaN, Unit.px] as NumSize
    this.height = [NaN, Unit.px] as NumSize
    this.paddingLeft = [NaN, Unit.px]
    this.paddingTop = [NaN, Unit.px]
    this.paddingRight = [NaN, Unit.px]
    this.paddingBottom = [NaN, Unit.px]
    this.marginLeft = [NaN, Unit.px]
    this.marginTop = [NaN, Unit.px]
    this.marginRight = [NaN, Unit.px]
    this.marginBottom = [NaN, Unit.px]
  }

  public static copy (src: any, tgt?: Size): Size {
    tgt = tgt || new Size()
    tgt.width = src.width || [NaN, Unit.px]
    tgt.height = src.height || [NaN, Unit.px]
    tgt.paddingLeft = src.paddingLeft || [NaN, Unit.px]
    tgt.paddingTop = src.paddingTop || [NaN, Unit.px]
    tgt.paddingRight = src.paddingRight || [NaN, Unit.px]
    tgt.paddingBottom = src.paddingBottom || [NaN, Unit.px]
    tgt.marginLeft = src.marginLeft || [NaN, Unit.px]
    tgt.marginTop = src.marginTop || [NaN, Unit.px]
    tgt.marginRight = src.marginRight || [NaN, Unit.px]
    tgt.marginBottom = src.marginBottom || [NaN, Unit.px]
    return tgt
  }
}

export type PosType = 'static' | 'relative' | 'absolute' | 'fixed'

export type CompoType = 'Input' | 'Button' | 'Select' | 'Checkbox' | 'Unknown'
export class Position extends StrIterable {
  position: PosType
  left: NumSize
  top: NumSize
  right: NumSize
  bottom: NumSize

  constructor() {
    super()
    this.position = 'static'
    this.left = [NaN, Unit.px] as NumSize
    this.top = [NaN, Unit.px] as NumSize
    this.right = [NaN, Unit.px] as NumSize
    this.bottom = [NaN, Unit.px] as NumSize
  }

  public static copy (src: any, tgt?: Position): Position {
    tgt = tgt || new Position()
    tgt.position = src.position || 'static'
    tgt.left = src.left || [NaN, Unit.px] as NumSize
    tgt.top = src.top || [NaN, Unit.px] as NumSize
    tgt.right = src.right || [NaN, Unit.px] as NumSize
    tgt.bottom = src.bottom || [NaN, Unit.px] as NumSize
    return tgt
  }
}
export class Styles extends StrIterable {
  backgroundColor: string

  constructor () {
    super()
    this.backgroundColor = ''
  }

  public static copy (src: any, tgt?: Styles): Styles {
    tgt = tgt || new Styles()
    tgt.backgroundColor = src.backgroundColor || ''
    return tgt
  }
}

export function buildStyles (styled: StrIterable, ignores: string[] = []): string {
  const pos = styled.position ? styled.position.position : 'static'
  const mkNumStyle = (key: string, num: NumSize): string => {
    if (!ignores.includes(key) && num && !isNaN(num[0])) {
      return `${key}: ${num[0]}${num[1]}`
    } else {
      return ''
    }
  }
  const mkClrStyle = (key: string, color?: string): string => {
    return !ignores.includes(key) && color ? `${key}: ${color}` : ''
  }
  return (styled.styles ? [
    mkClrStyle('background-color', styled.styles.backgroundColor)
  ] : []).concat(pos !== 'static' ? [
    !ignores.includes('position') ? `position: ${pos}` : '',
    mkNumStyle('left', styled.position.left),
    mkNumStyle('top', styled.position.top),
    mkNumStyle('right', styled.position.right),
    mkNumStyle('bottom', styled.position.bottom),
  ] : []).concat([
    mkNumStyle('width', styled.size.width),
    mkNumStyle('height', styled.size.height),
    mkNumStyle('padding-left', styled.size.paddingLeft),
    mkNumStyle('padding-top', styled.size.paddingTop),
    mkNumStyle('padding-right', styled.size.paddingRight),
    mkNumStyle('padding-bottom', styled.size.paddingBottom),
    mkNumStyle('margin-left', styled.size.marginLeft),
    mkNumStyle('margin-top', styled.size.marginTop),
    mkNumStyle('margin-right', styled.size.marginRight),
    mkNumStyle('margin-bottom', styled.size.marginBottom),
  ]).join(';')
}
export class Compo extends StrIterable {
  name: string
  tag: string
  parent: string
  ctype: CompoType
  size: Size
  styles: Styles
  position: Position
  children: Compo[]
  static cpIgnores: string[] = [
    'name', 'parent', 'ctype', 'size',
    'styles', 'position', 'children'
  ]
  static attrIgnores: string[] = [
    'name', 'tag', 'parent', 'ctype', 'size',
    'position', 'children', 'styles', '#inner'
  ]

  constructor () {
    super()
    this.name = ''
    this.tag = ''
    this.parent = ''
    this.ctype = 'Unknown'
    this.size = new Size()
    this.styles = new Styles()
    this.position = new Position()
    this.children = []
  }

  public isInside (x: number, y: number): boolean {
    return new Rect(
      this.position.left[0],
      this.position.top[0],
      this.size.width[0],
      this.size.height[0]
    ).insideByXY(x, y)
  }

  public toAttributes (): any {
    const ret: {
      id: string,
      style: string,
      [specProp: string]: any
    } = {
      id: this.name,
      style: buildStyles(this)
    }
    for (const [key, value] of Object.entries(this)) {
      if (Compo.attrIgnores.includes(key)) {
        continue
      }
      ret[key] = value
    }
    return ret
  }

  public static copy (src: any, tgt?: Compo): Compo {
    tgt = tgt || new Compo()
    tgt.name = src.name || ''
    tgt.tag = src.tag || ''
    tgt.parent = src.parent || ''
    tgt.ctype = src.ctype || 'Unknown'
    if (src.size) {
      Size.copy(src.size, tgt.size)
    }
    if (src.styles) {
      Styles.copy(src.styles, tgt.styles)
    }
    if (src.position) {
      Position.copy(src.position, tgt.position)
    }
    tgt.children = src.children ? src.children.map((subCompo: any) => {
      return Compo.copy(subCompo)
    }) : []
    for (const [key, value] of Object.entries(src)) {
      if (Compo.cpIgnores.includes(key)) {
        continue
      }
      tgt[key] = value
    }
    return tgt
  }
}

export type SelOpn = string | { title: string, value: string }

// #inner: 写在标签内容
export type PropType = 'string' | 'number' | 'select' | 'text' | '#inner' | 'icon'

export type CmpType = '=' | '!=' | 'in'
export interface Cond {
  key: string
  cmp: CmpType
  val: any
}
export class Property {
  title: string
  key: string
  type: PropType
  value: string | number
  options?: SelOpn[] // 当type为select
  unit?: string // 当type为number
  disabled?: Cond

  constructor() {
    this.title = ''
    this.key = ''
    this.type = 'text'
    this.value = ''
  }

  public static copy (src: any, tgt?: Property): Property {
    tgt = tgt || new Property()
    tgt.title = src.title || ''
    tgt.key = src.key || ''
    tgt.type = src.type || 'text'
    tgt.value = src.value || ''
    tgt.options = src.options || []
    tgt.disabled = src.disabled || undefined
    return tgt
  }
}

export type OperType = 'move' | 'resize'

export class ClsProp {
  key: number
  name: string
  type: FieldType
  required: boolean
  dftVal?: any
  disabled?: boolean | ((prop: ClsProp) => boolean)

  constructor () {
    this.key = -1
    this.name = ''
    this.type = 'unknown'
    this.required = false
    this.disabled = false
  }

  public static copy (src: any, tgt?: ClsProp): ClsProp {
    tgt = tgt || new ClsProp()
    tgt.key = src.key || -1
    tgt.name = src.name || ''
    tgt.type = src.type || 'unknown'
    tgt.required = typeof src.required !== 'undefined' ? JSON.parse(src.required) : false
    tgt.dftVal = src.dftVal || null
    tgt.disabled = typeof src.disabled !== 'undefined' ? JSON.parse(src.disabled) : false
    return tgt
  }
}
export class Clazz {
  key: number
  name: string
  props: ClsProp[]
  belong: string
  copyable: boolean

  constructor() {
    this.key = -1
    this.name = ''
    this.props = []
    this.belong = ''
    this.copyable = true
  }

  public static copy (src: any, tgt?: Clazz): Clazz {
    tgt = tgt || new Clazz()
    tgt.key = src.key || -1
    tgt.name = src.name || ''
    tgt.belong = src.belong || ''
    tgt.copyable = src.copyable || true
    tgt.props = src.props ? src.props.map((prop: any) => ClsProp.copy(prop)) : []
    return tgt
  }
}
export class Page extends Compo {
  index: number
  ptype: PageType
  ref: Ref
  classes: Clazz[]
  params: ClsProp[]

  constructor() {
    super()
    this.index = 0
    this.ptype = 'other'
    this.ref = ref()
    this.classes = []
    this.params = []
  }

  public static copy (src: any, tgt?: Page): Page {
    tgt = tgt || new Page()
    Compo.copy(src, tgt)
    tgt.index = src.index || 0
    tgt.ptype = src.ptype || 'other'
    tgt.classes = src.classes ? src.classes
      .map((clazz: any) => Clazz.copy(clazz)) : []
    tgt.params = src.params ? src.params
      .map((variable: any) => ClsProp.copy(variable)) : []
    return tgt
  }
}
export type FieldType = 'id' | 'string' | 'number' | 'boolean' | 'array' | 'unknown'

export const fldTypAry = ['id', 'string', 'number', 'boolean', 'array']

export type FldBldType = 'direct' | 'process'

export type FldFlowType = 'doubly' | 'single'

export const fldBldTypAry = ['direct', 'process']
export class Field {
  key: number
  name: string
  type: FieldType
  build: FldBldType
  source: string
  bind: string[]
  flow: FldFlowType

  constructor () {
    this.key = -1
    this.name = ''
    this.type = 'unknown'
    this.build = 'direct'
    // 当build类型为direct时，直接绑定测试数据的某个字段
    // 为process时表示该字段需要进行一定的操作才能获得，
    // 可操作的对象即为返回的测试数据
    this.source = ''
    this.bind = []
    this.flow = 'doubly'
  }

  public reset () {
    this.key = -1
    this.name = ''
    this.type = 'unknown' as FieldType
    this.build = 'direct' as FldBldType
    // 当build类型为direct时，直接绑定测试数据的某个字段
    // 为process时表示该字段需要进行一定的操作才能获得，
    // 可操作的对象即为返回的测试数据
    this.source = ''
    this.bind = []
    this.flow = 'doubly'
  }

  public static copy (src: any, tgt?: Field): Field {
    tgt = tgt || new Field()
    tgt.key = typeof src.key !== 'undefined' ? src.key : -1
    tgt.name = src.name || ''
    tgt.type = src.type || 'unknown'
    tgt.build = src.build || 'direct'
    tgt.source = src.source || ''
    tgt.bind = src.bind || []
    tgt.flow = src.flow || 'doubly'
    return tgt
  }
}
export class Table extends StrIterable {
  name: string
  fields: Field[]

  constructor () {
    super()
    this.name = ''
    this.fields = []
  }

  public static copy (src: any, tgt?: Table): Table {
    tgt = tgt || new Table()
    tgt.name = src.name || ''
    tgt.fields = src.fields ? src.fields.map((field: any) => {
      return Field.copy(field)
    }) : []
    return tgt
  }
}
export class ObjectMapper {
  [prop: string]: {
    label: string
    type: CompoType
    rules?: any[],
    options?: string[] | {
      title: string, value: any
    }[] // type = Select
    chkLabels?: [string, string] // type = Checkbox。0为false，1为true
  }

  constructor (init?: any) {
    for (const [key, val] of Object.entries(init)) {
      const value = val as any
      this[key] = {
        label: value.label || '',
        type: value.type || 'Unknown',
        rules: value.rules || [],
        options: value.options ? value.options.map((opn: any) => {
          if (typeof opn === 'string') {
            return opn
          } else {
            return {
              title: opn.title, value: opn.value
            }
          }
        }) : [],
        chkLabels: value.chkLabels || ['', '']
      }
    }
  }
}
