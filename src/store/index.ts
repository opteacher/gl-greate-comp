import { Compo, OperType, Page, StrIterable, Unit } from '@/common'
import { createStore } from 'vuex'
import pagesData from '../test_ress/pages.json'

const dftCompo = new Compo()
const dftPage = new Page()

export default createStore({
  state: {
    pages: [] as Page[],
    components: {} as { [name: string]: Compo },
    selPage: dftPage,
    selCompo: dftCompo,
    curOper: 'move' as OperType,
  },
  mutations: {
    INIT_PAGES (state) {
      state.pages = pagesData.data.map(page => Page.copy(page))
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
        const page = state.pages.find(page => {
          return page.name === compo.name
        }) || dftPage
        if (page.name !== state.selPage.name) {
          state.selPage = page
        }
        state.selCompo = compo
      } else {
        state.selCompo = dftCompo
        state.selPage = state.pages.find(pg => pg.name === payload) || dftPage
      }

      const pnlMain = document.getElementById('pnlMain')
      if (!pnlMain) {
        return
      }
      pnlMain.onmouseup = (e: MouseEvent) => {
        const selNode = state.selCompo.name ? state.selCompo : state.selPage
        if (!selNode.isInside(e.clientX, e.clientY)) {
          state.selCompo = dftCompo
          state.selPage = dftPage
          pnlMain.onmouseup = null
        }
      }
    },
    SET_PROP_VALUE (state, payload: {
      key: string, value?: any, unit?: Unit
    }) {
      const keys = payload.key.split('.')
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
      const key = preKey ? keys[1] : payload.key
      const value = payload.unit ? [
        payload.value || selected[key][0],
        payload.unit
      ] : payload.value
      selected[key] = value
    },
    RST_COMPO (state) {
      state.selCompo = dftCompo
    },
    SET_OPER (state, payload: OperType) {
      state.curOper = payload
    }
  },
  actions: {
    async initialize (ctx) {
      ctx.commit('INIT_PAGES')
    }
  },
  getters: {
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
    allCompoNames (state): string[] {
      return Object.keys(state.components)
    },
    compoByName: (state) => (name: string): Compo => {
      return state.components[name]
    }
  },
  modules: {
  }
})
