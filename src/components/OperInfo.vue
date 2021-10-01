<template>
<a-descriptions>
  <a-descriptions-item v-if="seledObj" class="pb-0" label="选中对象">
    {{seledObj}}
  </a-descriptions-item>
  <a-descriptions-item class="pb-0" label="鼠标位置">
    {{mousePos.x}},{{mousePos.y}}
  </a-descriptions-item>
</a-descriptions>
</template>

<script lang="ts">
import { Point } from '@/common'
import { computed, defineComponent, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'OperationInformation',
  setup () {
    const store = useStore()
    const mousePos = reactive(new Point())
    const seledCompo = computed(() => store.getters.seledCompo)
    const seledPage = computed(() => store.getters.seledPage)
    const seledObj = computed(() => seledCompo.value.name || seledPage.value.name)

    onMounted(() => {
      const pnlMain = document.getElementById('pnlMain')
      if (!pnlMain) {
        return
      }
      pnlMain.onmousemove = (e: MouseEvent) => {
        mousePos.x = e.clientX
        mousePos.y = e.clientY
      }
    })

    return {
      mousePos,
      seledObj
    }
  }
})
</script>
