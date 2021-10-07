<template>
<a-row class="p-5" :gutter="5" type="flex">
  <a-col flex="auto">
    <a-button
      class="w-100" type="primary"
      @click="showEdtClazz = true"
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
<a-collapse v-model:activeKey="actPage" :bordered="false" accordion>
  <a-collapse-panel
    class="plr-5"
    v-for="page of pages"
    :key="page.name"
    :header="page.name"
  >
    <a-card
      v-for="clazz in page.classes"
      :key="clazz.name"
      class="w-100 mb-10"
      :bodyStyle="{ padding: 0 }"
    >
      <template #title>
        {{clazz.name}}
        <a-tag v-if="clazz.copyable" color="#87d068">copy</a-tag>
      </template>
      <template #extra>
        <a href="#" @click="onEdtClazzClick(clazz)">
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
  </a-collapse-panel>
</a-collapse>
<form-dialog
  :show="showEdtClazz"
  @update:show="showEdtClazz = $event"
  title="添加类或枚举"
  :object="edtClazz"
  :mapper="edtClazzMapper"
  @submit="onEdtclassesubmit"
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
import { computed, ComputedRef, defineComponent, ref, watch } from 'vue'
import {
  EllipsisOutlined,
  PlusOutlined,
  SettingOutlined,
  FormOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import { Clazz, ClsProp, fldTypAry, ObjectMapper, Page } from '@/common'
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
const edtClazzMapper = new ObjectMapper({
  name: {
    label: '类名',
    type: 'Input',
    rules: [
      { required: true, message: '请输入类名！', trigger: 'blur'}
    ]
  },
  belong: {
    label: '所属页面',
    type: 'Select',
    options: [],
    rules: [
      { required: true, message: '选择所属页面！', trigger: 'blur'}
    ]
  },
  copyable: {
    label: '带复制函数',
    type: 'Checkbox',
    chkLabels: ['不带', '带复制']
  }
})
const edtPropMapper = new ObjectMapper({
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
  name: 'MetaTypeBox',
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
    const pages: ComputedRef<Page> = computed(() => store.getters.pages)
    const actPage = ref([] as string[])
    const pageMetas = computed(() => pages.value.metas)
    const showEdtClazz = ref(false)
    const edtClazz = ref(new Clazz())
    const showEdtProp = ref(false)
    const edtProp = ref(new ClsProp())

    watch(() => store.getters.pages.length, () => {
      actPage.value = pages.value.length ? [pages.value[0].name] : []
      edtClazzMapper['belong'].options = store.getters.pages
        .map((page: any) => page.name)
    })
    edtPropMapper['type'].options = fldTypAry

    function onEdtclassesubmit (clazz: Clazz) {
      store.commit('ADD_CLASS', clazz)
    }
    function onEdtClazzClick(clazz: Clazz) {
      edtClazz.value = clazz
      showEdtClazz.value = true
    }
    function onEdtPropSubmit (prop: ClsProp) {
      store.commit('SAVE_CLASS_PROP', {
        clazz: edtClazz.value, prop
      })
    }
    function onAddPropClick (clazz: Clazz) {
      edtClazz.value = clazz
      showEdtProp.value = true
    }
    function onDelPropSubmit (key: number) {
      console.log(key)
    }
    return {
      pages,
      actPage,
      columns,
      pageMetas,
      showEdtClazz,
      edtClazz,
      edtClazzMapper,
      showEdtProp,
      edtProp,
      edtPropMapper,

      onEdtclassesubmit,
      onEdtClazzClick,
      onEdtPropSubmit,
      onAddPropClick,
      onDelPropSubmit
    }
  }
})
</script>
