<template>
<a-tabs
  class="h-100"
  tab-position="top"
  type="card"
  default-active-key="attr"
  :tabBarStyle="{
    'margin-bottom': 0,
    'position': 'fixed',
    'top': '116px',
    'width': '300px',
    'background-color': 'white',
    'z-index': 100
  }"
  style="overflow: auto"
>
  <a-tab-pane key="attr" tab="基本属性" style="padding-top: 40px; overflow-y: scroll">
    <a-empty
      v-if="isNoneSeled"
      class="pt-30"
      description="没有组件被选择"
    />
    <properties v-else :properties="bscProps" title="基本信息"/>
  </a-tab-pane>
  <a-tab-pane key="style" tab="样式属性" style="padding-top: 40px; overflow-y: scroll">
    <a-empty
      v-if="isNoneSeled"
      class="pt-30"
      description="没有组件被选择"
    />
    <properties
      v-else
      v-for="item in subProps"
      :key="item.key"
      :title="item.title"
      :prefix="item.key"
      :properties="item.props"
    />
  </a-tab-pane>
</a-tabs>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'
import Properties from './Properties.vue'
import { Compo, Property, Page } from '@/common'
import properties from '../test_ress/properties.json'
interface SubProps {
  title: string
  key: string
  props: Property[]
}
export default defineComponent({
  name: 'StructBox',
  emits: ['addCompo'],
  components: {
    Properties,
  },
  setup () {
    const store = useStore()
    const seledPage = computed(() => store.getters.seledPage as Page)
    const seledCompo = computed(() => store.getters.seledCompo as Compo)
    const isNoneSeled = computed(() => {
      return !store.getters.seledCompo.name
        && !store.getters.seledPage.name
    })
    const bscProps = ref([] as Property[])
    const subProps = ref([] as SubProps[])

    watch(seledPage, () => {
      onSelPageChanged()
    })
    watch(seledCompo, () => {
      if (!seledCompo.value.name.length) {
        onSelPageChanged()
        return
      }
      const props = toPropList(seledCompo.value.ctype, seledCompo.value)
      if (props.bscProps.length) {
        bscProps.value = props.bscProps
        subProps.value = props.subProps
      } else {
        onSelPageChanged()
      }
    })

    function onSelPageChanged () {
      const props = toPropList('Page', seledPage.value)
      bscProps.value = props.bscProps
      subProps.value = props.subProps
    }
    function toPropList (iden: string, obj: any): {
      bscProps: Property[]
      subProps: SubProps[]
    } {
      const subProps: SubProps[] = []
      const bscProps: Property[] = []
      const propData = properties.data as any
      for (const rawProp of propData[iden]) {
        const prop = Property.copy(rawProp)
        if (prop.type in properties.data) {
          const props: Property[] = []
          for (const subProp of propData[prop.type]) {
            const newProp = Property.copy(subProp)
            passValue(newProp, obj[prop.key][newProp.key])
            props.push(newProp)
          }
          subProps.push({
            title: prop.title,
            key: prop.key,
            props
          })
        } else {
          // 基础类型，放在basic里
          const newProp = Property.copy(prop)
          let objVal = obj[prop.key]
          if ('group' in obj && prop.key === 'ctype') {
            objVal = `${obj['group']} / ${objVal}`
          }
          passValue(newProp, objVal)
          bscProps.push(newProp)
        }
      }
      return {
        bscProps, subProps
      }
    }
    function passValue (prop: Property, value: any) {
      switch (prop.type) {
      case 'number':
        if (value === 'auto' || value[0] === 'auto') {
          prop.value = 'NaN'
        } else {
          prop.value = value[0]
        }
        prop.unit = value[1]
        break
      default:
        prop.value = value
      }
    }
    return {
      seledPage,
      isNoneSeled,
      bscProps,
      subProps,
    }
  }
})
</script>

<style lang="less">
.ant-descriptions-header {
  margin-bottom: 0 !important;
}

.ant-collapse-content-box {
  padding: 0 !important;
}

.ant-collapse {
  border: none !important;
}

.props-form {
  border-top: 1px solid #f0f0f0;
}
</style>
