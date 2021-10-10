<template>
<div
  :style="{
    position: mask.position,
    left: `${mask.area.left}px`,
    top: `${mask.area.top}px`,
    width: `${mask.area.width}px`,
    height: `${mask.area.height}px`,
    'z-index': 50,
    'background-color': 'transparent',
  }"
  @click="onCompoClicked"
  @mousedown="onMouseDown"
  @mousemove="onMouseMove"
  @mouseenter="onMouseEnter"
  @mouseleave="onMouseLeave"
  @mouseup="onMouseUp"
/>
<keep-alive v-if="compo.tag">
  <component :is="compo.tag"
    :class="{ 'card-active': isActive }"
    v-bind="compo.toAttributes()"
  >
    {{compo['#inner']}}
  </component>
</keep-alive>
</template>

<script lang="ts">
import { Compo, Point, PosType, Rect } from '@/common'
import { waitFor } from '@/utils'
import { computed, defineComponent, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
interface Mask {
  area: Rect
  position: PosType
}
export default defineComponent({
  name: 'ComponentCard',
  props: {
    compo: { type: Compo, required: true },
  },
  // 无法动态加载UI库组件，现阶段只能全部导入，页面会很大，而且存在tag、css冲突的风险
  // async created () {
  //   const store = useStore()
  //   try {
  //     const cmpMod = await until(() => {
  //       return store.getters.cmpModByName(this.$props.compo.ctype)
  //     })
  //     if (cmpMod) {
  //       if (!this.$options.components) {
  //         this.$options.components = {}
  //       }
  //       this.$options.components[cmpMod.tag] = cmpMod.imported
  //     } else {
  //       throw new Error(`未找到指定的组件：${this.$props.compo.ctype}`)
  //     }
  //   } catch (e) {
  //     notification.error({
  //       message: '组件加载错误！',
  //       description: e.message || JSON.stringify(e),
  //     })
  //   }
  // },
  setup (props) {
    const store = useStore()
    const isActive = computed(() => {
      return store.getters.seledCompo.name === props.compo.name
    })
    const mask = reactive({
      area: new Rect(),
      position: 'absolute'
    } as Mask)
    const mousedown = reactive(new Point(-1, -1))
    const rszObs = new ResizeObserver(updMask)

    onMounted(async () => {
      const el = await waitFor(props.compo.name, undefined, 5)
      if (!el) {
        return
      }
      rszObs.observe(el as Element)
      updMask()
    })

    function updMask () {
      const el: HTMLElement | null = document
        .getElementById(props.compo.name)
      if (!el) {
        return
      }
      mask.area.left = el.offsetLeft
      mask.area.top = el.offsetTop
      mask.area.width = el.offsetWidth
      mask.area.height = el.offsetHeight
    }
    function onCompoClicked () {
      store.commit('SEL_NODE', props.compo.name)
      onMouseEnter()
    }
    function onMouseDown (e: MouseEvent) {
      mousedown.x = e.clientX - props.compo.position.left[0]
      mousedown.y = e.clientY - props.compo.position.top[0]
    }
    function onMouseMove (e: MouseEvent) {
      if (document.body.style.cursor === 'default') {
        document.body.style.cursor = 'pointer'
      }
      if (props.compo.position.position === 'static') {
        return
      }
      switch (store.getters.curOper) {
      case 'move':
        if (mousedown.isValuable()) {
          store.commit('SET_PROP_VALUE', [{
            key: 'position.left',
            value: e.clientX - mousedown.x
          }, {
            key: 'position.top',
            value: e.clientY - mousedown.y
          }])
          updMask()
        }
        break
      }
    }
    function onMouseEnter () {
      if (!isActive.value) {
        return
      }
      switch (store.getters.curOper) {
      case 'move':
        document.body.style.cursor = 'move'
        break
      }
    }
    function onMouseLeave () {
      document.body.style.cursor = 'default'
    }
    function onMouseUp () {
      mousedown.toInvaluable()
      updMask()
    }
    return {
      isActive,
      mask,
      mousedown,

      onCompoClicked,
      onMouseDown,
      onMouseMove,
      onMouseEnter,
      onMouseLeave,
      onMouseUp,
    }
  }
})
</script>
