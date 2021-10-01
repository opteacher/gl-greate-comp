<template>
<div
  :name="page.name"
  class="white-bkgd"
  :class="{ 'card-active': isActive }"
  :style="styles"
>
  <a-empty class="mt-10"
    v-if="!page.children.length"
    description="从左侧组件栏添加组件"
  />
  <compo-card
    v-else
    v-for="compo in page.children"
    :key="compo.name"
    :compo="compo"
  />
</div>
</template>

<script lang="ts">
import { buildStyles, Page, Unit } from '@/common'
import { computed, defineComponent, onMounted } from 'vue'
import { useStore } from 'vuex'
import CompoCard from '../components/CompoCard.vue'
export default defineComponent({
  name: 'PageCard',
  components: {
    CompoCard
  },
  props: {
    page: { type: Page, required: true }
  },
  setup (props) {
    const store = useStore()
    const isActive = computed(() => {
      return !store.getters.seledCompo.name
        && store.getters.seledPage.name === props.page.name
    })
    const styles = computed(() => {
      return [
        'position: absolute',
        `left: ${props.page.position.left[0]}px`,
        `top: ${props.page.position.top[0]}px`,
        buildStyles(props.page)
      ].join(';')
    })

    onMounted(() => {
      const ctrMain = document.getElementById('ctrMain')
      const ctrMainWid = ctrMain?.clientWidth || 0
      const ctrMainHgt = ctrMain?.clientHeight || 0
      const pages = document.getElementsByName(props.page.name)
      const thsPage = pages[0]
      const thsPageWid = thsPage.clientWidth
      const thsPageHgt = thsPage.clientHeight
      store.commit('SEL_NODE', props.page.name)
      store.commit('SET_PROP_VALUE', {
        key: 'position.left',
        value: (ctrMainWid * props.page.index) +
          (ctrMainWid >> 1) - (thsPageWid >> 1),
        unit: Unit.px
      })
      store.commit('SET_PROP_VALUE', {
        key: 'position.top',
        value: (ctrMainHgt >> 1) - (thsPageHgt >> 1),
        unit: Unit.px
      })
      store.commit('SET_PROP_VALUE', {
        key: 'size.width',
        value: thsPageWid,
        unit: Unit.px
      })
      store.commit('SET_PROP_VALUE', {
        key: 'size.height',
        value: thsPageHgt,
        unit: Unit.px
      })
    })
    return {
      isActive,
      styles
    }
  }
})
</script>
