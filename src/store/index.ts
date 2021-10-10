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
  DataSrc
} from '@/common'
import { createStore } from 'vuex'
import pageRess from '../test_ress/pages.json'
import uiInfoRess from '../test_ress/uiFramworks.json'
import compoRess from '@/test_ress/element-ui-vue_1.1.0-beta.19.json'
import { message } from 'ant-design-vue'

const dftCompo = new Compo()
const dftPage = new Page()
interface SetPropParam {
  key: string, value?: any, unit?: Unit
}
interface SetAddCmpDlg {
  show: boolean
  cmpTyp?: CompoType
  belong?: string
}

export type DesignType = 'frontend' | 'backend'

export default createStore({
  state: {
    dsgnType: 'backend' as DesignType,
    uiFrameworks: [] as UiFramework[],
    selUiFramework: '',
    selUiLibrary: '',
    pages: [] as Page[],
    components: {} as { [name: string]: Compo },
    compoLibrary: [] as CompoInfo[],
    selPage: dftPage,
    selCompo: dftCompo,
    curOper: 'move' as OperType,
    addCompo: { show: false } as SetAddCmpDlg,
    avaTypes: basicTypes
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
        const cmpMod = state.compoLibrary.find(cmp => {
          return cmp.name === parent.ctype
        })
        parent.tag = cmpMod ? cmpMod.tag : ''
        state.components[parent.name] = parent
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
          ...basicTypes, ...state.selPage.classes
            .map((cls: any) => cls.name)
        ]
      }
    },
    SET_PROP_VALUE (state, payload: SetPropParam | SetPropParam[]) {
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
    ADD_COMPO (state, payload: Compo) {
      const cmpMod = state.compoLibrary.find(cmp => {
        return cmp.name === payload.ctype
      })
      payload.tag = cmpMod ? cmpMod.tag : ''
      state.components[payload.name] = payload
      if (state.components[payload.parent]) {
        state.components[payload.parent].children.push(payload)
      } else {
        const page = state.pages.find(pg => pg.name === payload.parent)
        page?.children.push(payload)
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
    SET_ADD_CMP_DLG (state, payload: boolean | SetAddCmpDlg) {
      if (typeof payload === "boolean") {
        state.addCompo.show = payload
        if (!payload) {
          state.addCompo.cmpTyp = undefined
          state.addCompo.belong = undefined
        }
      } else {
        state.addCompo = payload
      }
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
    SET_DATA_SRC (state, payload: DataSrc) {
      DataSrc.copy(payload, state.selPage.dataSrc)
    }
  },
  actions: {
    async initialize (ctx) {
      message.loading('加载中……')
      await new Promise(resolve => setTimeout(resolve, 1000))
      ctx.commit('INIT_PAGES')
      message.destroy()
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
    compoNames (state): string[] {
      return Object.keys(state.components)
    },
    compoByName: (state) => (name: string): Compo => {
      return state.components[name]
    },
    addCmpInfo (state): SetAddCmpDlg {
      return state.addCompo
    },
    addCmpActive (state): boolean {
      return state.addCompo.show
    },
    isCompo: (state) => (name: string): boolean => {
      return name in state.components
    },
    avaTypes (state): string[] {
      return state.avaTypes
    }
  },
  modules: {
  }
})
