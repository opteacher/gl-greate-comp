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

export class CompoInfo {
  name: string
  // 前置类：如果指定该项，则组件的遮罩会根据这个类去获取组件的位置和尺寸信息
  // 并创建自身，所以这个类要么是组件本身所拥有，要么是组件的父类所拥有
  class: string
  desc: string
  cover: string
  lib: string
  tag: string
  imported: any
  slot: string
  group: string

  constructor () {
    this.name = ''
    this.class = ''
    this.desc = ''
    this.cover = ''
    this.lib = ''
    this.tag = ''
    this.imported = null
    this.slot = ''
    this.group = ''
  }

  public static copy (src: any, tgt?: CompoInfo): CompoInfo {
    tgt = tgt || new CompoInfo()
    tgt.name = src.name
    tgt.class = src.class || tgt.class
    tgt.desc = src.desc || tgt.desc
    tgt.cover = src.cover || tgt.cover
    tgt.lib = src.lib || tgt.lib
    tgt.tag = src.tag || tgt.tag
    tgt.slot = src.slot || tgt.slot
    tgt.group = src.group || tgt.group
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

export type CompoType = 'Block' | 'Input' | 'Button' | 'Select' | 'Checkbox' | 'Unknown'
export class Position extends StrIterable {
  position: PosType
  left: NumSize
  top: NumSize
  right: NumSize
  bottom: NumSize

  constructor () {
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

export type DisplayType = 'none' | 'block' | 'inline' | 'inline-block' |
  'list-item' | 'run-in' | 'table' | 'inline-table' | 'inherit' |
  'flex' | 'inline-flex'
export class Layout extends StrIterable {
  display: DisplayType

  constructor () {
    super()
    this.display = 'inherit'
  }

  public static copy (src: any, tgt?: Layout): Layout {
    tgt = tgt || new Layout()
    tgt.display = src.display || tgt.display
    return tgt
  }
}
export class Styles extends StrIterable {
  backgroundColor: string

  constructor () {
    super()
    this.backgroundColor = 'transparent'
  }

  public static copy (src: any, tgt?: Styles): Styles {
    tgt = tgt || new Styles()
    tgt.backgroundColor = src.backgroundColor || tgt.backgroundColor
    return tgt
  }
}

export function buildStyles (styled: StrIterable, ignores: string[] = []): string {
  const pos = styled.position ? styled.position.position : 'static'
  const mkNumStyle = (key: string, num: NumSize): string => {
    if (!ignores.includes(key) && num && (num[0] || num[0] === 0) && !isNaN(num[0])) {
      return `${key}: ${num[0]}${num[1]}`
    } else {
      return ''
    }
  }
  const mkBscStyle = (key: string, value?: string, skip?: string): string => {
    return !ignores.includes(key) && (skip ? value !== skip : value) ? `${key}: ${value}` : ''
  }
  return (styled.styles ? [
    mkBscStyle('background-color', styled.styles.backgroundColor, 'transparent')
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
  ]).concat([
    mkBscStyle('display', styled.layout.display, 'inherit')
  ]).filter((x) => x !== '').join(';')
}
export class Compo extends StrIterable {
  name: string
  tag: string
  class: string
  parent: string
  group: string
  ctype: CompoType
  size: Size
  styles: Styles
  position: Position
  layout: Layout
  children: Compo[]
  static cpIgnores: string[] = [
    'name', 'class', 'parent', 'group', 'ctype', 'size',
    'styles', 'position', 'layout', 'children'
  ]
  static attrIgnores: string[] = [
    'name', 'class', 'tag', 'parent', 'group', 'ctype', 'size',
    'position', 'layout', 'children', 'styles', '#inner'
  ]

  constructor () {
    super()
    this.name = ''
    this.tag = ''
    this.class = ''
    this.parent = ''
    this.group = ''
    this.ctype = 'Unknown'
    this.size = new Size()
    this.styles = new Styles()
    this.position = new Position()
    this.layout = new Layout()
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
      id: string
      [specProp: string]: any
    } = { id: this.name }
    const style = buildStyles(this)
    if (style) {
      ret['style'] = style
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
    tgt.name = src.name || tgt.name
    tgt.tag = src.tag || tgt.tag
    tgt.class = src.class || tgt.class
    tgt.parent = src.parent || tgt.parent
    tgt.ctype = src.ctype || tgt.ctype
    if (src.size) {
      Size.copy(src.size, tgt.size)
    }
    if (src.styles) {
      Styles.copy(src.styles, tgt.styles)
    }
    if (src.position) {
      Position.copy(src.position, tgt.position)
    }
    if (src.layout) {
      Layout.copy(src.layout, tgt.layout)
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
export class Cond {
  key: string
  cmp?: CmpType
  val: any

  constructor () {
    this.key = ''
    this.val = undefined
  }

  isVaild (object: StrIterable) {
    switch (this.cmp) {
    case '!=':
      return object[this.key] !== this.val
    case '=':
    default:
      return object[this.key] === this.val
    }
  }

  public static copy (src: any, tgt?: Cond): Cond {
    tgt = tgt || new Cond()
    tgt.key = src.key || tgt.key
    tgt.cmp = src.cmp || tgt.cmp
    tgt.val = src.val || tgt.val
    return tgt
  }
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
export class Attr {
  key: number
  name: string
  type: AttrType
  parent: string
  required: boolean
  dftVal?: any
  disabled?: boolean | ((prop: Attr) => boolean)

  constructor () {
    this.key = -1
    this.name = ''
    this.type = undefined
    this.parent = ''
    this.required = false
    this.disabled = false
  }

  setKey (key: number): Attr {
    this.key = key
    return this
  }

  public static copy (src: any, tgt?: Attr): Attr {
    tgt = tgt || new Attr()
    tgt.key = typeof src.key !== 'undefined' ? src.key : tgt.key
    tgt.name = src.name || tgt.name
    tgt.type = src.type || tgt.type
    tgt.parent = src.parent || tgt.parent
    tgt.required = typeof src.required !== 'undefined' ? JSON.parse(src.required) : tgt.required
    tgt.dftVal = src.dftVal || tgt.dftVal
    tgt.disabled = typeof src.disabled !== 'undefined' ? JSON.parse(src.disabled) : tgt.disabled
    return tgt
  }

  reset () {
    this.key = -1
    this.name = ''
    this.type = undefined
    this.parent = ''
    this.required = false
    this.dftVal = ''
    this.disabled = false
  }
}
export class Clazz {
  key: number
  name: string
  props: Attr[]
  belong: string
  copyable: boolean

  constructor() {
    this.key = -1
    this.name = ''
    this.props = []
    this.belong = ''
    this.copyable = true
  }

  setKey (key: number): Clazz {
    this.key = key
    return this
  }

  public static copy (src: any, tgt?: Clazz): Clazz {
    tgt = tgt || new Clazz()
    tgt.key = src.key || -1
    tgt.name = src.name || ''
    tgt.belong = src.belong || ''
    tgt.copyable = src.copyable || true
    tgt.props = src.props ? src.props.map((prop: any) => Attr.copy(prop)) : []
    return tgt
  }
}
export class Page extends Compo {
  index: number
  ptype: PageType
  classes: Clazz[]
  params: Attr[] // 等于inputs
  fields: Field[] // 等于outputs
  dataSrc: DataSrc

  constructor() {
    super()
    this.index = 0
    this.ptype = 'other'
    this.classes = []
    this.params = []
    this.fields = []
    this.dataSrc = new DataSrc()
  }

  public static copy (src: any, tgt?: Page): Page {
    tgt = tgt || new Page()
    Compo.copy(src, tgt)
    tgt.index = src.index || tgt.index
    tgt.ptype = src.ptype || tgt.ptype
    tgt.classes = src.classes ? src.classes.map((clazz: any, key: number) => {
      return Clazz.copy(clazz).setKey(key)
    }) : tgt.classes
    tgt.params = src.params ? src.params.map((param: any, key: number) => {
      return Attr.copy(param).setKey(key)
    }) : tgt.params
    tgt.fields = src.fields ? src.fields.map((field: any, key: number) => {
      return Field.copy(field).setKey(key)
    }) : tgt.fields
    tgt.dataSrc = src.dataSrc || tgt.dataSrc
    return tgt
  }
}
export type BasicType = 'string' | 'number' | 'boolean' | 'Array' | 'Object'

export const basicTypes = ['string', 'number', 'boolean', 'Array', 'Object']

export const basicMapper: {
  [K in BasicType]: string
} = {
  'string': 'String',
  'number': 'Number',
  'boolean': 'Boolean',
  'Array': 'Array',
  'Object': 'Object'
}

export type AttrType = BasicType | string | undefined

export type BuildType = 'direct' | 'process'

export type FlowType = 'doubly' | 'single'

export const buildTypes = ['direct', 'process']
export class Field extends Attr {
  build: BuildType
  source: string
  bind: string[]
  flow: FlowType

  constructor () {
    super()
    this.build = 'direct'
    // 当build类型为direct时，直接绑定测试数据的某个字段
    // 为process时表示该字段需要进行一定的操作才能获得，
    // 可操作的对象即为返回的测试数据
    this.source = ''
    this.bind = []
    this.flow = 'doubly'
  }

  public reset () {
    super.reset()
    this.build = 'direct' as BuildType
    // 当build类型为direct时，直接绑定测试数据的某个字段
    // 为process时表示该字段需要进行一定的操作才能获得，
    // 可操作的对象即为返回的测试数据
    this.source = ''
    this.bind = []
    this.flow = 'doubly'
  }

  public static copy (src: any, tgt?: Field): Field {
    tgt = tgt || new Field()
    Attr.copy(src, tgt)
    tgt.build = src.build || 'direct'
    tgt.source = src.source || ''
    tgt.bind = src.bind || []
    tgt.flow = src.flow || 'doubly'
    return tgt
  }
}
export class Mapper {
  [prop: string]: {
    label?: string
    desc?: string
    type: CompoType
    rules?: any[]
    disabled?: boolean | Cond
    display?: boolean | Cond
    changes?: {
      cond: Cond
      attr: Cond
    }[]
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
        desc: value.desc || '',
        type: value.type || 'Unknown',
        rules: value.rules || [],
        disabled: value.disabled instanceof Cond ? Cond.copy(value.disabled) : (
          typeof value.disabled !== 'undefined' ? value.disabled : false
        ),
        display: value.display instanceof Cond ? Cond.copy(value.display) : (
          typeof value.display !== 'undefined' ? value.display : true
        ),
        changes: value.changes ? value.changes.map((chg: any) => ({
          cond: Cond.copy(chg.cond),
          attr: Cond.copy(chg.attr),
        })) : [],
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
export type Method = 'GET' | 'POST' | 'DELETE' | 'PUT'

export const methods = ['GET', 'POST', 'DELETE', 'PUT']
export class DataSrc {
  url: string
  method: Method
  prefix: string
  varName: string
  varType: AttrType

  constructor () {
    this.url = ''
    this.method = 'GET'
    this.prefix = ''
    this.varName = ''
    this.varType = undefined
  }

  public static copy (src: any, tgt?: DataSrc, force = false): DataSrc {
    tgt = tgt || new DataSrc()
    tgt.url = force ? src.url : (src.url || tgt.url)
    tgt.method = force ? src.method : (src.method || tgt.method)
    tgt.prefix = force ? src.prefix : (src.prefix || tgt.prefix)
    tgt.varName = force ? src.varName : (src.varName || tgt.varName)
    tgt.varType = force ? src.varType : (src.varType || tgt.varType)
    return tgt
  }
}

export type DropPos = 'top' | 'bottom' | 'left' | 'right' | 'inner' | ''
export interface DragDropInfo {
  dragCompo: string
  dropCompo: string
  dropPos: DropPos
}
