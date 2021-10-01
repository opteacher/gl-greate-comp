<template>
<div class="node-tree">
  <a-tree
    :tree-data="nodesTree"
    :selected-keys="seledNode"
    :autoExpandParent="false"
    v-model:expandedKeys="expdedNodes"
    :show-line="true"
    @select="onTreeNodeSelect"
  />
</div>
<div class="props-form">
  <a-empty
    v-if="isNoneSeled"
    description="没有组件被选择"
    class="pt-30"
  />
  <template v-else>
    <a-collapse v-model:activeKey="actProps">
      <a-collapse-panel key="basic" header="基本信息">
        <properties :properties="bscProps"/>
      </a-collapse-panel>
      <a-collapse-panel
        v-for="item in subProps"
        :key="item.key"
        :header="item.title"
      >
        <properties
          :prefix="item.key"
          :properties="item.props"
        />
      </a-collapse-panel>
    </a-collapse>
  </template>
</div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
import Properties from './Properties.vue'
import { Compo, Property, Page } from '@/common'
import properties from '../test_ress/properties.json'
interface TreeNode {
  title: string
  key: string
  children?: TreeNode[]
}
interface SubProps {
  title: string
  key: string
  props: Property[]
}
export default defineComponent({
  name: 'StructBox',
  components: {
    Properties
  },
  setup () {
    const store = useStore()
    const nodesTree = ref([])
    const seledPage = computed(() => store.getters.seledPage as Page)
    const seledCompo = computed(() => store.getters.seledCompo as Compo)
    const seledNode = computed(() => {
      return [seledCompo.value.name || seledPage.value.name]
    })
    const expdedNodes = ref([] as string[])
    const isNoneSeled = computed(() => {
      return !store.getters.seledCompo.name && !store.getters.seledPage.name
    })
    const bscProps = ref([] as Property[])
    const subProps = ref([] as SubProps[])
    const actProps = ref('basic')

    watch(seledPage, () => {
      onSelPageChanged()
      expdedNodes.value = []
    })
    watch(seledCompo, () => {
      const props = toPropList(seledCompo.value.ctype, seledCompo.value)
      if (props.bscProps.length) {
        bscProps.value = props.bscProps
        subProps.value = props.subProps
      } else {
        onSelPageChanged()
      }
      onSelCompoChanged(seledCompo.value)
    })
    watch(() => store.getters.pages, () => {
      cvtPagesToTree()
    })

    function onSelPageChanged () {
      const props = toPropList('Page', seledPage.value)
      bscProps.value = props.bscProps
      subProps.value = props.subProps
    }
    function onSelCompoChanged (compo: Compo) {
      if (!compo.name.length) {
        return
      }
      do {
        if (!expdedNodes.value.includes(compo.parent)) {
          expdedNodes.value.push(compo.parent)
        }
        compo = store.getters.compoByName(compo.parent)
        if (!compo) {
          break
        }
      } while (compo.parent.length)
    }
    function cvtPagesToTree () {
      nodesTree.value = store.getters.pages.map(function(page: Page) {
        const retPg: TreeNode = { title: page.name, key: page.name }
        if(page.children.length) {
          const scanCompos = (compo: Compo) => {
            const retCmp: TreeNode = { title: compo.name, key: compo.name }
            if (compo.children && compo.children.length) {
              retCmp.children = compo.children.map(scanCompos)
            }
            return retCmp
          }
          retPg.children = page.children.map(scanCompos)
        }
        return retPg
      })
    }
    function onTreeNodeSelect (seleds: string[], e: { selected: boolean }) {
      if (e.selected) {
        store.commit('SEL_NODE', seleds[0])
      } else {
        store.commit('RST_COMPO')
      }
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
          passValue(newProp, obj[prop.key])
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
      nodesTree,
      seledNode,
      expdedNodes,
      isNoneSeled,
      bscProps,
      subProps,
      actProps,

      onTreeNodeSelect
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

.node-tree {
  height: 50%;
  overflow: scroll;
}

.props-form {
  height: 50%;
  overflow-y: scroll;
  border-top: 1px solid #f0f0f0;
}
</style>
