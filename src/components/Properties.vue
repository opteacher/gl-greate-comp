<template>
<a-descriptions bordered :column="1" size="small">
  <template #title>
    <h4 class="mb-0 ml-16">{{title}}</h4>
  </template>
  <a-descriptions-item
    v-for="prop in properties"
    :key="prop.key"
    :label="prop.title"
  >
    <template v-if="prop.type === 'text'">
      {{prop.value}}
    </template>
    <a-input
      v-else-if="prop.type === 'string'"
      v-model:value="prop.value"
      @change="e => { onValueChanged(e.target.value, prop) }"
      :disabled="chkDisabled(prop)"
    />
    <a-input
      v-else-if="prop.type === 'number'"
      v-model:value="prop.value"
      @change="e => { onValueChanged(e.target.value, prop) }"
      :disabled="chkDisabled(prop)"
    >
      <template #addonAfter>
        <a-select
          v-model:value="prop.unit"
          style="width: 80px"
          @change="e => { onUnitChanged(e, prop) }"
          :disabled="chkDisabled(prop)"
        >
          <a-select-option
            v-for="unit in UnitAry"
            :key="unit.value"
            :value="unit.value"
          >
            {{unit.title}}
          </a-select-option>
        </a-select>
      </template>
    </a-input>
    <a-select
      v-else-if="prop.type === 'select'"
      v-model:value="prop.value"
      class="w-100"
      @change="e => { onValueChanged(e, prop) }"
      :disabled="chkDisabled(prop)"
    >
      <a-select-option
        v-for="option in prop.options"
        :key="option"
        :value="option"
      >
        {{option}}
      </a-select-option>
    </a-select>
    <a-input
      v-else-if="prop.type === 'color'"
      placeholder="输入颜色代码"
      v-model:value="prop.value"
    >
      <template #suffix>
        <div :style="{
          'width': '20px',
          'height': '20px',
          'cursor': 'pointer',
          'border': '1px solid black',
          'background-color': prop.value
        }" @click="selClrVisible = true"/>
        <a-modal
          v-model:visible="selClrVisible"
          title="选择颜色"
          @ok="onSelClrConfirmed(prop)"
          @cancel="selClrVisible = false"
        >
          <my-color-select
            ref="myClrSel"
            :color="prop.value"
            @update:color="onSelClrChanged"
          />
        </a-modal>
      </template>
    </a-input>
  </a-descriptions-item>
</a-descriptions>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { Property, Unit, UnitAry } from '../common'
import MyColorSelect from '../components/MyColorSelect.vue'
export default defineComponent({
  name: 'ComponentItems',
  props: {
    title: { type: String, default: '' },
    properties: { type: Array, required: true },
    prefix: { type: String, default: '' }
  },
  components: {
    MyColorSelect
  },
  setup (props) {
    const store = useStore()
    const myClrSel = ref()
    const selClrVisible = ref(false)
    const selColor = ref({} as {
      r: number, g: number, b: number, a: number
    })

    function mkKey (prop: Property): string {
      return (props.prefix ? `${props.prefix}.` : '') + prop.key
    }
    function onValueChanged (value: any, prop: Property) {
      store.commit('SET_PROP_VALUE', {
        key: mkKey(prop), value, unit: prop.unit
      })
    }
    function onUnitChanged (unit: Unit, prop: Property) {
      store.commit('SET_PROP_VALUE', {
        key: mkKey(prop), unit
      })
    }
    function chkDisabled (prop: Property): boolean {
      if (!prop.disabled) {
        return false
      }
      return (props.properties.find((p: any) => {
        return p.key === prop.disabled?.key
      }) as Property).value === prop.disabled.val
    }
    function onSelClrConfirmed (prop: Property) {
      const value = myClrSel.value.rgba2hex(
        selColor.value.r,
        selColor.value.g,
        selColor.value.b,
        selColor.value.a
      )
      prop.value = value
      store.commit('SET_PROP_VALUE', {
        key: mkKey(prop), value
      })
      selClrVisible.value = false
    }
    function onSelClrChanged (color: {
      r: number, g: number, b: number, a: number
    }) {
      selColor.value = color
    }
    return {
      UnitAry,
      myClrSel,
      selClrVisible,

      onValueChanged,
      onUnitChanged,
      chkDisabled,
      onSelClrConfirmed,
      onSelClrChanged
    }
  }
})
</script>

<style lang="less">
.ant-descriptions-view {
  border: none !important;
}
</style>
