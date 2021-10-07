<template>
<a-form
  ref="formRef"
  :model="formState"
  :rules="formRules"
>
  <a-form-item ref="name" name="name">
    <a-input :value="formState.name" disabled/>
  </a-form-item>
  <a-form-item ref="type" name="type">
    <a-input :value="formState.type" disabled/>
  </a-form-item>
  <a-form-item ref="build" name="build">
    <a-select
      class="w-100"
      v-model:value="formState.build"
      placeholder="选择字段构建方式"
    >
      <a-select-option
        v-for="buildType in fldBldTypAry"
        :key="buildType"
        :value="buildType"
      >
        {{buildType}}
      </a-select-option>
    </a-select>
  </a-form-item>
  <a-form-item ref="source" name="source">
    <a-select
      v-if="formState.build === 'direct'"
      class="w-100"
      v-model:value="formState.source"
      placeholder="选择数据源"
    >
      <a-select-option
        v-for="dataSrc in dataSrcs"
        :key="dataSrc"
        :value="dataSrc"
      >
        {{dataSrc}}
      </a-select-option>
    </a-select>
    <template
      v-else-if="formState.build === 'process'"
    >
      <div>
        <a-button
          size="small"
          class="mr-3 mb-3"
          v-for="dataSrc in dataSrcs"
          :key="dataSrc"
          @click="formState.source += dataSrc"
        >{{dataSrc}}</a-button>
      </div>
      <a-textarea
        v-model:value="formState.source"
        placeholder="输入数据源"
        :rows="4"
      />
    </template>
  </a-form-item>
</a-form>
</template>

<script lang="ts">
import { Field, fldBldTypAry } from '@/common'
import { defineComponent, reactive, ref } from 'vue'
export default defineComponent({
  name: 'AddTableForm',
  props: {
    field: { type: Field, required: true },
    dataSrcs: { type: Array, default: () => [] }
  },
  setup (props) {
    const formRef = ref()
    const formState = reactive(props.field)
    const formRules = {
      name: [
        { required: true, message: '请输入表名！', trigger: 'blur' }
      ]
    }
    return {
      formRef,
      formState,
      formRules,
      fldBldTypAry,
    }
  }
})
</script>
