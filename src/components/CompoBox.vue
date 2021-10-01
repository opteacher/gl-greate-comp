<template>
<div class="plr-10" style="overflow-y: scroll">
  <a-list item-layout="horizontal" :data-source="components">
    <template #renderItem="{ item }">
      <a-list-item>
        <a-list-item-meta :description="item.desc">
          <template #title>
            <a href="#" @click="addToPgVisible = true">{{item.name}}</a>
          </template>
          <template #avatar>
            <a-avatar
              :size="64"
              shape="square"
              :src="item.cover"
              :draggable="true"
              :style="{ 'vertical-align': 'middle' }"
            />
          </template>
        </a-list-item-meta>
      </a-list-item>
    </template>
  </a-list>
  <a-modal
    v-model:visible="addToPgVisible"
    title="指定组件添加的页面"
    @ok="onAddCompoSubmit"
  >
    <a-select style="width: 100%" v-model:value="addToPage">
      <a-select-option value="item">列表项</a-select-option>
    </a-select>
  </a-modal>
</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { ComponentInfo } from '@/common'
import compoRess from '@/test_ress/components.json'
export default defineComponent({
  name: 'ComponentBox',
  props: {
    onCompoAddToPage: { type: Function, required: true },
  },
  setup (props) {
    const components = ref([] as ComponentInfo[])
    const addToPgVisible = ref(false)
    const addToPage = ref('')

    onMounted(() => {
      onRefresh()
    })

    function onRefresh () {
      components.value = compoRess.data.map((compo: any) => {
        return ComponentInfo.copy(compo)
      })
    }
    function onAddCompoSubmit () {
      props.onCompoAddToPage(addToPage.value)
      addToPage.value = ''
      addToPgVisible.value = false
    }
    return {
      components,
      addToPgVisible,
      addToPage,

      onRefresh,
      onAddCompoSubmit
    }
  }
})
</script>

<style lang="less" scoped>
.compo-box-header {
  padding: 10px;
  position: fixed;
  top: 64px;
  width: 300px;
  z-index: 50;
  background-color: white;
}
</style>
