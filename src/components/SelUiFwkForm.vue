<template>
<a-form
  class="w-100"
  ref="formRef"
  :model="formState"
  :rules="rules"
  :label-col="labelCol"
  :wrapper-col="wrapperCol"
>
  <a-form-item label="终端类型" name="terminal">
    <a-select v-model:value="formState.terminal" placeholder="请选择UI框架">
      <a-select-option
        v-for="terminal in terminals"
        :key="terminal.value"
        :value="terminal.value"
      >
        {{terminal.title}}
      </a-select-option>
    </a-select>
  </a-form-item>
  <a-form-item label="UI框架" name="framework">
    <a-select v-model:value="formState.framework" placeholder="请选择UI框架">
      <a-select-option
        v-for="framework in allFmwks"
        :key="framework.value"
        :value="framework.value"
      >
        {{framework.title}}
      </a-select-option>
    </a-select>
  </a-form-item>
  <a-form-item label="UI库" name="library">
    <a-select v-model:value="formState.library" placeholder="请选择UI库">
      <template v-if="formState.framework.length && formState.terminal.length">
        <a-select-option
          v-for="library in uiFrameworks[formState.framework][formState.terminal]"
          :key="library" :value="library"
        >
          {{library}}
        </a-select-option>
      </template>
    </a-select>
  </a-form-item>
  <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
    <a-button type="primary" @click="onSubmit">创建</a-button>
    <a-button class="ml-10" @click="onReset">重置</a-button>
  </a-form-item>
</a-form>
</template>

<script lang="ts">
import { notification } from 'ant-design-vue'
import { computed, defineComponent, reactive, ref, UnwrapRef } from 'vue'
import { SelUiFwkFormState, uiFrameworks, terminals } from '../common'
export default defineComponent({
  name: 'SelectUIFramework',
  props: {
    onFormSubmit: { type: Function, required: true }
  },
  setup (props) {
    const formRef = ref()
    const formState: UnwrapRef<SelUiFwkFormState> = reactive({
      terminal: '',
      framework: '',
      library: ''
    })
    const rules = {
      terminal: [
        { required: true, message: '', trigger: 'blur' }
      ],
      framework: [
        { required: true, message: '', trigger: 'blur' }
      ],
      library: [
        { required: true, message: '', trigger: 'blur' }
      ]
    }
    const allFmwks = computed(() => Object.entries(uiFrameworks).map(entry => ({
      title: entry[1].title,
      value: entry[0]
    })))

    async function onSubmit () {
      try {
        await formRef.value.validate()
        props.onFormSubmit(formState)
      } catch (err) {
        notification.error({
          message: '表单填写错误！',
          description: JSON.stringify(err)
        })
      }
    }
    function onReset () {
      formRef.value.resetFields()
    }
    return {
      allFmwks,
      uiFrameworks,
      terminals,
      labelCol: { span: 4, offset: 2 },
      wrapperCol: { span: 14 },
      formRef,
      formState,
      rules,

      onSubmit,
      onReset
    }
  }
})
</script>
