import {
  basicTypes,
  Clazz,
  Attr,
  Compo,
  CompoInfo,
  CompoType,
  copyUiFmwk,
  Field,
  OperType,
  Page,
  StrIterable,
  UiFramework,
  Unit,
  DataSrc,
  Property,
  DragDropInfo,
  DropPos,
  Rect,
} from '@/common'
import { createStore } from 'vuex'
import pageRess from '../test_ress/pages.json'
import uiInfoRess from '../test_ress/uiFramworks.json'
import compoRess from '@/test_ress/components.json'
import propRess from '@/test_ress/properties.json'
import { message } from 'ant-design-vue'

const dftCompo = new Compo()
const dftPage = new Page()
interface SetPropParam {
  key: string, value?: any, unit?: Unit
}

export type DesignType = 'frontend' | 'backend'

function fixCmpByInf (state: any, compo: Compo): Compo {
  const cmpInf = state.compoLibrary.find((cmp: any) => {
    return cmp.name === compo.ctype
  })
  if (cmpInf) {
    compo.tag = cmpInf.tag || ''
    compo.class = cmpInf.class || ''
  }
  for (const prop of propRess.data[compo.ctype]) {
    if (prop.key === 'name' || prop.key === 'parent') {
      continue
    }
    if (prop.value) {
      compo[prop.key] = prop.value
    }
  }
  return compo
}

export default createStore({
  state: {
    dsgnType: 'frontend' as DesignType,
    uiFrameworks: [] as UiFramework[],
    selUiFramework: '',
    selUiLibrary: '',
    pages: [] as Page[],
    components: {} as { [name: string]: Compo },
    mdfdCompos: [] as string[],
    compoLibrary: [] as CompoInfo[],
    selPage: dftPage,
    selCompo: dftCompo,
    curOper: 'move' as OperType,
    avaTypes: basicTypes,
    dragDropVisible: false,
    dragDropInfo: {} as DragDropInfo
  },
  mutations: {
    SET_DESIGN_TYPE (state, payload: DesignType) {
      state.dsgnType = payload
    },
    INIT_UI_LIBS (state) {
      state.uiFrameworks = uiInfoRess.data.map(uiInfo => copyUiFmwk(uiInfo))
    },
    USE_UI_LIB (state, payload: { framework: string, library: string }) {
      state.selUiFramework = payload.framework
      state.selUiLibrary = payload.library
    },
    INIT_PAGES (state) {
      state.compoLibrary = compoRess.data.map((compo: any) => {
        const compoInfo = CompoInfo.copy(compo)
        // 无法动态加载UI库组件，现阶段只能全部导入，页面会很大，而且存在tag、css冲突的风险
        // if (compoInfo.lib) {
        //   compoInfo.imported = defineAsyncComponent(() => {
        //     console.log(compoInfo.lib)
        //     return import(`../../lib/node_modules/${compoInfo.lib}`)
        //   })
        // }
        return compoInfo
      })
      state.pages = pageRess.data.map(page => Page.copy(page))
      const scanCompos = (parent: Compo) => {
        state.components[parent.name] = fixCmpByInf(state, parent)
        for (const compo of parent.children) {
          if (compo.children.length) {
            scanCompos(compo)
          }
        }
      }
      for (const page of state.pages) {
        for (const compo of page.children) {
          scanCompos(compo)
        }
      }
    },
    SEL_NODE (state, payload: string) {
      if (state.components[payload]) {
        const compo = state.components[payload]
        // 寻找组件所属页面，并设置为选中页面
        let pgName = payload
        do {
          pgName = state.components[pgName].parent
        } while (state.components[pgName])
        const page = state.pages.find(page => {
          return page.name === pgName
        }) || dftPage
        if (pgName && pgName !== state.selPage.name) {
          state.selPage = page
        }
        state.selCompo = compo
        const pnlMain = document.getElementById('pnlMain')
        if (!pnlMain) {
          return
        }
        pnlMain.onmouseup = (e: MouseEvent) => {
          if (!state.selCompo.isInside(e.clientX, e.clientY)) {
            state.selCompo = dftCompo
            pnlMain.onmouseup = null
          }
        }
      } else {
        state.selCompo = dftCompo
        state.selPage = state.pages.find(pg => pg.name === payload) || dftPage
        state.avaTypes = [
          ...basicTypes, ...state.selPage.classes.map((cls: any) => cls.name)
        ]
      }
    },
    UPD_MASK (state, payload: string) {
      let el: HTMLElement | null = document
        .getElementById(payload)
      if (!el) {
        return
      }
      const compo = state.components[payload]
      if (compo.class) {
        while (!el.classList.contains(compo.class)) {
          el = el?.parentElement
          if (!el) {
            return
          }
        }
      }
      const cmpMask = compo.mask
      cmpMask.left = el.offsetLeft
      cmpMask.top = el.offsetTop
      cmpMask.width = el.offsetWidth
      cmpMask.height = el.offsetHeight
    },
    SET_PROP_VAL (state, payload: SetPropParam | SetPropParam[]) {
      if (!Array.isArray(payload)) {
        payload = [payload]
      }
      for (const propParam of payload) {
        const keys = propParam.key.split('.')
        const preKey = keys.length > 1 ? keys[0] : ''
        let selected: StrIterable
        if (state.selCompo.name.length) {
          selected = state.selCompo
        } else {
          selected = state.selPage
        }
        if (preKey) {
          selected = selected[preKey]
        }
        const key = preKey ? keys[1] : propParam.key
        const value = propParam.unit ? [
          propParam.value || selected[key][0],
          propParam.unit
        ] : propParam.value
        selected[key] = value
      }
    },
    ADD_COMPO (state, payload: Compo | {
      compo: Compo, index: number, replace: boolean
    }) {
      const index = typeof payload.index === 'undefined' ? -1 : payload.index
      const replace = payload.replace as boolean
      const compo = fixCmpByInf(state,
        Compo.copy(payload.compo || payload)
      )
      state.components[compo.name] = compo
      let children = []
      if (state.components[compo.parent]) {
        children = state.components[compo.parent].children
      } else {
        children = state.pages.find(pg => {
          return pg.name === compo.parent
        })?.children || []
      }
      if (index !== -1) {
        children.splice(index, replace ? 1 : 0, compo)
      } else {
        children.push(compo)
      }
    },
    DEL_COMPO (state, payload: string) {
      if (state.components[payload]) {
        const delCompo = state.components[payload]
        for (const compo of delCompo.children) {
          delete state.components[compo.name]
        }
        delete state.components[payload]
        const parent = state.components[delCompo.parent]
          || state.pages.find(page => page.name === delCompo.parent)
        const cmpIdx = parent.children.findIndex(cmp => cmp.name === payload)
        parent.children.splice(cmpIdx, 1)
      } else {
        const pgIdx = state.pages.findIndex(page => page.name === payload)
        if (pgIdx === -1) {
          return
        }
        for (const compo of state.pages[pgIdx].children) {
          delete state.components[compo.name]
        }
        state.pages.splice(pgIdx, 1)
      }
      state.selPage = state.pages[0] || dftPage
      state.selCompo = dftCompo
    },
    RST_COMPO (state) {
      state.selCompo = dftCompo
    },
    SET_OPER (state, payload: OperType) {
      state.curOper = payload
    },
    ADD_MDFD_COMPO (state, payload: string[] = []) {
      state.mdfdCompos.push(...payload)
    },
    RMV_MDFD_COMPO (state, payload: string) {
      state.mdfdCompos.splice(state.mdfdCompos.indexOf(payload), 1)
    },
    SAVE_ATTR (state, payload: {
      prop: string,
      entry: Field | Attr,
      copy: (src: any, tgt?: Field | Attr) => Field | Attr
    }) {
      if (!state.selPage.name) {
        return
      }
      let props = state.selPage[payload.prop]
      if (typeof props === 'undefined') {
        for (const prop of payload.prop.split('.')) {
          props = props ? props[prop] : state.selPage[prop]
        }
        if (typeof props === 'undefined') {
          return
        }
      }
      if (!props.length) {
        state.selPage[payload.prop] = []
      }
      if (payload.entry.key === -1) {
        const newOne = payload.copy(payload.entry)
        newOne.key = props.length
        props.push(newOne)
      } else {
        const idx = props.findIndex((item: any) => {
          return item.key === payload.entry.key
        })
        if (idx !== -1) {
          props[idx] = payload.copy(payload.entry)
        }
      }
    },
    DEL_ATTR (state, payload: {
      prop: string,
      key: number
    }) {
      if (!state.selPage.name) {
        return
      }
      let props = state.selPage[payload.prop]
      if (typeof props === 'undefined') {
        for (const prop of payload.prop.split('.')) {
          props = props ? props[prop] : state.selPage[prop]
        }
        if (typeof props === 'undefined') {
          return
        }
      }
      const idx = props.findIndex((item: any) => {
        return item.key === payload.key
      })
      if (idx !== -1) {
        props.splice(idx, 1)
      }
      for (let i = 0; i < props.length; ++i) {
        props[i].key = i
      }
    },
    ADD_CLASS (state, payload: Clazz) {
      const page = state.pages.find((page: Page) => {
        return page.name === payload.belong
      })
      if (!page) {
        return
      }
      const clazz = Clazz.copy(payload)
      clazz.key = page.classes.length
      page.classes.push(clazz)
    },
    SET_DD_VISIBLE (state, payload: boolean) {
      state.dragDropVisible = payload
    },
    SET_DD_INFO (state, payload: {
      dragCompo?: string,
      dropCompo?: string,
      dropPos?: DropPos
    }) {
      if (typeof payload.dragCompo !== 'undefined') {
        state.dragDropInfo.dragCompo = payload.dragCompo
      }
      if (typeof payload.dropCompo !== 'undefined') {
        state.dragDropInfo.dropCompo = payload.dropCompo
      }
      if (typeof payload.dropPos !== 'undefined') {
        state.dragDropInfo.dropPos = payload.dropPos
      }
    }
  },
  actions: {
    async initialize (ctx) {
      message.loading('加载中……')
      await new Promise(resolve => setTimeout(resolve, 1000))
      ctx.commit('INIT_PAGES')
      message.destroy()
    },
    chgCompoPos ({ commit, state, getters }, dragDropInfo: DragDropInfo) {
      const dragCompo = state.components[dragDropInfo.dragCompo]
      const dropCompo = state.components[dragDropInfo.dropCompo]
      const dropParent = getters.compoByName(dropCompo.parent)
      // 从drag组件的父类中删除它（因为drag组件和drop组件有可能在一个父组件中，
      // 所以先删除drag组件以免影响之后drop组件的索引）
      const dragParent = getters.compoByName(dragCompo.parent)
      const dragIndex = dragParent.children.findIndex((compo: Compo) => {
        return compo.name === dragCompo.name
      })
      dragParent.children.splice(dragIndex, 1)
      const dropIndex = dropParent.children.findIndex((compo: Compo) => {
        return compo.name === dropCompo.name
      })

      const parentIsInlBlk =
        dragCompo.parent === dropCompo.parent &&
        dropParent.layout.display === 'inline-flex'
      let inlBlock = null
      switch (dragDropInfo.dropPos) {
      case 'top':
        dropParent.children.splice(dropIndex - 1, 0, dragCompo)
        break
      case 'left':
        if (parentIsInlBlk) {
          inlBlock = dropParent
          inlBlock.children.splice(dropIndex - 1, 0, dragCompo)
        } else {
          inlBlock = new Compo()
          inlBlock.name = 'inlineBlock001'
          inlBlock.ctype = 'Block'
          inlBlock.parent = dropCompo.parent
          inlBlock.layout.display = 'inline-flex'
          inlBlock.children = [dragCompo, dropCompo]
          commit('ADD_COMPO', {
            compo: inlBlock,
            index: dropIndex,
            replace: true
          })
          dragCompo.parent = inlBlock.name
          dropCompo.parent = inlBlock.name
        }
        break
      case 'inner':
        dropCompo.children.push(dragCompo)
        break
      case 'right':
        if (parentIsInlBlk) {
          inlBlock = dropParent
          inlBlock.children.splice(dropIndex + 1, 0, dragCompo)
        } else {
          inlBlock = new Compo()
          inlBlock.name = 'inlineBlock001'
          inlBlock.ctype = 'Block'
          inlBlock.parent = dropCompo.parent
          inlBlock.layout.display = 'inline-flex'
          inlBlock.children = [dropCompo, dragCompo]
          commit('ADD_COMPO', {
            compo: inlBlock,
            index: dropIndex,
            replace: true
          })
          dragCompo.parent = inlBlock.name
          dropCompo.parent = inlBlock.name
        }
        break
      case 'bottom':
        dropParent.children.splice(dropIndex + 1, 0, dragCompo)
        break
      default:
        return
      }
      commit('ADD_MDFD_COMPO', [
        dragDropInfo.dragCompo,
        dragDropInfo.dropCompo
      ])
    }
  },
  getters: {
    designType (state): DesignType {
      return state.dsgnType
    },
    uiFrameworks (state): UiFramework[] {
      return state.uiFrameworks
    },
    uiFramework (state) {
      return state.selUiFramework
    },
    uiLibrary (state) {
      return state.selUiLibrary
    },
    cmpModByName: (state) => (name: string): any =>  {
      return state.compoLibrary.find(cmp => cmp.name === name)
    },
    compoInfos (state): CompoInfo[] {
      return state.compoLibrary
    },
    seledPage (state): Page {
      return state.selPage
    },
    seledCompo (state): Compo {
      return state.selCompo
    },
    curOper (state): OperType {
      return state.curOper
    },
    pages (state): Page[] {
      return state.pages
    },
    pageNames (state): string[] {
      return state.pages.map(page => page.name)
    },
    pageByName: (state) => (name: string): Page | undefined => {
      return state.pages.find((page: Page) => page.name === name)
    },
    compoNames (state): string[] {
      return Object.keys(state.components)
    },
    compoByName: (state) => (name: string): Compo => {
      return state.components[name] || state.pages.find((page: Page) => page.name === name)
    },
    isCompo: (state) => (name: string): boolean => {
      return name in state.components
    },
    avaTypes (state): string[] {
      return state.avaTypes
    },
    modifiedCompos (state): string[] {
      return state.mdfdCompos
    },
    showDragDrop (state) {
      return state.dragDropVisible
    },
    dragDropInfo (state) {
      return state.dragDropInfo
    }
  },
  modules: {
  }
})
