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
    <template v-for="(value, key) in formMapper" :key="key">
      <template v-if="isDisplay(key as string)">
        <a-form-item :ref="key" :name="key">
          <template #label>
            {{value.label}}&nbsp;
            <a-tooltip v-if="value.desc">
              <template #title>{{value.desc}}</template>
              <InfoCircleOutlined />
            </a-tooltip>
          </template>
          <a-input
            v-if="value.type === 'Input'"
            v-model:value="formState[key]"
            :disabled="value.disabled"
          />
          <a-select
            v-else-if="value.type === 'Select'"
            class="w-100"
            v-model:value="formState[key]"
            :disabled="value.disabled"
          >
            <a-select-option
              v-for="item in value.options"
              :key="typeof item === 'string' ? item : item.value"
              :value="typeof item === 'string' ? item : item.value"
            >
              {{typeof item === 'string' ? item : item.title}}
              <span
                v-if="typeof item !== 'string' && item.subTitle"
                style="float: right"
              >
                {{item.subTitle}}
              </span>
            </a-select-option>
          </a-select>
          <a-checkbox
            v-else-if="value.type === 'Checkbox'"
            :name="key"
            v-model:checked="formState[key]"
            :disabled="value.disabled"
          >
            {{formState[key]
              ? (value.chkLabels ? value.chkLabels[1] : '是')
              : (value.chkLabels ? value.chkLabels[0] : '否')}}
          </a-checkbox>
          <a-textarea
            v-else-if="value.type === 'Textarea'"
            v-model:value="formState[key]"
            :rows="4"
            :disabled="value.disabled"
          />
          <a-cascader
            v-else-if="value.type === 'Cascader'"
            :options="value.options"
            v-model:value="formState[key]"
            :disabled="value.disabled"
          />
        </a-form-item>
      </template>
    </template>
  </a-form>
</a-modal>
</template>

<script lang="ts">
import { Cond, Mapper } from '@/common'
import { defineComponent, reactive, ref, watch } from 'vue'
import { InfoCircleOutlined } from '@ant-design/icons-vue'
export default defineComponent({
  name: 'FormDialog',
  components: {
    InfoCircleOutlined
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Form Dialog' },
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
    const formMapper = reactive(props.mapper)

    for (const [key, value] of Object.entries(props.mapper)) {
      if (!value.changes) {
        continue
      }
      for (const chg of value.changes) {
        watch(() => formState[chg.cond.key], () => {
          if (chg.cond.isVaild(formState)) {
            (formMapper[key] as any)[chg.attr.key] = chg.attr.val
          }
        })
      }
    }

    function isDisplay (key: string): boolean {
      const display = props.mapper[key].display
      if (typeof display === 'boolean') {
        return display as boolean
      } else {
        return (display as Cond).isVaild(formState)
      }
    }
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
    return {
      formRef,
      formState,
      formRules,
      formMapper,

      onOkClick,
      onCclClick,
      isDisplay
    }
  }
})
</script>
