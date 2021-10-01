import compoData from './test_ress/components.json'

export const uiFrameworks = {
  'vuejs': {
    'title': 'VueJs',
    'miniapp': [],
    'mobile': [],
    'PC': [
      'ant-design-vue',
      'element-ui-vue'
    ]
  },
  'react': {
    'title': 'React',
    'miniapp': [],
    'mobile': [],
    'PC': []
  }
}

export const terminals = [{
  title: '电脑端',
  value: 'PC'
}, {
  title: '移动端',
  value: 'mobile'
}, {
  title: '小程序端',
  value: 'miniapp'
}]

export interface SelUiFwkFormState {
  terminal: string
  framework: string
  library: string
}

export class ComponentInfo {
  name: string
  desc: string
  cover: string
  lib: string

  constructor () {
    this.name = ''
    this.desc = ''
    this.cover = ''
    this.lib = ''
  }

  public static copy (src: any, tgt?: ComponentInfo): ComponentInfo {
    tgt = tgt || new ComponentInfo()
    tgt.name = src.name
    tgt.desc = src.desc
    tgt.cover = src.cover
    tgt.lib = src.lib
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
    this.width = [100, Unit['%']] as NumSize
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

export type CompoType = 'Input' | 'Button' | 'Unknown'

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
    this.backgroundColor = '#sFFFFFF'
  }

  public static copy (src: any, tgt?: Styles): Styles {
    tgt = tgt || new Styles()
    tgt.backgroundColor = src.backgroundColor || '#FFFFFF'
    return tgt
  }
}

export function buildStyles (styled: StrIterable): string {
  const pos = styled.position ? styled.position.position : 'static'
  const mkNumStyle = (num: NumSize, key: string): string => {
    return !isNaN(num[0]) ? `${key}: ${num[0]}${num[1]}` : ''
  }
  const mkClrStyle = (key: string, color?: string): string => {
    return color ? `${key}: ${color}` : ''
  }
  return (styled.styles ? [
    mkClrStyle('background-color', styled.styles.backgroundColor)
  ] : []).concat(pos !== 'static' ? [
    `position: ${pos}`,
    mkNumStyle(styled.position.left, 'left'),
    mkNumStyle(styled.position.top, 'top'),
    mkNumStyle(styled.position.right, 'right'),
    mkNumStyle(styled.position.bottom, 'bottom'),
  ] : []).concat([
    mkNumStyle(styled.size.width, 'width'),
    mkNumStyle(styled.size.height, 'height'),
    mkNumStyle(styled.size.paddingLeft, 'padding-left'),
    mkNumStyle(styled.size.paddingTop, 'padding-top'),
    mkNumStyle(styled.size.paddingRight, 'padding-right'),
    mkNumStyle(styled.size.paddingBottom, 'padding-bottom'),
    mkNumStyle(styled.size.marginLeft, 'margin-left'),
    mkNumStyle(styled.size.marginTop, 'margin-top'),
    mkNumStyle(styled.size.marginRight, 'margin-right'),
    mkNumStyle(styled.size.marginBottom, 'margin-bottom'),
  ]).join(';')
}

export class Compo extends StrIterable {
  name: string
  parent: string
  ctype: CompoType
  size: Size
  styles: Styles
  position: Position
  children: Compo[]

  constructor () {
    super()
    this.name = ''
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
      name: string,
      style: string,
      [specProp: string]: any
    } = {
      name: this.name,
      style: buildStyles(this)
    }
    for (const [key, value] of Object.entries(this)) {
      if (key === 'name' || key === 'parent'
      || key === 'ctype' || key === 'size'
      || key === 'position' || key === 'children') {
        continue
      }
      ret[key] = value
    }
    return ret
  }

  public static copy (src: any, tgt?: Compo): Compo {
    tgt = tgt || new Compo()
    tgt.name = src.name || ''
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
    if (src.children) {
      tgt.children = src.children.map((subCompo: any) => {
        return Compo.copy(subCompo)
      })
    }
    for (const [key, value] of Object.entries(src)) {
      if (key === 'name' || key === 'parent'
      || key === 'ctype' || key === 'size'
      || key === 'position' || key === 'children') {
        continue
      }
      tgt[key] = value
    }
    return tgt
  }
}

export type SelOpn = string | { title: string, value: string }

export type PropType = 'string' | 'number' | 'select' | 'text'

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

export function loadCompos () {
  const components: { [tagName: string]: (() => any) } = {}
  for (const compo of compoData.data) {
    if (!compo.lib) {
      continue
    }
    components[compo.name] = () => import(compo.lib)
  }
  return components
}

export class Page extends Compo {
  index: number
  ptype: PageType

  constructor() {
    super()
    this.index = 0
    this.ptype = 'other'
  }

  public static copy (src: any, tgt?: Page): Page {
    tgt = tgt || new Page()
    tgt.index = src.index || 0
    tgt.ptype = src.ptype || 'other'
    Compo.copy(src, tgt)
    return tgt
  }
}
