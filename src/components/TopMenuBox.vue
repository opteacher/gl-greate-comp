<template>
<div style="float: left; width: 250px; height: 64px">
</div>
<a-menu
  theme="dark"
  mode="horizontal"
  v-model:selectedKeys="selKey"
  :style="{ lineHeight: '64px' }"
  @click="onMenuItemClicked"
>
  <a-sub-menu title="项目">
    <a-menu-item key="project:new">创建</a-menu-item>
    <a-menu-item key="project:open">打开</a-menu-item>
  </a-sub-menu>
  <a-sub-menu title="生成">
    <a-menu-item key="generate:fast">快速</a-menu-item>
  </a-sub-menu>
  <a-menu-item key="config">配置</a-menu-item>
</a-menu>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
export default defineComponent({
  name: 'TopMenuBox',
  setup () {
    const store = useStore()
    const selKey = ref([''])

    async function onMenuItemClicked ({ key }: { key: string }) {
      switch (key) {
      case 'generate:fast':
        message.loading('加载中……')
        await axios.post('http://localhost:4000/gl-create-comp/api/v1/generate/fast', {
          pages: store.getters.pages
        })
        message.destroy()
        break
      }
    }
    return {
      selKey,
      onMenuItemClicked
    }
  }
})
</script>
