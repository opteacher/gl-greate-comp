<template>
<div style="overflow-x: hidden">
  <a-row class="p-5" :gutter="5" type="flex">
    <a-col flex="auto">
      <a-button
        class="w-100" type="primary"
        @click="showEdtClass = true"
      >添加类</a-button>
    </a-col>
    <a-col flex="auto">
      <a-button class="w-100">添加枚举</a-button>
    </a-col>
    <a-col flex="32px">
      <a-button>
        <template #icon>
          <EllipsisOutlined />
        </template>
      </a-button>
    </a-col>
  </a-row>
  <div
    v-for="clazz in selPage.classes"
    :key="clazz.name"
    class="plr-5 pb-10"
  >
    <a-card :bodyStyle="{ padding: 0 }">
      <template #title>
        {{clazz.name}}
        <a-tag v-if="clazz.copyable" color="#87d068">copy</a-tag>
      </template>
      <template #extra>
        <a href="#" @click="onEdtClassClick(clazz)">
          <SettingOutlined />
        </a>
      </template>
      <div class="p-5">
        <a-button
          class="w-100" type="primary"
          @click="onAddPropClick(clazz)"
        >
          <template #icon><PlusOutlined /></template>
          添加属性
        </a-button>
      </div>
      <a-table
        :columns="columns"
        :data-source="clazz.props"
        :pagination="false"
      >
        <template #actionHeader><FormOutlined /></template>
        <template #action="{ record }">
          <a-popconfirm
            title="确定删除该属性？"
            @confirm="onDelPropSubmit(record.key)"
          >
            <DeleteOutlined style="color: #f5222d" />
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>
  </div>
</div>
<form-dialog
  :show="showEdtClass"
  @update:show="showEdtClass = $event"
  title="添加类或枚举"
  :object="edtClass"
  :mapper="edtClassMapper"
  @submit="onEdtClassSubmit"
/>

<form-dialog
  :show="showEdtProp"
  @update:show="showEdtProp = $event"
  title="添加类属性"
  :object="edtProp"
  :mapper="edtPropMapper"
  @submit="onEdtPropSubmit"
/>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import {
  EllipsisOutlined,
  PlusOutlined,
  SettingOutlined,
  FormOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import { Clazz, Attr, basicTypes, Mapper } from '@/common'
import FormDialog from './FormDialog.vue'
const columns = [
  {
    title: '属性',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    dataIndex: 'action',
    key: 'action',
    width: '50px',
    slots: { title: 'actionHeader', customRender: 'action' },
  }
]
const edtClassMapper = new Mapper({
  name: {
    label: '类名',
    type: 'Input',
    rules: [
      { required: true, message: '请输入类名！', trigger: 'blur'}
    ]
  },
  copyable: {
    label: '带复制函数',
    type: 'Checkbox',
    chkLabels: ['不带', '带复制']
  }
})
const edtPropMapper = new Mapper({
  name: {
    label: '属性名',
    type: 'Input',
    rules: [
      { required: true, message: '请输入属性名！', trigger: 'blur'}
    ]
  },
  type: {
    label: '属性类型',
    type: 'Select',
    options: [],
    rules: [
      { required: true, message: '请选择属性类型！', trigger: 'blur'}
    ]
  },
})
export default defineComponent({
  name: 'ClassEnumBox',
  components: {
    EllipsisOutlined,
    PlusOutlined,
    SettingOutlined,
    FormOutlined,
    DeleteOutlined,
    FormDialog
  },
  setup () {
    const store = useStore()
    const selPage = computed(() => store.getters.seledPage)
    const showEdtClass = ref(false)
    const edtClass = ref(new Clazz())
    const showEdtProp = ref(false)
    const edtProp = ref(new Attr())

    watch(() => store.getters.seledPage, () => {
      edtClass.value.belong = store.getters.seledPage.name
    })
    edtPropMapper['type'].options = store.getters.avaTypes

    function onEdtClassSubmit (clazz: Clazz) {
      store.commit('ADD_CLASS', clazz)
    }
    function onEdtClassClick(clazz: Clazz) {
      edtClass.value = clazz
      showEdtClass.value = true
    }
    function onEdtPropSubmit (attr: Attr) {
      store.commit('SAVE_ATTR', {
        entry: attr,
        prop: `classes.${
          selPage.value.classes.findIndex((cls: any) => {
            return cls.key === edtClass.value.key
          })
        }.props`,
        copy: Attr.copy,
      })
    }
    function onAddPropClick (clazz: Clazz) {
      edtClass.value = clazz
      showEdtProp.value = true
    }
    function onDelPropSubmit (key: number) {
      store.commit('DEL_ATTR', {
        prop: `classes.${
          selPage.value.classes.findIndex((cls: any) => {
            return cls.key === edtClass.value.key
          })
        }.props`,
        key,
      })
    }
    return {
      columns,
      selPage,
      showEdtClass,
      edtClass,
      edtClassMapper,
      showEdtProp,
      edtProp,
      edtPropMapper,

      onEdtClassSubmit,
      onEdtClassClick,
      onEdtPropSubmit,
      onAddPropClick,
      onDelPropSubmit
    }
  }
})
</script>
