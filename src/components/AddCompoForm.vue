<template>
<a-form
  ref="formRef"
  :model="formState"
  :rules="formRules"
>
  <a-form-item ref="name" name="name">
    <a-input
      class="mb-10"
      v-model:value="formState.name"
      placeholder="输入组件名称"
    />
  </a-form-item>
  <a-form-item ref="type" name="type">
    <a-select
      class="w-100"
      v-model:value="formState.type"
      placeholder="选择组件类型"
    >
      <a-select-option
        v-for="cmpInf in store.getters.allCompoInfos"
        :key="cmpInf.name"
        :value="cmpInf.name"
      >
        {{cmpInf.name}}
      </a-select-option>
    </a-select>
  </a-form-item>
  <a-form-item ref="parent" name="parent">
    <a-select
      class="w-100"
      v-model:value="formState.parent"
      placeholder="选择加入的页面"
    >
      <a-select-option
        v-for="page in store.getters.pages"
        :key="page.name"
        :value="page.name"
      >
        {{page.name}}
      </a-select-option>
    </a-select>
  </a-form-item>
</a-form>
</template>

<script lang="ts">
import { defineComponent, onUpdated, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
interface AddCmpFormState {
  name: string
  type: string
  parent: string
}
export default defineComponent({
  name: 'addComponentForm',
  setup () {
    const store = useStore()
    const formRef = ref()
    const formState = reactive({
      type: store.getters.addCmpInfo.cmpTyp || null,
      parent: store.getters.addCmpInfo.belong || null
    } as AddCmpFormState)
    const formRules = {
      name: [
        { required: true, message: '请输入组件名称！', trigger: 'blur' },
        { validator: validCompoName }
      ],
      type: [
        { required: true, message: '请选择组件类型！', trigger: 'change' }
      ],
      parent: [
        { required: true, message: '请选择组件父节点！', trigger: 'change' }
      ]
    }

    watch(() => store.getters.addCmpActive, () => {
      if (store.getters.addCmpActive) {
        formState.type = store.getters.addCmpInfo.cmpTyp || null
        formState.parent = store.getters.addCmpInfo.belong || null
      }
    })

    function validCompoName (_rule: any, value: string) {
      if (store.getters.allCompoNames.includes(value)
      || store.getters.allPageNames.includes(value)) {
        return Promise.reject('该名称已被占用')
      } else {
        return Promise.resolve()
      }
    }
    return {
      store,
      formRef,
      formState,
      formRules
    }
  }
})
</script>
