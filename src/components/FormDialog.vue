<template>
<a-modal
  :visible="show"
  :title="title"
  @ok="onOkClick"
  @cancel="onCclClick"
>
  <a-form
    ref="formRef"
    :model="formState"
    :rules="formRules"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 18 }"
  >
    <template v-for="(value, key) in mapper" :key="key">
      <a-form-item
        v-if="value.type === 'Input'"
        :label="value.label"
        :ref="key" :name="key"
        :disabled="value.disabled"
      >
        <a-input v-model:value="formState[key]"/>
      </a-form-item>
      <a-form-item
        v-else-if="value.type === 'Select'"
        :label="value.label"
        :ref="key" :name="key"
      >
        <a-select
          class="w-100"
          v-model:value="formState[key]"
        >
          <a-select-option
            v-for="item in value.options"
            :key="item.value || item"
            :value="item.value || item"
          >
            {{item.title || item}}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        v-else-if="value.type === 'Checkbox'"
        :label="value.label"
        :ref="key" :name="key"
      >
        <a-checkbox :name="key"
          v-model:checked="formState[key]"
        >
          {{formState[key]
            ? (value.chkLabels[1] || '是')
            : (value.chkLabels[0] || '否')}}
        </a-checkbox>
      </a-form-item>
    </template>
  </a-form>
</a-modal>
</template>

<script lang="ts">
import { Mapper } from '@/common'
import { defineComponent, reactive, ref } from 'vue'
export default defineComponent({
  name: 'FormDialog',
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Form Dialog' },
    onSubmit: { type: Function, required: true },
    object: { type: Object, required: true },
    mapper: { type: Mapper, required: true },
  },
  emits: [
    'update:show',
    'submit'
  ],
  setup (props, { emit }) {
    const formRef = ref()
    const formState = reactive(props.object)
    const formRules = Object.fromEntries(
      Object.entries(props.mapper).map((entry) => {
        return [entry[0], entry[1].rules]
      })
    )

    async function onOkClick () {
      try {
        await formRef.value.validate()
        emit('submit', formState)
        formRef.value.resetFields()
        emit('update:show', false)
      } catch (e) {
        console.log(e)
      }
    }
    function onCclClick () {
      emit('update:show', false)
    }
    function createTempVar (key: string) {
      return
    }
    return {
      formRef,
      formState,
      formRules,

      onOkClick,
      onCclClick
    }
  }
})
</script>
