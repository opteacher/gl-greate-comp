<template>
<a-space class="p-10">
  <a-button type="primary" @click="addMod = true">添加{{title}}</a-button>
  <template v-if="description">
    <InfoCircleOutlined style="color: #1890ff"/>
    <p class="mb-0">{{description}}</p>
  </template>
</a-space>
<a-table
  :dataSource="dataSource"
  :columns="columns"
  :scroll="{ y: sclHeight }"
  :pagination="false"
>
  <template
    v-for="(value, key) in dataMapper"
    :key="key"
    #[key]="{ index, text, record }"
  >
    <template v-if="value.type === 'Input'">
      <a-input
        v-if="index === edtKey"
        v-model:value="edtRecord[key]"
        :placeholder="`输入${value.label}`"
      />
      <template v-else-if="$slots[key]">
        <slot :name="key" v-bind="{ record }"/>
      </template>
      <template v-else>{{text}}</template>
    </template>
    <template v-else-if="value.type === 'Select'">
      <a-select class="w-100"
        v-if="index === edtKey"
        v-model:value="edtRecord[key]"
        :placeholder="`选择${value.label}`"
      >
        <a-select-option
          v-for="item in value.options"
          :key="item.value || item"
          :value="item.value || item"
        >
          {{item.title || item}}
        </a-select-option>
      </a-select>
      <template v-else-if="$slots[key]">
        <slot :name="key" v-bind="{ record }"/>
      </template>
      <template v-else>{{text}}</template>
    </template>
    <template v-else-if="value.type === 'Checkbox'">
      <a-checkbox
        v-if="index === edtKey"
        v-model:checked="edtRecord[key]"
      >
        {{edtRecord[key]
          ? (value.chkLabels[1] || '是')
          : (value.chkLabels[0] || '否')}}
      </a-checkbox>
      <template v-else-if="$slots[key]">
        <slot :name="key" v-bind="{ record }"/>
      </template>
      <template v-else>
        {{record[key]
          ? (value.chkLabels[1] || '是')
          : (value.chkLabels[0] || '否')}}
      </template>
    </template>
    <template v-else-if="value.type === 'Cascader'">
      <a-cascader
        v-if="index === edtKey"
        v-model:value="edtRecord[key]"
        :options="value.options"
        :placeholder="`选择${value.label}`"
      />
      <template v-else-if="$slots[key]">
        <slot :name="key" v-bind="{ record }"/>
      </template>
      <template v-else>
        {{text}}
      </template>
    </template>
  </template>
  <template #action="{ index, record }">
    <template v-if="index === edtKey">
      <ul class="unstyled-list">
        <li class="mb-3">
          <a-button
            type="primary" size="small"
            @click="onSaveSubmit"
          >保存</a-button>
        </li>
        <li>
          <a-button size="small"
            @click="onCclClicked()"
          >取消</a-button>
        </li>
      </ul>
    </template>
    <template v-else>
      <ul class="unstyled-list">
        <li class="mb-3">
          <a-button size="small"
            @click="onEditClicked(index, record)"
          >编辑</a-button>
        </li>
        <li>
          <a-popconfirm
            title="确定删除该字段"
            @confirm="onDelSubmit(record.key)"
          >
            <a-button size="small" danger>删除</a-button>
          </a-popconfirm>
        </li>
      </ul>
    </template>
  </template>
</a-table>
</template>

<script lang="ts">
import { Mapper } from '@/common'
import { computed, defineComponent, ref, watch } from 'vue'
import { InfoCircleOutlined } from '@ant-design/icons-vue'
export default defineComponent({
  name: 'EditableTable',
  emits: ['save', 'delete'],
  components: {
    InfoCircleOutlined
  },
  props: {
    title: { type: String, default: ''},
    description: { type: String, default: '' },
    cols: { type: Array, required: true },
    data: { type: Array, required: true },
    sclHeight: { type: Number, default: 300 },
    dftRecord: { type: Object, default: () => ({}) },
    dataMapper: { type: Mapper, required: true }
  },
  setup (props, { emit }) {
    const addMod = ref(false)
    const edtKey = ref(-1)
    const columns = props.cols.concat({
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      width: 80
    })
    const dataSource = computed(() => props.data)
    const edtRecord = ref(props.dftRecord)

    watch(() => addMod.value, () => {
      if (addMod.value) {
        dataSource.value.unshift(props.dftRecord)
        edtKey.value = 0
      } else {
        dataSource.value.shift()
        edtKey.value = -1
      }
    })

    function onAddClicked () {
      addMod.value = true
      edtKey.value = 0
    }
    function onSaveSubmit () {
      emit('save', edtRecord.value)
      reset(true)
    }
    function onCclClicked () {
      reset()
    }
    function onEditClicked (index: number, record: any) {
      edtKey.value = index
      edtRecord.value = record
    }
    function onDelSubmit (key: number) {
      emit('delete', key)
      reset(true)
    }
    function reset (reset = false) {
      addMod.value = false
      edtKey.value = -1
      if (reset) {
        edtRecord.value.reset()
      }
    }
    return {
      addMod,
      columns,
      dataSource,
      edtKey,
      edtRecord,

      onAddClicked,
      onSaveSubmit,
      onCclClicked,
      onEditClicked,
      onDelSubmit,
    }
  }
})
</script>
