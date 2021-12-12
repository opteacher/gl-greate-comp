<template>
<div class="w-100 h-100 grey-bkgd p-10">
  <template v-if="selPage.name">
    <edit-table
      title="数据源"
      description="通过URL链接获取API传来的数据，而且可以指定返回值中的分量定义数据源变量"
      :cols="dtSrcCols"
      :data="dataSrcs"
      :dftRecord="dftDtSrc"
      :dataMapper="dtSrcMapper"
      @save="onParamSave"
      @delete="onParamDel"
    />
    <edit-table
      title="参数"
      description="来自外部的参数，一般由父节点给出。可以看作页面后台的Inputs"
      :cols="paramCols"
      :data="params"
      :dftRecord="dftParam"
      :dataMapper="paramMapper"
      @save="onParamSave"
      @delete="onParamDel"
    />
    <edit-table
      title="变量"
      description="可与页面元素绑定，或作为复杂计算的中间量参与。可以看作页面后台的Outputs"
      :cols="fieldCols"
      :data="fields"
      :dftRecord="dftField"
      :dataMapper="fieldMapper"
      @save="onSaveFieldSubmit"
      @delete="onDelFieldSubmit"
    >
      <template #name="{ record }">
        {{record.name}} = <a-button size="small"
          @click="onBindFieldClicked(record)"
        >{{record.source || '点击绑定源'}}</a-button>
      </template>
      <template #bind="{ record }">
        <a-button size="small"
          @click="onFieldFlowChanged(record)"
        >
          <template #icon>
            <SwapOutlined v-if="record.flow === 'doubly'" />
            <SwapRightOutlined v-else-if="record.flow === 'single'" />
          </template>
        </a-button>
        {{record.bind.join('.')}}
      </template>
    </edit-table>
    <form-dialog
      :show="showBindField"
      @update:show="showBindField = $event"
      title="绑定字段到页面元素"
      :object="bindFieldState"
      :mapper="bindFieldMapper"
      @submit="onBindFieldSubmit"
    />
  </template>
  <div v-else class="center-container">
    <a-empty description="未选择页面"/>
  </div>
</div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { Field, buildTypes, Page, Compo, Mapper, Attr, methods, DataSrc } from '@/common'
import { SwapOutlined, SwapRightOutlined } from '@ant-design/icons-vue'
import FormDialog from '../components/FormDialog.vue'
import EditTable from './EditTable.vue'
const dtSrcCols = [
  {
    title: '链接',
    dataIndex: 'url',
    key: 'url',
    slots: { customRender: 'url' }
  },
  {
    title: '访问方式',
    dataIndex: 'method',
    key: 'method',
    slots: { customRender: 'method' }
  },
  {
    title: '返回值分量（可选）',
    dataIndex: 'data',
    key: 'data',
    slots: { customRender: 'data' }
  },
  {
    title: '赋值变量',
    dataIndex: 'varName',
    key: 'varName',
    slots: { customRender: 'varName' }
  },
  {
    title: '赋值变量类型',
    dataIndex: 'varType',
    key: 'varType',
    slots: { customRender: 'varType' }
  }
]
const dtSrcMapper = new Mapper({
  url: {
    label: '链接',
    type: 'Input',
  },
  method: {
    label: '访问方式',
    type: 'Select',
    options: methods
  },
  data: {
    label: '返回值分量（可选）',
    type: 'Input'
  },
  varName: {
    label: '赋值变量',
    type: 'Input'
  },
  varType: {
    label: '赋值变量',
    type: 'Select',
    options: []
  }
})
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
  {
    title: '必选',
    dataIndex: 'required',
    key: 'required',
    slots: { customRender: 'required' }
  },
  {
    title: '默认值',
    dataIndex: 'dftVal',
    key: 'dftVal',
    slots: { customRender: 'dftVal' }
  }
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
  required: {
    label: '必选',
    type: 'Checkbox'
  },
  dftVal: {
    label: '默认值',
    type: 'Input'
  }
})
const fieldCols = [
  {
    title: '变量名称',
    dataIndex: 'name',
    key: 'name',
    slots: { customRender: 'name' }
  },
  {
    title: '变量类型',
    dataIndex: 'type',
    key: 'type',
    slots: { customRender: 'type' },
    width: 120
  },
  {
    title: '默认值',
    dataIndex: 'dftVal',
    key: 'dftVal',
    slots: { customRender: 'dftVal' },
    width: 100
  },
  {
    title: '生成方式',
    dataIndex: 'build',
    key: 'build',
    slots: { customRender: 'build' },
    width: 120
  },
  {
    title: '绑定元素',
    dataIndex: 'bind',
    key: 'bind',
    slots: { customRender: 'bind' },
  }
]
const fieldMapper = new Mapper({
  name: {
    label: '变量名称',
    type: 'Input',
  },
  type: {
    label: '变量类型',
    type: 'Select',
    options: []
  },
  dftVal: {
    label: '默认值',
    type: 'Input',
  },
  build: {
    label: '生成方式',
    type: 'Select',
    options: buildTypes
  },
  bind: {
    label: '绑定元素',
    type: 'Cascader',
    options: []
  }
})
const bindFieldMapper = new Mapper({
  name: {
    label: '字段名',
    type: 'Input',
    disabled: true
  },
  type: {
    label: '字段类型',
    type: 'Input',
    disabled: true
  },
  build: {
    label: '构建方式',
    type: 'Select',
    options: buildTypes
  },
  source: {
    label: '数据源',
    desc: '参数以#开头，本地变量以$开头',
    type: 'Select',
    options: [],
    changes: [
      {
        cond: { key: 'build', val: 'direct' },
        attr: { key: 'type', val: 'Select' }
      },
      {
        cond: { key: 'build', val: 'process' },
        attr: { key: 'type', val: 'Textarea' }
      }
    ]
  }
})
export default defineComponent({
  name: 'BackendPanel',
  components: {
    SwapOutlined,
    SwapRightOutlined,
    FormDialog,
    EditTable,
  },
  setup () {
    const store = useStore()
    const selPage = computed(() => store.getters.seledPage)
    const dftParam = new Attr()
    const params = computed(() => store.getters.seledPage.params)
    const dftField = new Field()
    const fields = computed(() => store.getters.seledPage.fields)
    const showBindField = ref(false)
    const bindFieldState = reactive(new Field())
    const dftDtSrc = new DataSrc();
    const dataSrcs = computed(() => store.getters.seledPage.dataSrcs)

    watch(() => [
      store.getters.pages.length,
      store.getters.compoNames.length
    ], () => {
      fieldMapper['bind'].options = store.getters.pages.map((page: Page) => ({
        value: page.name, label: page.name,
        children: page.children.map((compo: Compo) => {
          return { value: compo.name, label: compo.name }
        }),
      }))
    })
    watch(() => store.getters.seledPage.params.length, () => {
      bindFieldMapper['source'].options = ['',
        ...store.getters.seledPage.params.map((param: Attr) => param.name)
      ]
    })
    watch(() => store.getters.avaTypes.length, updTypes)
    updTypes()

    function updTypes () {
      dtSrcMapper['varType'].options = store.getters.avaTypes
      paramMapper['type'].options = store.getters.avaTypes
      fieldMapper['type'].options = [''].concat(store.getters.avaTypes)
    }
    function onSaveFieldSubmit (entry: Field) {
      entry.parent = selPage.value.name
      store.commit('SAVE_ATTR', {
        prop: 'fields', entry, copy: Field.copy
      })
    }
    function onFieldFlowChanged (record: Field) {
      record.flow = record.flow === 'doubly' ? 'single' : 'doubly'
      store.commit('SAVE_ATTR', {
        prop: 'fields',
        entry: record,
        copy: Field.copy
      })
    }
    function onDelFieldSubmit (key: number) {
      store.commit('DEL_ATTR', { key, prop: 'fields' })
    }
    function onBindFieldSubmit (entry: Field) {
      store.commit('SAVE_ATTR', {
        prop: 'fields', entry, copy: Field.copy
      })
    }
    function onBindFieldClicked (record: Field) {
      Field.copy(record, bindFieldState)
      showBindField.value = true
    }
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
      dftField,
      fields,
      fieldCols,
      fieldMapper,
      bindFieldState,
      buildTypes,
      showBindField,
      bindFieldMapper,
      dftParam,
      paramCols,
      paramMapper,
      params,
      dftDtSrc,
      dtSrcCols,
      dtSrcMapper,
      dataSrcs,

      onSaveFieldSubmit,
      onDelFieldSubmit,
      onFieldFlowChanged,
      onBindFieldSubmit,
      onBindFieldClicked,
      onParamSave,
      onParamDel
    }
  }
})
</script>
