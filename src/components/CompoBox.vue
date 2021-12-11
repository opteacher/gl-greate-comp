<template>
<a-tabs style="height: 50%; overflow-y: scroll" tab-position="top" type="card" v-model:activeKey="actGroup">
  <a-tab-pane v-for="group in groups" :key="group.name" :tab="group.name">
    <div class="plr-10" style="overflow-y: scroll">
      <a-list item-layout="horizontal" :data-source="group.compos">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :description="item.desc">
              <template #title>
                <a href="#" @click="$emit('addCompo', group.name, item.name)">
                  {{item.name}}
                </a>
              </template>
              <template #avatar>
                <a-avatar
                  :size="64"
                  shape="square"
                  :src="item.cover"
                  :draggable="true"
                  :style="{ 'vertical-align': 'middle' }"
                />
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </a-tab-pane>
</a-tabs>
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
</template>

<script lang="ts">
import { Compo, CompoInfo, Page } from '@/common'
import { computed, createVNode, defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'
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

export default defineComponent({
  name: 'ComponentBox',
  emits: ['addCompo'],
  components: {
    SubnodeOutlined,
    SisternodeOutlined,
    DeleteOutlined
  },
  setup (_props, { emit }) {
    const store = useStore()
    const groups = computed(() => {
      const retun: { name: string, compos: CompoInfo[] }[] = []
      for (const cmpInf of store.getters.compoInfos) {
        let group = retun.find(gp => gp.name == cmpInf.group)
        if (!group) {
          group = {
            name: cmpInf.group,
            compos: [cmpInf]
          }
          retun.push(group)
        } else {
          group.compos.push(cmpInf)
        }
      }
      return retun
    })
    const actGroup = ref('basic')
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
    return {
      actGroup,
      groups,
      designType,
      nodeTree,
      seledNode,
      expdedNodes,

      onTreeNodeSelect,
      onTreeMenuClick
    }
  }
})
</script>

<style lang="less" scoped>
.compo-box-header {
  padding: 10px;
  position: fixed;
  top: 64px;
  width: 300px;
  z-index: 50;
  background-color: white;
}

.node-tree {
  border-top: 1px solid #d9d9d9;
  height: 50%;
  overflow: scroll;
}
</style>
