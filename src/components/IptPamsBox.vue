<template>
<div style="height: 100%; overflow: hidden">
  <div style="height: 50%; overflow-y: scroll">
    <h4 class="pt-10 pl-5">导入到页面的变量</h4>
    <edit-table
      title="参数"
      :cols="paramCols"
      :data="params"
      :dftRecord="dftParam"
      :dataMapper="paramMapper"
      :editable="false"
      @save="onParamSave"
      @delete="onParamDel"
    />
  </div>
  <data-src-table style="border-top: 1px solid #d9d9d9; height: 50%; overflow-y: scroll"/>
</div>
</template>

<script lang="ts">
import { Mapper, Attr } from '@/common'
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import EditTable from './EditTable.vue'
import DataSrcTable from './DataSrcTable.vue'
const paramCols = [
  {
    title: '参数名',
    dataIndex: 'name',
    key: 'name',
    slots: { customRender: 'name' }
  },
  {
    title: '参数类型',
    dataIndex: 'type',
    key: 'type',
    slots: { customRender: 'type' }
  },
  // {
  //   title: '必选',
  //   dataIndex: 'required',
  //   key: 'required',
  //   slots: { customRender: 'required' }
  // },
  // {
  //   title: '默认值',
  //   dataIndex: 'dftVal',
  //   key: 'dftVal',
  //   slots: { customRender: 'dftVal' }
  // }
]
const paramMapper = new Mapper({
  name: {
    label: '参数名',
    type: 'Input',
  },
  type: {
    label: '参数类型',
    type: 'Select',
    options: []
  },
  // required: {
  //   label: '必选',
  //   type: 'Checkbox'
  // },
  // dftVal: {
  //   label: '默认值',
  //   type: 'Input'
  // }
})
export default defineComponent({
  name: 'InputParametersBox',
  components: {
    EditTable,
    DataSrcTable
  },
  setup () {
    const store = useStore()
    const selPage = computed(() => store.getters.seledPage)
    const dftParam = new Attr()
    const params = computed(() => store.getters.seledPage.params)


    function onParamSave (param: Attr) {
      store.commit('SAVE_ATTR', {
        prop: 'params',
        entry: param,
        copy: Attr.copy
      })
    }
    function onParamDel (key: number) {
      store.commit('DEL_ATTR', {
        prop: 'params', key
      })
    }
    return {
      selPage,
      dftParam,
      paramCols,
      paramMapper,
      params,

      onParamDel,
      onParamSave,
    }
  }
})
</script>
