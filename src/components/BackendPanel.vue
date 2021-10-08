<template>
<div class="w-100 h-100 white-bkgd">
  <template v-if="selPage.name">
    <a-row class="p-10" type="flex" :gutter="8">
      <a-col flex="auto">
        <a-input-group compact>
          <a-select
            style="width: 20%"
            v-model:value="dataUrlState.method"
          >
            <a-select-option
              v-for="method in methods"
              :key="method"
              :value="method"
            >
              {{method}}
            </a-select-option>
          </a-select>
          <a-input
            style="width: 55%"
            placeholder="输入测试链接"
            v-model:value="dataUrlState.url"
          />
          <a-input
            style="width: 25%"
            placeholder="输入返回数据的前缀"
            v-model:value="dataUrlState.prefix"
          />
        </a-input-group>
      </a-col>
      <a-col flex="100px">
        <a-button
          class="w-100" type="primary"
          @click="onBindDataUrlClicked"
        >
          绑定数据URL
        </a-button>
      </a-col>
    </a-row>
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
      title="字段"
      description="与页面元素绑定的变量，由页面可用变量直接注入或经过计算后注入。可以看作页面后台的Outputs"
      :cols="fieldCols"
      :data="fields"
      :dftRecord="dftField"
      :dataMapper="fieldMapper"
      @save="onSaveFieldSubmit"
      @delete="onDelFieldSubmit"
    >
      <template v-slot:name="{ record }">
        {{record.name}} = <a-button size="small"
          @click="onBindFieldClicked(record)"
        >{{record.source}}</a-button>
      </template>
      <template v-slot:bind="{ record }">
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
      :show="showFieldBind"
      @update:show="showFieldBind = $event"
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
import { Field, buildTypes, Page, Compo, Mapper, Attr, methods, DataURL } from '@/common'
import { SwapOutlined, SwapRightOutlined } from '@ant-design/icons-vue'
import FormDialog from '../components/FormDialog.vue'
import EditTable from './EditTable.vue'
import { message } from 'ant-design-vue'
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
    title: '字段名称',
    dataIndex: 'name',
    key: 'name',
    slots: { customRender: 'name' }
  },
  {
    title: '字段类型',
    dataIndex: 'type',
    key: 'type',
    slots: { customRender: 'type' },
    width: 150
  },
  {
    title: '生成方式',
    dataIndex: 'build',
    key: 'build',
    slots: { customRender: 'build' },
    width: 150
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
    label: '字段名称',
    type: 'Input',
  },
  type: {
    label: '字段类型',
    type: 'Select',
    options: []
  },
  build: {
    label: '生成方式',
    type: 'Select',
    options: []
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
    options: []
  },
  source: {
    label: '数据源',
    type: 'Select',
    options: []
  }
})
export default defineComponent({
  name: 'BackendPanel',
  components: {
    SwapOutlined,
    SwapRightOutlined,
    FormDialog,
    EditTable
  },
  setup () {
    const store = useStore()
    const selPage = computed(() => store.getters.seledPage)
    const dftField = new Field()
    const fields = computed(() => store.getters.seledPage.fields)
    const dataUrlState = reactive(new DataURL())
    const showFieldBind = ref(false)
    const bindFieldState = reactive(new Field())
    const dftParam = new Attr()
    const params = computed(() => store.getters.seledPage.params)
    const avaTypes = computed(() => store.getters.avaTypes)

    bindFieldMapper['build'].options = buildTypes
    fieldMapper['build'].options = buildTypes
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
    watch(() => store.getters.avaTypes, () => {
      paramMapper['type'].options = store.getters.avaTypes
      fieldMapper['type'].options = store.getters.avaTypes
    })
    watch(() => store.getters.seledPage, () => {
      DataURL.copy(store.getters.seledPage.dataUrl, dataUrlState, true)
    })

    function onBindDataUrlClicked () {
      store.commit('SET_DATA_URL', dataUrlState)
      message.success('数据连接绑定成功！')
    }
    function onSaveFieldSubmit (entry: Field) {
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
    function onBindFieldSubmit (e: Field) {
      console.log(e)
    }
    function onBindFieldClicked (record: Field) {
      Field.copy(record, bindFieldState)
      showFieldBind.value = true
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
      methods,
      dataUrlState,
      dftField,
      fields,
      fieldCols,
      fieldMapper,
      bindFieldState,
      buildTypes,
      showFieldBind,
      bindFieldMapper,
      dftParam,
      paramCols,
      paramMapper,
      params,
      avaTypes,

      onBindDataUrlClicked,
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
