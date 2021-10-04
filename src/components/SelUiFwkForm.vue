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
    <a-select v-model:value="formState.platform" placeholder="请选择部署平台">
      <a-select-option
        v-for="platform in uiPlatform"
        :key="platform.value"
        :value="platform.value"
      >
        {{platform.title}}
      </a-select-option>
    </a-select>
  </a-form-item>
  <a-form-item label="UI框架" name="framework">
    <a-select v-model:value="formState.framework" placeholder="请选择UI框架">
      <a-select-option
        v-for="framework in uiFrameworks"
        :key="framework.name"
        :value="framework.name"
      >
        {{framework.title}}
      </a-select-option>
    </a-select>
  </a-form-item>
  <a-form-item label="UI库" name="library">
    <a-select v-model:value="formState.library" placeholder="请选择UI库">
      <template v-if="formState.framework.length && formState.platform.length">
        <a-select-option
          v-for="library in uiLibraries"
          :key="library.name"
          :value="library.name"
        >
          {{library.name}}
        </a-select-option>
      </template>
    </a-select>
  </a-form-item>
  <a-form-item :wrapper-col="{ span: 8, offset: 8 }" class="text-center">
    <a-button type="primary" @click="onSubmit">创建</a-button>
    <a-button class="ml-10" @click="onReset">重置</a-button>
  </a-form-item>
</a-form>
</template>

<script lang="ts">
import { SelUiFwkFormState } from '@/common'
import { notification } from 'ant-design-vue'
import { computed, defineComponent, reactive, ref, UnwrapRef } from 'vue'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'SelectUIFramework',
  props: {
    onFormSubmit: { type: Function, required: true }
  },
  setup (props) {
    const store = useStore()
    store.commit('INIT_UI_LIBS')
    const uiPlatform = [
      {
        title: '电脑端',
        value: 'PC'
      }, {
        title: '移动端',
        value: 'mobile'
      }, {
        title: '小程序端',
        value: 'miniapp'
      }
    ]
    const uiFrameworks = computed(() => store.getters.uiFrameworks)
    const uiLibraries = computed(() => {
      const framework = uiFrameworks.value.find((fmwk: any) => {
        return fmwk.name === formState.framework
      })
      const platform = framework.platforms.find((plfm: any) => {
        return plfm.target === formState.platform
      })
      return platform.libraries
    })
    const formRef = ref()
    const formState: UnwrapRef<SelUiFwkFormState> = reactive({
      platform: '',
      framework: '',
      library: ''
    })
    const rules = {
      platform: [
        { required: true, message: '', trigger: 'blur' }
      ],
      framework: [
        { required: true, message: '', trigger: 'blur' }
      ],
      library: [
        { required: true, message: '', trigger: 'blur' }
      ]
    }

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
      uiFrameworks,
      uiLibraries,
      uiPlatform,
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
