<template>
<div v-if="!dataSrc.url" class="p-10">
  <a-row type="flex" justify="space-between">
    <a-col :span="12">
      <h3>数据源</h3>
    </a-col>
    <a-col class="text-right" :span="12">
      <a-button type="primary" @click="onShowDataSrcClicked">修改</a-button>
    </a-col>
  </a-row>
  <a-empty description="无数据源"/>
</div>
<a-descriptions v-else bordered :column="2">
  <template #title>
    <h3 class="ml-10 mt-10">数据源</h3>
  </template>
  <template #extra>
    <a-button
      class="mr-10 mt-10" type="primary"
      @click="onShowDataSrcClicked"
    >修改</a-button>
  </template>
  <a-descriptions-item label="链接" :span="2">
    {{dataSrc.url}}
  </a-descriptions-item>
  <a-descriptions-item label="访问方式">
    {{dataSrc.method}}
  </a-descriptions-item>
  <a-descriptions-item label="返回值前缀">
    {{dataSrc.prefix}}
  </a-descriptions-item>
  <a-descriptions-item label="注入变量">
    {{dataSrc.varName}}
  </a-descriptions-item>
  <a-descriptions-item label="变量类型">
    {{dataSrc.varType}}
  </a-descriptions-item>
</a-descriptions>
<form-dialog
  :show="showEditDataSrc"
  @update:show="showEditDataSrc = $event"
  title="修改页面数据源"
  :object="dataSrcState"
  :mapper="dataSrcMapper"
  @submit="onEditDataSrcSubmit"
/>
</template>

<script lang="ts">
import { DataSrc, Mapper, methods } from '@/common'
import { message } from 'ant-design-vue'
import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
import FormDialog from '../components/FormDialog.vue'
const dataSrcMapper = new Mapper({
  url: {
    label: '数据链接',
    type: 'Input',
  },
  method: {
    label: '访问方式',
    type: 'Select',
    options: methods
  },
  prefix: {
    label: '返回值前缀',
    type: 'Input',
  },
  varName: {
    label: '注入变量的名称',
    type: 'Input',
  },
  varType: {
    label: '注入变量的类型',
    type: 'Select',
    options: []
  }
})
export default defineComponent({
  name: 'DataSourceTable',
  components: {
    FormDialog,
  },
  setup () {
    const store = useStore()
    const showEditDataSrc = ref(false)
    const dataSrcState = reactive(new DataSrc())
    const dataSrc = computed(() => store.getters.seledPage.dataSrc)

    dataSrcMapper['varType'].options = store.getters.avaTypes
    watch(() => store.getters.avaTypes, () => {
      dataSrcMapper['varType'].options = store.getters.avaTypes
    })
    watch(() => store.getters.seledPage, () => {
      DataSrc.copy(store.getters.seledPage.dataSrc, dataSrcState, true)
    })

    function onEditDataSrcSubmit () {
      store.commit('SET_DATA_SRC', dataSrcState)
      message.success('数据连接绑定成功！')
    }
    function onShowDataSrcClicked () {
      showEditDataSrc.value = true
      if (dataSrc.value.url) {
        DataSrc.copy(dataSrc.value, dataSrcState)
      }
    }
    return {
      methods,
      dataSrcMapper,
      showEditDataSrc,
      dataSrcState,
      dataSrc,

      onEditDataSrcSubmit,
      onShowDataSrcClicked
    }
  }
})
</script>
