<template>
<div class="node-tree">
  <a-tree
    :tree-data="nodeTree"
    :selected-keys="seledNode"
    :autoExpandParent="false"
    v-model:expandedKeys="expdedNodes"
    :show-line="true"
    @select="onTreeNodeSelect"
  >
    <template
      v-if="designType === 'frontend'"
      #title="{ key: nodeKey, title }"
    >
      <a-dropdown :trigger="['contextmenu']">
        <span>{{ title }}</span>
        <template #overlay>
          <a-menu @click="({ key: menuKey }) => {
            onTreeMenuClick(nodeKey, menuKey)
          }">
            <a-menu-item key="addChild">
              <template #icon>
                <SubnodeOutlined />
              </template>
              <span>添加子节点</span>
            </a-menu-item>
            <a-menu-item key="addBro">
              <template #icon>
                <SisternodeOutlined />
              </template>
              <span>添加兄弟节点</span>
            </a-menu-item>
            <a-menu-item key="delete">
              <template #icon>
                <DeleteOutlined style="color: #f5222d"/>
              </template>
              <span style="color: #f5222d">删除</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
  </a-tree>
</div>
<div class="props-form">
  <a-empty
    v-if="isNoneSeled || designType !== 'frontend'"
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
import { computed, createVNode, defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'
import Properties from './Properties.vue'
import { Compo, Property, Page, Field } from '@/common'
import properties from '../test_ress/properties.json'
import {
  SubnodeOutlined,
  SisternodeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
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
    Properties,
    SubnodeOutlined,
    SisternodeOutlined,
    DeleteOutlined
  },
  setup () {
    const store = useStore()
    const nodeTree = ref([])
    const designType = computed(() => store.getters.designType)
    const seledPage = computed(() => store.getters.seledPage as Page)
    const seledCompo = computed(() => store.getters.seledCompo as Compo)
    const seledTblName = computed(() => store.getters.selTblName as string)
    const seledNode = computed(() => {
      if (designType.value === 'frontend') {
        return [
          seledCompo.value.name || seledPage.value.name
        ]
      } else if (designType.value === 'backend') {
        return [seledTblName.value]
      } else {
        return []
      }
    })
    const expdedNodes = ref([] as string[])
    const isNoneSeled = computed(() => {
      return !store.getters.seledCompo.name
        && !store.getters.seledPage.name
    })
    const bscProps = ref([] as Property[])
    const subProps = ref([] as SubProps[])
    const actProps = ref('basic')

    watch(seledPage, () => {
      onSelPageChanged()
      expdedNodes.value = []
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
      onSelCompoChanged(seledCompo.value)
    })
    watch(seledTblName, () => {
      expdedNodes.value = [seledTblName.value]
    })
    watch(() => [
      store.getters.pages.length,
      store.getters.compoNames.length,
    ], () => {
      cvtPagesToTree()
    })

    function onSelPageChanged () {
      const props = toPropList('Page', seledPage.value)
      bscProps.value = props.bscProps
      subProps.value = props.subProps
    }
    function onSelCompoChanged (compo: Compo) {
      // 展开选中组件的所有父节点
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
      nodeTree.value = store.getters.pages.map(function(page: Page) {
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
    function onTreeMenuClick(nodeKey: string, menuKey: string) {
      switch (menuKey) {
      case 'addChild':
        store.commit('SET_ADD_CMP_DLG', {
          show: true, belong: nodeKey
        })
        break
      case 'addBro':
        break
      case 'delete':
        Modal.confirm({
          title: () => '确定删除该节点?',
          icon: () => createVNode(ExclamationCircleOutlined),
          content: () => '删除节点，该节点之后的子节点也会被全部删除！',
          okText: () => '确定',
          okType: 'danger',
          cancelText: () => '取消',
          onOk() {
            store.commit('DEL_COMPO', nodeKey)
          },
        })
        break
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
      designType,
      nodeTree,
      seledNode,
      expdedNodes,
      isNoneSeled,
      bscProps,
      subProps,
      actProps,

      onTreeNodeSelect,
      onTreeMenuClick
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
