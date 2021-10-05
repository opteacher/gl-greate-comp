<template>
<a-layout>
  <a-layout-header class="fix-tops">
    <p style="color: white; margin-bottom: 0">Header</p>
  </a-layout-header>
  <oper-box/>
  <a-layout class="body-layout">
    <a-layout-sider theme="light" :width="300" :style="{
      'border-right': '1px solid rgb(240, 242, 245)',
      'overflow-y': 'auto'
    }">
      <compo-box/>
    </a-layout-sider>
    <a-layout-content id="ctrMain" style="flex: 1; overflow: scroll">
      <div
        v-if="store.getters.designType === 'frontend'"
        id="pnlMain" class="main-container"
      >
        <page-card
          v-for="page in pages"
          :key="page.name"
          :page="page"
          :ref="el => { page.ref = el }"
        />
      </div>
      <div
        v-else-if="store.getters.designType === 'backend'"
        class="w-100 h-100"
      >
        <backend-panel/>
      </div>
    </a-layout-content>
    <a-layout-sider theme="light" :width="300" :style="{
      'border-left': '1px solid rgb(240, 242, 245)'
    }">
      <struct-box/>
    </a-layout-sider>
  </a-layout>
  <a-layout-footer class="fix-bottom plr-0">
    <footer-info-box/>
  </a-layout-footer>
</a-layout>
<a-modal
  :visible="addCmpVisible"
  title="指定组件添加的页面"
  @ok="onAddCmpSubmit"
  @cancel="store.commit('SET_ADD_CMP_DLG', false)"
>
  <add-compo-form ref="addCmpFormRef"/>
</a-modal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, toRaw, watch } from 'vue'
import CompoBox from '../components/CompoBox.vue'
import OperBox from '../components/OperBox.vue'
import StructBox from '../components/StructBox.vue'
import PageCard from '../components/PageCard.vue'
import AddCompoForm from '../components/AddCompoForm.vue'
import FooterInfoBox from '../components/FooterInfoBox.vue'
import BackendPanel from '../components/BackendPanel.vue'
import { useStore } from 'vuex'
import { Compo, Property, CompoType, waitFor, until } from '@/common'
import propsRess from '../test_ress/properties.json'
import { notification } from 'ant-design-vue'
import { useRouter } from 'vue-router'
export default defineComponent({
  name: 'MainPanel',
  components: {
    CompoBox,
    OperBox,
    StructBox,
    PageCard,
    AddCompoForm,
    FooterInfoBox,
    BackendPanel
  },
  setup () {
    const store = useStore()
    // const router = useRouter()
    // if (!store.getters.uiFramework || !store.getters.uiLibrary) {
    //   router.push({ path: '/create' })
    // }
    const pages = computed(() => store.getters.pages)
    const addCmpVisible = computed(() => store.getters.addCmpActive)
    const addCmpFormRef = ref()
    const rszObs = new ResizeObserver(async () => {
      for (const page of pages.value) {
        const pageRef = await until(() => page.ref)
        if (!pageRef) {
          continue
        }
        pageRef.onSizeChanged()
      }
    })
    const actTab = ref('frontend')

    onMounted(async () => {
      await store.dispatch('initialize')
      // @_@：测试用
      store.commit('SEL_NODE', 'item001')

      const el = await waitFor('ctrMain')
      if (!el) {
        return
      }
      rszObs.observe(el as Element)
    })
    watch(() => store.getters.seledPage, () => {
      const ctrMain = document.getElementById('ctrMain')
      if (!ctrMain) {
        return
      }
      const ctrMainWid = ctrMain.clientWidth || 0
      const scrollX = store.getters.seledPage.index * ctrMainWid
      const step = (scrollX - ctrMain.scrollLeft) / 10
      const h = setInterval(() => {
        if (Math.abs(scrollX - ctrMain.scrollLeft) <= Math.abs(step)) {
          clearInterval(h)
        }
        console.log('TTTTTTTTTTTTTTTTT')
        ctrMain.scrollLeft += step
      }, 10)
    })

    async function onAddCmpSubmit () {
      try {
        await addCmpFormRef.value.formRef.validate()
        const formState = toRaw(addCmpFormRef.value.formState)

        const compo = new Compo()
        compo.name = formState.name
        compo.parent = formState.parent
        for (const prop of (propsRess.data[formState.type as CompoType] as any)
          .map((item: any) => Property.copy(item))
        ) {
          if (prop.key === 'name' || prop.key === 'parent') {
            continue
          }
          if (prop.value) {
            compo[prop.key] = prop.value
          }
        }
        store.commit('ADD_COMPO', compo)
        addCmpFormRef.value.formRef.resetFields()
        store.commit('SET_ADD_CMP_DLG', false)
      } catch (e) {
        notification.error({
          message: '添加组件失败！',
          description: JSON.stringify(e)
        })
      }
    }
    return {
      store,
      pages,
      actTab,
      addCmpVisible,
      addCmpFormRef,

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
