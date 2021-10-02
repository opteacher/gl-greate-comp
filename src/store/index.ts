import { Compo, CompoInfo, CompoType, OperType, Page, StrIterable, Unit } from '@/common'
import { createStore } from 'vuex'
import pagesRess from '../test_ress/pages.json'
import compoRess from '@/test_ress/components.json'

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

export default createStore({
  state: {
    pages: [] as Page[],
    components: {} as { [name: string]: Compo },
    compoStore: [] as CompoInfo[],
    selPage: dftPage,
    selCompo: dftCompo,
    curOper: 'move' as OperType,
    addCompo: { show: false } as SetAddCmpDlg
  },
  mutations: {
    INIT_PAGES (state) {
      state.compoStore = compoRess.data.map((compo: any) => {
        return CompoInfo.copy(compo)
      })
      state.pages = pagesRess.data.map(page => Page.copy(page))
      const scanCompos = (parent: Compo) => {
        state.components[parent.name] = parent
        for (const compo of parent.children) {
          state.components[compo.name] = compo
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
    }
  },
  actions: {
    async initialize (ctx) {
      ctx.commit('INIT_PAGES')
    }
  },
  getters: {
    allCompoInfos (state): CompoInfo[] {
      return state.compoStore
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
    allPageNames (state): string[] {
      return state.pages.map(page => page.name)
    },
    allCompoNames (state): string[] {
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
    }
  },
  modules: {
  }
})
