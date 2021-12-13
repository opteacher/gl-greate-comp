<template>
<a-layout>
  <a-layout-header class="fix-tops">
    <top-menu-box/>
  </a-layout-header>
  <oper-box/>
  <a-layout class="body-layout">
    <a-layout-sider theme="light" :width="300" :style="{
      'border-right': '1px solid rgb(240, 242, 245)',
      'overflow-y': 'auto'
    }">
      <template v-if="dsgnType === 'frontend'">
        <compo-box @addCompo="onAddCmpOfTypeClicked"/>
        <struct-box @addCompo="onAddCmpOfParentClicked"/>
      </template>
      <class-enum-box v-else-if="dsgnType === 'backend'"/>
    </a-layout-sider>
    <a-layout-content id="ctrMain" style="flex: 1; overflow: scroll">
      <div
        v-if="dsgnType === 'frontend'"
        id="pnlMain" class="main-container"
      >
        <page-card
          v-for="page in pages"
          :key="page.name"
          :page="page"
          :ref="(el) => { pgRefs[page.name] = el }"
        />
      </div>
      <div
        v-else-if="dsgnType === 'backend'"
        class="w-100 h-100"
      >
        <backend-panel/>
      </div>
    </a-layout-content>
    <a-layout-sider theme="light" :width="300" :style="{
      'border-left': '1px solid rgb(240, 242, 245)'
    }">
      <props-box v-if="dsgnType === 'frontend'" @addCompo="onAddCmpOfParentClicked"/>
      <exp-vars-box v-else-if="dsgnType === 'backend'"/>
    </a-layout-sider>
  </a-layout>
  <a-layout-footer class="fix-bottom plr-0">
    <footer-info-box/>
  </a-layout-footer>
</a-layout>
<form-dialog
  :show="showAddCmp"
  @update:show="showAddCmp = $event"
  title="添加组件"
  :mapper="addCmpMapper"
  :object="addCmpForm"
  @submit="onAddCmpSubmit"
/>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch } from 'vue'
import CompoBox from '../components/CompoBox.vue'
import OperBox from '../components/OperBox.vue'
import PropsBox from '../components/PropsBox.vue'
import PageCard from '../components/PageCard.vue'
import FooterInfoBox from '../components/FooterInfoBox.vue'
import BackendPanel from '../components/BackendPanel.vue'
import TopMenuBox from '../components/TopMenuBox.vue'
import FormDialog from '../components/FormDialog.vue'
import ExpVarsBox from '../components/ExpVarsBox.vue'
import ClassEnumBox from '../components/ClassEnumBox.vue'
import StructBox from '../components/StructBox.vue'
import { useStore } from 'vuex'
import { waitFor, until } from '@/utils'
import { Compo, Mapper, AddCmpForm } from '@/common'
const addCmpMapper = new Mapper({
  name: {
    label: '组件名称',
    type: 'Input',
    rules: [
      { required: true, message: '请输入组件名称！', trigger: 'blur' }
    ]
  },
  gptp: {
    label: '组件类型',
    type: 'Cascader',
    options: [],
    rules: [
      { type: 'array', required: true, message: '请选择组件类型！', trigger: 'change' }
    ]
  },
  parent: {
    label: '加入的页面',
    type: 'Select',
    options: [],
    rules: [
      { required: true, message: '请选择组件父节点！', trigger: 'change' }
    ]
  }
})
export default defineComponent({
  name: 'MainPanel',
  components: {
    CompoBox,
    OperBox,
    PropsBox,
    PageCard,
    FooterInfoBox,
    BackendPanel,
    TopMenuBox,
    FormDialog,
    ExpVarsBox,
    ClassEnumBox,
    StructBox
  },
  setup () {
    const store = useStore()
    // const router = useRouter()
    // if (!store.getters.uiFramework || !store.getters.uiLibrary) {
    //   router.push({ path: '/create' })
    // }
    const dsgnType = computed(() => store.getters.designType)
    const pages = computed(() => store.getters.pages)
    const pgRefs = {} as { [pgName: string]: Ref }
    const rszObs = new ResizeObserver(async () => {
      for (const page of pages.value) {
        const pageRef = await until(() => pgRefs[page.name], 5)
        if (!pageRef || !pageRef.onSizeChanged) {
          continue
        }
        pageRef.onSizeChanged()
      }
    })
    const actTab = ref('frontend')
    const showAddCmp = ref(false)
    const addCmpForm = new AddCmpForm()

    onMounted(async () => {
      await store.dispatch('initialize')
      // @_@：测试用
      store.commit('SEL_NODE', 'item001')

      const el = await waitFor('ctrMain', { loop: 5 })
      if (!el) {
        return
      }
      rszObs.observe(el as Element)
    })
    watch(() => store.getters.seledPage, () => {
      const ctrMain = document.getElementById('ctrMain')
      if (!ctrMain || dsgnType.value !== 'frontend') {
        return
      }
      const ctrMainWid = ctrMain.clientWidth || 0
      const scrollX = store.getters.seledPage.index * ctrMainWid
      const step = (scrollX - ctrMain.scrollLeft) / 10
      const h = setInterval(() => {
        if (Math.abs(scrollX - ctrMain.scrollLeft) <= Math.abs(step)) {
          clearInterval(h)
        }
        ctrMain.scrollLeft += step
      }, 10)
    })
    watch(() => store.getters.pages.length, () => {
      for(const page of store.getters.pages) {
        pgRefs[page.name] = ref()
      }
      addCmpMapper['parent'].options = store.getters.pages
        .map((page: any) => page.name)
    })
    addCmpMapper['name'].rules?.push({
      validator: (_rule: any, value: string) => {
        if (store.getters.compoNames.includes(value)
        || store.getters.pageNames.includes(value)) {
          return Promise.reject('该名称已被占用')
        } else {
          return Promise.resolve()
        }
      }
    })
    watch(() => store.getters.compoInfos.length, () => {
      const options: any[] = []
      for (const cmpInf of store.getters.compoInfos) {
        let group = options.find(opn => cmpInf.group === opn.value)
        if (!group) {
          group = {
            value: cmpInf.group,
            label: cmpInf.group,
            children: []
          }
          options.push(group)
        }
        group.children.push({
          value: cmpInf.name,
          label: cmpInf.name
        })
      }
      addCmpMapper['gptp'].options = options
    })

    function onAddCmpOfTypeClicked (group: string, ctype: string) {
      showAddCmp.value = true
      addCmpForm.gptp = [group, ctype]
    }
    function onAddCmpOfParentClicked (parent: string) {
      showAddCmp.value = true
      addCmpForm.parent = parent
    }
    function onAddCmpSubmit (addCmp: AddCmpForm) {
      store.commit('ADD_COMPO', (new Compo()).initByForm(addCmp))
    }
    return {
      store,
      dsgnType,
      pages,
      pgRefs,
      actTab,
      showAddCmp,
      addCmpForm,
      addCmpMapper,

      onAddCmpOfTypeClicked,
      onAddCmpOfParentClicked,
      onAddCmpSubmit
    }
  }
})
</script>

<style lang="less" scoped>
.body-layout {
  position: fixed;
  top: 117px;
  bottom: 80px;
  left: 0;
  right: 0;
}

.oper-box-container {
  position: fixed;
  top: 64px;
  left: 300px;
  right: 300px;
  padding: 10px 6px;
  background-color: white;
  z-index: 50;
}

.main-container {
  position: relative;
  width: 10000px;
  height: 10000px;
  background-image: linear-gradient(
      90deg,
      rgba(180, 180, 180, 0.15) 10%,
      rgba(0, 0, 0, 0) 10%
    ),
    linear-gradient(rgba(180, 180, 180, 0.15) 10%, rgba(0, 0, 0, 0) 10%);
  background-size: 10px 10px;
}
</style>
