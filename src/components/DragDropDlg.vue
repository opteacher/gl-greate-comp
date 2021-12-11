<template>
<a-modal
  title="插入位置"
  :visible="showDragDrop"
  :footer="null"
  centered
  @cancel="store.commit('SET_DD_VISIBLE', false)"
>
  <a-row :gutter="16">
    <a-col :span="8" :offset="8">
      <a-button
        class="w-100" type="primary"
        @click="onDropPosClicked('top')"
      >上方</a-button>
    </a-col>
  </a-row>
  <a-row class="mtb-16" :gutter="16">
    <a-col :span="8">
      <a-button
        class="w-100" type="primary"
        @click="onDropPosClicked('left')"
      >左边</a-button>
    </a-col>
    <a-col :span="8">
      <a-button
        class="w-100" type="primary"
        @click="onDropPosClicked('inner')"
      >内部</a-button>
    </a-col>
    <a-col :span="8">
      <a-button
        class="w-100" type="primary"
        @click="onDropPosClicked('right')"
      >右边</a-button>
    </a-col>
  </a-row>
  <a-row :gutter="16">
    <a-col :span="8" :offset="8">
      <a-button
        class="w-100" type="primary"
        @click="onDropPosClicked('bottom')"
      >下方</a-button>
    </a-col>
  </a-row>
</a-modal>
</template>

<script lang="ts">
import { DropPos } from '@/common'
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'DragDropDialog',
  emit: ['dropPosClick'],
  setup (_props, { emit }) {
    const store = useStore()
    const showDragDrop = computed(() => store.getters.showDragDrop)

    function onDropPosClicked (pos: string) {
      emit('dropPosClick', pos as DropPos)
    }
    return {
      store,
      showDragDrop,

      onDropPosClicked
    }
  }
})
</script>
