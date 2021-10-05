<template>
<a-form
  ref="formRef"
  :model="formState"
  :rules="formRules"
  @finish="onFormSubmit"
>
  <a-form-item ref="name" name="name">
    <a-input
      class="mb-10"
      v-model:value="formState.name"
      placeholder="输入组件名称"
    />
  </a-form-item>
  <a-form-item
    v-if="showButtons"
    class="text-center"
    :wrapper-col="{ span: 8, offset: 8 }"
  >
      <a-button type="primary" html-type="submit">Submit</a-button>
      <a-button style="margin-left: 10px" @click="resetForm">Reset</a-button>
    </a-form-item>
</a-form>
</template>

<script lang="ts">
import { Table } from '@/common'
import { defineComponent, reactive, ref } from 'vue'
export default defineComponent({
  name: 'AddTableForm',
  props: {
    showButtons: { type: Boolean, default: true }
  },
  setup () {
    const formRef = ref()
    const formState = reactive({
      name: '',
      fields: []
    } as Table)
    const formRules = {
      name: [
        { required: true, message: '请输入表名！', trigger: 'blur' }
      ]
    }

    function onFormSubmit (values: Table) {
      console.log(values)
    }
    return {
      formRef,
      formState,
      formRules,

      onFormSubmit
    }
  }
})
</script>
