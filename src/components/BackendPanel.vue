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
    <!-- <a-descriptions size="small"
      v-if="Object.keys(testData).length"
      class="mb-10" :column="1" bordered
    >
      <a-descriptions-item
        v-for="(value, key) in testData"
        :label="key" :key="key"
      >
        {{typeof value}}
      </a-descriptions-item>
    </a-descriptions> -->
    <edit-table
      title="参数"
      :cols="paramCols"
      :data="params"
      :dftRecord="dftParam"
      :dataMapper="paramMapper"
      @save="onParamSave"
      @delete="onParamDel"
    />
    <div class="p-10">
      <a-button @click="addFieldMod = true">添加字段</a-button>
    </div>
    <a-table
      :dataSource="fields"
      :columns="fieldCols"
      :scroll="{ y: 240 }"
      :pagination="false"
    >
      <template #name="{ text, index, record }">
        <a-input
          v-if="index === edtFieldKey"
          v-model:value="edtFieldState.name"
          placeholder="输入字段名称"
        />
        <template v-else>
          {{text}} =
          <a-button size="small"
            @click="onBindFieldClicked(record)"
          >{{record.source}}</a-button>
        </template>
      </template>
      <template #type="{ text, index }">
        <a-select
          v-if="index === edtFieldKey"
          v-model:value="edtFieldState.type"
          placeholder="选择字段类型"
          class="w-100"
        >
          <a-select-option
            v-for="ftype in avaTypes"
            :key="ftype" :value="ftype"
          >{{ftype}}</a-select-option>
        </a-select>
        <template v-else>
          {{text}}
        </template>
      </template>
      <template #build="{ text, index }">
        <a-select
          v-if="index === edtFieldKey"
          v-model:value="edtFieldState.build"
          placeholder="选择数据源构建方式"
          class="w-100"
        >
          <a-select-option
            v-for="fbuild in buildTypes"
            :key="fbuild" :value="fbuild"
          >{{fbuild}}</a-select-option>
        </a-select>
        <template v-else>
          {{text}}
        </template>
      </template>
      <template #bind="{ text, index, record }">
        <a-cascader
          v-if="index === edtFieldKey"
          v-model:value="edtFieldState.bind"
          :options="pageEleOpns"
          placeholder="选择绑定页面元素"
        />
        <template v-else>
          <a-button size="small"
            @click="onFieldFlowChanged(record)"
          >
            <template #icon>
              <SwapOutlined v-if="record.flow === 'doubly'" />
              <SwapRightOutlined v-else-if="record.flow === 'single'" />
            </template>
          </a-button>
          {{text.join('.')}}
        </template>
      </template>
      <template #operation="{ index, record }">
        <template v-if="index === edtFieldKey">
          <ul class="unstyled-list">
            <li class="mb-3">
              <a-button
                type="primary" size="small"
                @click="onSaveFieldSubmit"
              >保存</a-button>
            </li>
            <li>
              <a-button size="small"
                @click="onCclFieldClicked(index)"
              >取消</a-button>
            </li>
          </ul>
        </template>
        <template v-else>
          <ul class="unstyled-list">
            <li class="mb-3">
              <a-button size="small"
                @click="onEdtFieldClicked(index, record)"
              >编辑</a-button>
            </li>
            <li>
              <a-popconfirm
                title="确定删除该字段"
                @confirm="onDelFieldSubmit(record.key)"
              >
                <a-button size="small" danger>删除</a-button>
              </a-popconfirm>
            </li>
          </ul>
        </template>
      </template>
    </a-table>
    <form-dialog
      :show="showFieldBind"
      @update:show="showFieldBind = $event"
      title="绑定字段到页面元素"
      :object="edtFieldState"
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
  },
  {
    title: '操作',
    dataIndex: 'operation',
    slots: { customRender: 'operation' },
    width: 80
  }
]
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
    const addFieldMod = ref(false)
    const edtFieldKey = ref(-1)
    const edtFieldState: Field = reactive(new Field())
    const fields = computed(() => store.getters.seledPage.fields)
    const pageEleOpns = computed(() => {
      return store.getters.pages.map((page: Page) => ({
        value: page.name, label: page.name,
        children: page.children.map((compo: Compo) => {
          return { value: compo.name, label: compo.name }
        }),
      }))
    })
    const dataUrlState = reactive(new DataURL())
    const showFieldBind = ref(false)
    const dftParam = new Attr()
    const params = computed(() => store.getters.seledPage.params)
    const avaTypes = computed(() => store.getters.avaTypes)

    bindFieldMapper['build'].options = buildTypes
    watch(() => addFieldMod.value, () => {
      if (addFieldMod.value) {
        fields.value.unshift(new Field())
        edtFieldKey.value = 0
      } else {
        fields.value.shift()
        edtFieldKey.value = -1
      }
    })
    watch(() => store.getters.avaTypes, () => {
      paramMapper['type'].options = store.getters.avaTypes
    })
    watch(() => store.getters.seledPage.dataUrl, () => {
      DataURL.copy(store.getters.seledPage.dataUrl, dataUrlState)
    })

    function onBindDataUrlClicked () {
      store.commit('SET_DATA_URL', dataUrlState)
      message.success('数据连接绑定成功！')
    }
    function onSaveFieldSubmit () {
      store.commit('SAVE_ATTR', {
        prop: 'fields',
        entry: edtFieldState,
        copy: Field.copy
      })
      edtFieldState.reset()
      addFieldMod.value = false
      edtFieldKey.value = -1
    }
    function onCclFieldClicked (index: number) {
      if (index === 0 && addFieldMod.value) {
        addFieldMod.value = false
      }
      edtFieldKey.value = -1
      edtFieldState.reset()
    }
    function onEdtFieldClicked (index: number, record: Field) {
      edtFieldKey.value = index
      Field.copy(record, edtFieldState)
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
      Field.copy(record, edtFieldState)
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
      addFieldMod,
      edtFieldKey,
      edtFieldState,
      pageEleOpns,
      methods,
      dataUrlState,
      fields,
      fieldCols,
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
      onCclFieldClicked,
      onEdtFieldClicked,
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
