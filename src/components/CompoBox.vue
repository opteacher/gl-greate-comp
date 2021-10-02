<template>
<div class="plr-10" style="overflow-y: scroll">
  <a-list item-layout="horizontal" :data-source="components">
    <template #renderItem="{ item }">
      <a-list-item>
        <a-list-item-meta :description="item.desc">
          <template #title>
            <a href="#" @click="onAddCompoVisible(item.name)">
              {{item.name}}
            </a>
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

</div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'ComponentBox',
  setup () {
    const store = useStore()
    const components = computed(() => store.getters.allCompoInfos)

    function onAddCompoVisible (cmpName: string) {
      store.commit('SET_ADD_CMP_DLG', {
        show: true, cmpTyp: cmpName,
      })
    }
    return {
      components,
      onAddCompoVisible
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
