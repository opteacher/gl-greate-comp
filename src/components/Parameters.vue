<template>
<a-descriptions bordered :column="1">
  <template #title>
    <h4 style="margin-top: 0.5em; margin-left: 1em">组件参数</h4>
  </template>
  <template #extra>
    <a-button
      type="primary" size="small"
      style="margin-right: 1em"
      @click="showAddParam = true"
    >添加参数</a-button>
  </template>
  <a-descriptions-item v-for="param in params" :key="param.name">
    <template #label>
      {{param.name}}&nbsp;
      <a-tooltip v-if="param.required">
        <template #title>必选</template>
        <CheckSquareOutlined/>
      </a-tooltip>
    </template>
    {{param.type}}
  </a-descriptions-item>
</a-descriptions>
<form-dialog
  :show="showAddParam"
  @update:show="showAddParam = $event"
  title="添加参数"
  :object="dftParam"
  :mapper="addParamMapper"
  @submit="onAddParamSubmit"
/>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import {
  CheckSquareOutlined
} from '@ant-design/icons-vue'
import FormDialog from '../components/FormDialog.vue'
import { ClsProp, fldTypAry, ObjectMapper } from '@/common'
import { useStore } from 'vuex'
const addParamMapper = new ObjectMapper({
  name: {
    label: '参数名',
    type: 'Input',
    rules: [
      { required: true, message: '请输入参数名！', trigger: 'blur'}
    ]
  },
  type: {
    label: '参数类型',
    type: 'Select',
    options: [],
    rules: [
      { required: true, message: '请选择参数类型！', trigger: 'blur'}
    ]
  },
  required: {
    label: '必选',
    type: 'Checkbox',
  },
  dftVal: {
    label: '默认值',
    type: 'Input',
    disabled: (prop: ClsProp) => prop.required,
  }
})
export default defineComponent({
  name: 'Parameters',
  components: {
    CheckSquareOutlined,
    FormDialog
  },
  setup () {
    const store = useStore()
    const dftParam = new ClsProp()
    const showAddParam = ref(false)
    const params = computed(() => {
      return store.getters.seledPage.name ? store.getters.seledPage.params : []
    })

    addParamMapper['type'].options = fldTypAry

    function onAddParamSubmit (e: ClsProp) {
      store.commit('SAVE_PARAM', e)
    }
    return {
      params,
      dftParam,
      showAddParam,
      addParamMapper,

      onAddParamSubmit
    }
  }
})
</script>
