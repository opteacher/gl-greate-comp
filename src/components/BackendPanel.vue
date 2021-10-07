<template>
<div class="w-100 h-100 white-bkgd">
  <template v-if="seledTable.name">
    <a-row class="p-10" type="flex" :gutter="8">
      <a-col flex="auto">
        <a-input-group compact>
          <a-input
            style="width: 75%"
            placeholder="输入测试链接"
            v-model:value="testURL"
          />
          <a-input
            style="width: 25%"
            placeholder="输入返回数据的前缀"
            v-model:value="testPrefix"
          />
        </a-input-group>
      </a-col>
      <a-col flex="100px">
        <a-button
          class="w-100" type="primary"
          @click="onGetTestClicked"
        >
          获取测试数据
        </a-button>
      </a-col>
    </a-row>
    <a-descriptions size="small"
      v-if="Object.keys(testData).length"
      class="mb-10" :column="1" bordered
    >
      <a-descriptions-item
        v-for="(value, key) in testData"
        :label="key" :key="key"
      >
        {{typeof value}}
      </a-descriptions-item>
    </a-descriptions>
    <div class="plr-10 mb-10">
      <a-button @click="addFieldMod = true">添加字段</a-button>
    </div>
    <a-table
      :dataSource="fields"
      :columns="columns"
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
            v-for="ftype in fldTypAry"
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
            v-for="fbuild in fldBldTypAry"
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
    <a-modal
      v-model:visible="showFieldBind"
      title="绑定字段到页面元素"
      @ok="onFldBindSubmit"
    >
      <bind-field-form
        ref="bindFieldForm"
        v-model:field="edtFieldState"
        :dataSrcs="Object.keys(testData)"
      />
    </a-modal>
  </template>
  <div v-else class="center-container">
    <a-empty description="选择表，再操作"/>
  </div>
</div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { message } from 'ant-design-vue'
import { Field, fldTypAry, fldBldTypAry, Page, Compo, Table } from '@/common'
import { SwapOutlined, SwapRightOutlined } from '@ant-design/icons-vue'
import BindFieldForm from '../components/BindFieldForm.vue'
const columns = [
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
    title: '绑定槽',
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
export default defineComponent({
  name: 'BackendPanel',
  components: {
    SwapOutlined,
    SwapRightOutlined,
    BindFieldForm
  },
  setup () {
    const store = useStore()
    const addFieldMod = ref(false)
    const edtFieldKey = ref(-1)
    const edtFieldState: Field = reactive(new Field())
    const seledTable: ComputedRef<Table> = computed(() => {
      return store.getters.seledTable
    })
    const fields: Ref<Field[]> = computed(() => seledTable.value.fields)
    const pageEleOpns = computed(() => {
      return store.getters.pages.map((page: Page) => ({
        value: page.name, label: page.name,
        children: page.children.map((compo: Compo) => {
          return { value: compo.name, label: compo.name }
        }),
      }))
    })
    const testURL = ref('')
    const testPrefix = ref('')
    const testData = ref({} as {[key: string]: any})
    const showFieldBind = ref(false)
    const bindFieldForm = ref()

    watch(() => addFieldMod.value, () => {
      if (addFieldMod.value) {
        fields.value.unshift(new Field())
        edtFieldKey.value = 0
      } else {
        fields.value.shift()
        edtFieldKey.value = -1
      }
    })

    async function onGetTestClicked () {
      message.loading('加载中……')
      const resp = await axios.get(testURL.value)
      testData.value = resp.data
      for (const key of testPrefix.value.split('.')) {
        if (!key) {
          break
        }
        testData.value = testData.value[key]
      }
      message.destroy()
    }
    function onSaveFieldSubmit () {
      store.commit('SAVE_FIELD', edtFieldState)
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
      store.commit('SAVE_FIELD', record)
    }
    function onDelFieldSubmit (key: number) {
      store.commit('DEL_FIELD', key)
    }
    async function onFldBindSubmit () {
      try {
        await bindFieldForm.value.formRef.validate()
        console.log(bindFieldForm.value.formState)
        edtFieldState.reset()
        showFieldBind.value = false
      } catch (e) {
        console.log(e)
      }
    }
    function onBindFieldClicked (record: Field) {
      Field.copy(record, edtFieldState)
      showFieldBind.value = true
    }
    return {
      addFieldMod,
      edtFieldKey,
      edtFieldState,
      pageEleOpns,
      seledTable,
      testURL,
      testPrefix,
      testData,
      fields,
      columns,
      fldTypAry,
      fldBldTypAry,
      showFieldBind,
      bindFieldForm,

      onGetTestClicked,
      onSaveFieldSubmit,
      onCclFieldClicked,
      onEdtFieldClicked,
      onDelFieldSubmit,
      onFieldFlowChanged,
      onFldBindSubmit,
      onBindFieldClicked
    }
  }
})
</script>
