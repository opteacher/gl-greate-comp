<template>
<h4 class="pt-10 pl-5">页面可使用变量列表</h4>
<a-table
  :columns="columns"
  :dataSource="expVars"
  :pagination="false"
>
  <template #source="{ text }">
    {{
      text === '#dataSrc' ? '数据源' : (text === seledPage.name ? '定义' : '参数')
    }}
  </template>
</a-table>
</template>

<script lang="ts">
import { Field, Page, Attr, DataSrc } from '@/common'
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
const columns = [
  {
    title: '变量名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '来源',
    dataIndex: 'parent',
    key: 'source',
    slots: { customRender: 'source' },
  }
]
export default defineComponent({
  name: 'ExportVariables',
  setup () {
    const store = useStore()
    const seledPage = computed(() => store.getters.seledPage as Page)
    const expVars = computed(() => {
      const selPage = store.getters.seledPage as Page
      return [
        ...selPage.dataSrcs.map((dtSrc: DataSrc, index: number) => ({
          key: index + 1,
          name: dtSrc.varName,
          type: dtSrc.varType,
          parent: '#dataSrc'
        })),
        ...selPage.params.map((param: Attr, index: number) => ({
          key: index + 1 + selPage.dataSrcs.length,
          name: param.name,
          type: param.type,
          parent: param.parent
        })),
        ...selPage.fields.map((field: Field, index: number) => ({
          key: index + 1 + selPage.dataSrcs.length + selPage.params.length,
          name: field.name,
          type: field.type,
          parent: field.parent
        }))
      ]
    })
    return {
      columns,
      expVars,
      seledPage,
    }
  }
})
</script>
