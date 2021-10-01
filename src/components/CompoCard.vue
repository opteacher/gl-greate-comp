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
<keep-alive>
  <component :is="curTab"
    :class="{ 'card-active': isActive }"
    v-bind="component.toAttributes()"
  />
</keep-alive>
</template>

<script lang="ts">
import { Compo, Point, PosType, Rect } from '@/common'
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { loadCompos } from '../common'
import compoData from '../test_ress/components.json'

interface Mask {
  area: Rect
  position: PosType
}
export default defineComponent({
  name: 'ComponentCard',
  components: loadCompos(),
  props: {
    compo: { type: Compo, required: true },
  },
  setup (props) {
    const store = useStore()
    const component = reactive(props.compo)
    const isActive = computed(() => {
      return store.getters.seledCompo.name === component.name
    })
    const mask = reactive({
      area: new Rect(),
      position: 'absolute'
    } as Mask)
    const mousedown = reactive(new Point(-1, -1))
    const compoInfo = compoData.data.find(compo => {
      return compo.name === component.ctype
    })
    const curTab = ref(compoInfo?.tag)

    onMounted(updMask)

    function updMask () {
      const els = document.getElementsByName(component.name)
      const el: HTMLElement = els[0]
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
      mousedown.x = e.clientX - component.position.left[0]
      mousedown.y = e.clientY - component.position.top[0]
    }
    function onMouseMove (e: MouseEvent) {
      if (document.body.style.cursor === 'default') {
        document.body.style.cursor = 'pointer'
      }
      if (component.position.position === 'static') {
        return
      }
      switch (store.getters.curOper) {
      case 'move':
        if (mousedown.isValuable()) {
          component.position.left[0] = e.clientX - mousedown.x
          component.position.top[0] = e.clientY - mousedown.y
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
      component,
      isActive,
      mask,
      mousedown,
      curTab,

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
