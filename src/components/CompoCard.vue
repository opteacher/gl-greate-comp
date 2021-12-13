<template>
<div :draggable="false"
  @dragstart.stop="onDragStart"
  @dragend.stop="onDragEnd"
  @dragenter="onDragEnter"
  @dragleave="onDragLeave"
  @drop.stop="onDragDrop"
  @dragover.prevent
>
  <div
    :style="{
      position: 'absolute',
      left: `${compo.mask.left}px`,
      top: `${compo.mask.top}px`,
      width: `${compo.mask.width}px`,
      height: `${compo.mask.height}px`,
      'z-index': 50,
      'background-color': 'transparent',
    }"
    @click="onCompoClicked"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  />
  <keep-alive v-if="compo.tag">
    <component :is="compo.tag"
      :class="{
        'card-active': isActive,
        'card-drag-in': isDragIn
      }"
      v-bind="compo.toAttributes()"
    >
      <template v-if="!compo.children.length">
        {{compo['#inner']}}
      </template>
      <component-card v-else
        v-for="subCmp in compo.children"
        :key="subCmp.name" :compo="subCmp"
      />
    </component>
  </keep-alive>
</div>
<drag-drop-dlg @dropPosClick="onDropPosClicked"/>
</template>

<script lang="ts">
import { Compo, DropPos, Point, PosType, Rect } from '@/common'
import { waitFor } from '@/utils'
import { computed, defineComponent, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
import DragDropDlg from './DragDropDlg.vue'
interface Mask {
  area: Rect
  position: PosType
}
export default defineComponent({
  name: 'ComponentCard',
  components: {
    DragDropDlg
  },
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
    const mousedown = reactive(new Point(-1, -1))
    const rszObs = new ResizeObserver(updMask)
    const isDragIn = ref(false)

    onMounted(async () => {
      const el = await waitFor(props.compo.name, undefined, 5)
      if (!el) {
        return
      }
      rszObs.observe(el as Element)
      updMask()
    })
    watch(() => store.getters.modifiedCompos.length, () => {
      if (store.getters.modifiedCompos.includes(props.compo.name)) {
        store.commit('RMV_MDFD_COMPO', props.compo.name)
        nextTick(() => {
          if (isActive.value) {
            isDragIn.value = false
          }
          updMask()
        })
      }
    })

    function updMask () {
      store.commit('UPD_MASK', props.compo.name)
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
          store.commit('SET_PROP_VAL', [{
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
    function onDragEnter () {
      if (!isActive.value) {
        isDragIn.value = true
      }
    }
    function onDragLeave () {
      isDragIn.value = false
    }
    function onDragStart (event: DragEvent) {
      event.dataTransfer?.setData('text/plain', props.compo.name)
    }
    function onDragEnd (event: DragEvent) {
      event.dataTransfer?.clearData()
    }
    function onDragDrop (event: DragEvent) {
      if (isActive.value) {
        return
      }
      store.commit('SET_DD_INFO', {
        dragCompo: event.dataTransfer?.getData('text/plain'),
        dropCompo: props.compo.name
      })
      store.commit('SET_DD_VISIBLE', true)
      isDragIn.value = false
    }
    function onDropPosClicked (pos: DropPos) {
      store.commit('SET_DD_INFO', { dropPos: pos })
      store.dispatch('chgCompoPos', store.getters.dragDropInfo)
      store.commit('SET_DD_VISIBLE', false)
    }
    return {
      isActive,
      isDragIn,
      mousedown,

      onCompoClicked,
      onMouseDown,
      onMouseMove,
      onMouseEnter,
      onMouseLeave,
      onMouseUp,
      onDragStart,
      onDragEnd,
      onDragEnter,
      onDragLeave,
      onDragDrop,
      onDropPosClicked
    }
  }
})
</script>

<style lang="less" scoped>
.card-drag-in {
  border: 2px solid black;
}
</style>
