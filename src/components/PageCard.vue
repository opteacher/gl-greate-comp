<template>
<div
  :id="page.name"
  class="white-bkgd"
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
import { buildStyles, Page, Rect } from '@/common'
import { waitFor } from '@/utils'
import { computed, defineComponent, onMounted, reactive } from 'vue'
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
    const styles = computed(() => {
      return [
        'position: absolute',
        `left: ${area.left}px`,
        `top: ${area.top}px`,
        buildStyles(props.page)
      ].join(';')
    })
    const area = reactive(new Rect())
    const rszObs = new ResizeObserver(onSizeChanged)

    onMounted(async () => {
      onSizeChanged()
      const el = await waitFor(props.page.name, { loop: 5 })
      if (!el) {
        throw new Error('未找到组件在页面上的元素')
      }
      rszObs.observe(el as Element)
    })

    function onSizeChanged () {
      const ctrMain = document.getElementById('ctrMain')
      if (!ctrMain) {
        return
      }
      const ctrMainWid = ctrMain?.clientWidth || 0
      const ctrMainHgt = ctrMain?.clientHeight || 0
      const thsPage = document.getElementById(props.page.name)
      if (!thsPage) {
        return
      }
      area.width = thsPage.clientWidth
      area.height = thsPage.clientHeight
      area.left = (ctrMainWid * props.page.index) +
        (ctrMainWid >> 1) - (area.width >> 1)
      area.top = (ctrMainHgt >> 1) - (area.height >> 1)
    }
    return {
      styles,
      onSizeChanged,
    }
  }
})
</script>
