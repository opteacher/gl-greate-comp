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
      <compo-box :onCompoAddToPage="onCompoAddToPage"/>
    </a-layout-sider>
    <a-layout-content id="ctrMain" style="flex: 1; overflow: scroll">
      <div id="pnlMain" class="main-container">
        <page-card
          v-for="page in pages"
          :key="page.name"
          :page="page"
        />
      </div>
    </a-layout-content>
    <a-layout-sider theme="light" :width="300" :style="{
      'border-left': '1px solid rgb(240, 242, 245)'
    }">
      <struct-box/>
    </a-layout-sider>
  </a-layout>
  <a-layout-footer class="fix-bottom plr-20">
    <a-row type="flex">
      <a-col flex="1">
        <oper-info/>
      </a-col>
      <a-col flex="1"/>
      <a-col flex="1"/>
    </a-row>
  </a-layout-footer>
</a-layout>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, watch } from 'vue'
import CompoBox from '../components/CompoBox.vue'
import OperBox from '../components/OperBox.vue'
import StructBox from '../components/StructBox.vue'
import PageCard from '../components/PageCard.vue'
import OperInfo from '../components/OperInfo.vue'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'MainPanel',
  components: {
    CompoBox,
    OperBox,
    StructBox,
    PageCard,
    OperInfo,
  },
  setup () {
    const store = useStore()
    const pages = computed(() => store.getters.pages)

    onMounted(async () => {
      await store.dispatch('initialize')
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

    function onCompoAddToPage (page: string) {
      console.log(page)
    }
    return {
      pages,
      onCompoAddToPage
    }
  }
})
</script>

<style lang="less" scoped>
.body-layout {
  position: fixed;
  top: 117px;
  bottom: 70px;
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
