<template>
<div class="w-100 h-100 white-bkgd">
  <template v-if="seledTable">
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
    <a-descriptions
      v-if="Object.keys(testData).length"
      class="mb-10" :column="1" bordered
    >
      <a-descriptions-item
        v-for="(value, key) in testData"
        :label="key" :key="key"
      >
        {{value}}&nbsp;[{{typeof value}}]
      </a-descriptions-item>
    </a-descriptions>
    <div class="plr-10 mb-10">
      <a-button @click="addField = true">添加字段</a-button>
    </div>
    <a-table
      :dataSource="fields"
      :columns="columns"
      :scroll="{ y: 240 }"
      :pagination="false"
    >
      <template #name="{ text, index }">
        <a-input
          v-if="index === edtField"
          v-model:value="edtFieldState.name"
        />
        <template v-else>
          {{text}}
        </template>
      </template>
      <template #type="{ text, index }">
        <a-select
          v-if="index === edtField"
          v-model:value="edtFieldState.type"
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
          v-if="index === edtField"
          v-model:value="edtFieldState.build"
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
      <template #source="{ text, index }">
        <a-input
          v-if="index === edtField"
          v-model:value="edtFieldState.source"
        />
        <template v-else>
          {{text}}
        </template>
      </template>
      <template #bind="{ text, index, record }">
        <a-cascader
          v-if="index === edtField"
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
        <template v-if="index === edtField">
          <a-button
            type="primary" size="small"
            @click="onSaveFieldSubmit"
          >保存</a-button>
          <a-button
            class="ml-3" size="small"
            @click="onCclFieldClicked(index)"
          >取消</a-button>
        </template>
        <template v-else>
          <a-button
            class="mr-3" size="small"
            @click="onEdtFieldClicked(index, record)"
          >编辑</a-button>
          <a-button danger size="small">删除</a-button>
        </template>
      </template>
    </a-table>
  </template>
  <div v-else class="center-container">
    <a-empty description="选择表，再操作"/>
  </div>
</div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { message } from 'ant-design-vue'
import { Field, fldTypAry, fldBldTypAry, Page } from '@/common'
import { SwapOutlined, SwapRightOutlined } from '@ant-design/icons-vue'
export default defineComponent({
  name: 'BackendPanel',
  components: {
    SwapOutlined,
    SwapRightOutlined
  },
  setup () {
    const store = useStore()
    const addField = ref(false)
    const edtField = ref(-1)
    const edtFieldState = reactive(new Field())
    const seledTable = computed(() => {
      return store.getters.seledTable
    })
    const fields = computed(() => {
      const ret: Field[] = []
      if (addField.value) {
        ret.push(new Field())
        edtField.value = 0
      }
      if (store.getters.seledTable) {
        ret.push(...store.getters.seledTable.fields)
      }
      for (let i = 0; i < ret.length; ++i) {
        ret[i].key = i
      }
      return ret
    })
    const pageEleOpns = computed(() => {
      return store.getters.pages.map((page: Page) => {
        return { value: page.name, label: page.name }
      })
    })
    const columns = [
      {
        title: '字段名称',
        dataIndex: 'name',
        key: 'name',
        slots: { customRender: 'name' },
      },
      {
        title: '字段类型',
        dataIndex: 'type',
        key: 'type',
        slots: { customRender: 'type' },
      },
      {
        title: '生成方式',
        dataIndex: 'build',
        key: 'build',
        slots: { customRender: 'build' },
      },
      {
        title: '数据来源',
        dataIndex: 'source',
        key: 'source',
        slots: { customRender: 'source' },
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
      }
    ]
    const testURL = ref('')
    const testPrefix = ref('')
    const testData = ref({} as {[key: string]: any})

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
      addField.value = false
      edtField.value = -1
    }
    function onCclFieldClicked (index: number) {
      if (index === 0 && addField.value) {
        addField.value = false
      }
      edtField.value = -1
      edtFieldState.reset()
    }
    function onEdtFieldClicked (index: number, record: Field) {
      edtField.value = index
      Field.copy(record, edtFieldState)
    }
    function onFieldFlowChanged (record: Field) {
      record.flow = record.flow === 'doubly' ? 'single' : 'doubly'
      store.commit('SAVE_FIELD', record)
    }
    return {
      addField,
      edtField,
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

      onGetTestClicked,
      onSaveFieldSubmit,
      onCclFieldClicked,
      onEdtFieldClicked,
      onFieldFlowChanged
    }
  }
})
</script>
