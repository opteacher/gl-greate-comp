import {
  Clazz,
  ClsProp,
  Compo,
  CompoInfo,
  CompoType,
  copyUiFmwk,
  Field,
  OperType,
  Page,
  StrIterable,
  Table,
  UiFramework,
  Unit
} from '@/common'
import { createStore } from 'vuex'
import pageRess from '../test_ress/pages.json'
import tableRess from '../test_ress/tables.json'
import uiInfoRess from '../test_ress/uiFramworks.json'
import compoRess from '@/test_ress/element-ui-vue_1.1.0-beta.19.json'
import { message } from 'ant-design-vue'

const dftCompo = new Compo()
const dftPage = new Page()
const dftTable = new Table()
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
    selTable: dftTable,
    tables: [] as Table[],
    curOper: 'move' as OperType,
    addCompo: { show: false } as SetAddCmpDlg
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
      state.tables = tableRess.data.map(table => Table.copy(table))
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
    SEL_TABLE (state, payload: string) {
      state.selTable = state.tables.find(table => {
        return table.name === payload
      }) || dftTable
    },
    ADD_TABLE (state, payload: any) {
      state.tables.push(Table.copy(payload))
      state.selTable = state.tables[state.tables.length - 1]
    },
    SAVE_FIELD (state, payload: Field) {
      if (!state.selTable) {
        return
      }
      if (!state.selTable.fields) {
        state.selTable.fields = []
      }
      if (payload.key === -1) {
        const newField = Field.copy(payload)
        newField.key = state.selTable.fields.length
        state.selTable.fields.push(newField)
      } else {
        const idx = state.selTable.fields
          .findIndex((field: Field) => {
            return field.key === payload.key
          })
        if (idx === -1) {
          return
        }
        state.selTable.fields[idx] = Field.copy(payload)
      }
    },
    DEL_FIELD (state, payload: number) {
      const fIdx = state.selTable?.fields
        .findIndex((field: Field) => field.key === payload)
      if (fIdx !== -1) {
        state.selTable?.fields.splice(fIdx as number, 1)
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
    SAVE_CLASS_PROP (state, payload: {
      clazz: Clazz, prop: ClsProp
    }) {
      const page = state.pages.find((page: Page) => {
        return page.name === payload.clazz.belong
      })
      if (!page || payload.clazz.key >= page.classes.length) {
        return
      }
      const props = page.classes[payload.clazz.key].props
      const prop = ClsProp.copy(payload.prop)
      if (prop.key === -1) {
        props.push(prop)
      } else {
        props[prop.key] = prop
      }
    },
    SAVE_PARAM (state, payload: ClsProp) {
      state.selPage.params.push(ClsProp.copy(payload))
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
    tables (state): Table[] {
      return state.tables
    },
    tableNames (state): string[] {
      return state.tables.map(tbl => tbl.name)
    },
    selTblName (state): string {
      return state.selTable ? state.selTable.name : ''
    },
    seledTable (state): (Table | undefined) {
      return state.selTable
    }
  },
  modules: {
  }
})
