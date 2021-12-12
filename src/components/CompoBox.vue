<template>
<a-tabs
  style="height: 50%; overflow-y: scroll"
  tab-position="top" type="card"
  v-model:activeKey="actGroup"
>
  <a-tab-pane v-for="group in groups" :key="group.name" :tab="group.name">
    <div class="plr-10" style="overflow-y: hidden">
      <a-list item-layout="horizontal" :data-source="group.compos">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :description="item.desc">
              <template #title>
                <a href="#" @click="$emit('addCompo', group.name, item.name)">
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
  </a-tab-pane>
</a-tabs>
</template>

<script lang="ts">
import { CompoInfo } from '@/common'
import { computed, defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'ComponentBox',
  emits: ['addCompo'],
  setup () {
    const store = useStore()
    const groups = computed(() => {
      const retun: { name: string, compos: CompoInfo[] }[] = []
      for (const cmpInf of store.getters.compoInfos) {
        let group = retun.find(gp => gp.name == cmpInf.group)
        if (!group) {
          group = {
            name: cmpInf.group,
            compos: [cmpInf]
          }
          retun.push(group)
        } else {
          group.compos.push(cmpInf)
        }
      }
      return retun
    })
    const actGroup = ref('basic')

    return {
      actGroup,
      groups,
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
