<template>
<div class="node-tree">
  <a-tree
    :tree-data="nodeTree"
    :selected-keys="seledNode"
    :autoExpandParent="false"
    v-model:expandedKeys="expdedNodes"
    :show-line="true"
    @select="onTreeNodeSelect"
    draggable
    @dragenter="onDragEnter"
    @dragstart="onDragStart"
    @drop="onDrop"
  >
    <template #title="{ key: nodeKey, title }">
      <a-dropdown :trigger="['contextmenu']">
        <span>{{ title }}</span>
        <template #overlay>
          <a-menu @click="(params: any) => {
            onTreeMenuClick(nodeKey, params.key)
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
</template>

<script lang="ts">
import { computed, createVNode, defineComponent, ref, watch } from 'vue'
import {
  SubnodeOutlined,
  SisternodeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import { Modal } from 'ant-design-vue'
import { Compo, DropPos, Page } from '@/common'

interface TreeNode {
  title: string
  key: string
  children?: TreeNode[]
}

export default defineComponent({
  name: 'StructureBox',
  emits: ['addCompo'],
  components: {
    SubnodeOutlined,
    SisternodeOutlined,
    DeleteOutlined
  },
  setup (_props, { emit }) {
    const store = useStore()
    const nodeTree = ref([])
    const seledPage = computed(() => store.getters.seledPage as Page)
    const seledCompo = computed(() => store.getters.seledCompo as Compo)
    const seledTblName = computed(() => store.getters.selTblName as string)
    const seledNode = computed(() => [
      seledCompo.value.name || seledPage.value.name
    ])
    const expdedNodes = ref([] as string[])

    watch(seledPage, () => {
      expdedNodes.value = []
    })
    watch(seledCompo, () => {
      onSelCompoChanged(seledCompo.value)
    })
    watch(seledTblName, () => {
      expdedNodes.value = [seledTblName.value]
    })
    watch(() => [
      store.getters.pages.length,
      store.getters.compoNames.length,
      store.getters.forceRefresh
    ], () => {
      if (store.getters.forceRefresh) {
        store.commit('SET_FC_REFRESH')
      }
      cvtPagesToTree()
    })
    cvtPagesToTree()

    function onTreeNodeSelect (seleds: string[], e: { selected: boolean }) {
      if (e.selected) {
        store.commit('SEL_NODE', seleds[0])
      } else {
        store.commit('RST_COMPO')
      }
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
    function onTreeMenuClick(nodeKey: string, menuKey: string) {
      switch (menuKey) {
      case 'addChild':
        emit('addCompo', nodeKey)
        break
      case 'addBro':
        emit('addCompo', store.getters.compoByName(nodeKey).parent)
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
    function onDragEnter(info: any) {
      expdedNodes.value = info.expandedKeys
    }
    function onDragStart (info: any) {
      console.log(info)
    }
    function onDrop(info: any) {
      let dropPos = '' as DropPos
      switch (info.dropPosition - Number(
        info.node.pos.split('-').pop()
      )) {
      case -1: // 前
        dropPos = 'top'
        break
      case 1: // 后
        dropPos = 'bottom'
        break
      case 0: // 中
        dropPos = 'inner'
        break
      }
      if (dropPos !== '') {
        store.dispatch('chgCompoPos', {
          dragCompo: info.dragNode.eventKey,
          dropCompo: info.node.eventKey,
          dropPos,
        })
      }
    }
    return {
      nodeTree,
      seledNode,
      expdedNodes,

      onTreeNodeSelect,
      onTreeMenuClick,
      onDragEnter,
      onDragStart,
      onDrop
    }
  }
})
</script>

<style lang="less" scoped>
.node-tree {
  border-top: 1px solid #d9d9d9;
  height: 50%;
  overflow: scroll;
}
</style>