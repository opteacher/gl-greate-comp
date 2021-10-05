<template>
<a-row type="flex">
  <a-col flex="300px">
    <a-row class="p-10" type="flex">
      <a-col :span="20">
        <a-input-search
          v-model:value="schCompo"
          placeholder="input search text"
          enter-button
          @search="onSchCompSubmit"
        />
      </a-col>
      <a-col flex="auto" class="text-right">
        <a-button @click="onDisplayModSwitch">
          <template #icon>
            <BarsOutlined v-if="displayMod === 'list'" />
            <AppstoreOutlined v-else />
          </template>
        </a-button>
      </a-col>
    </a-row>
  </a-col>
  <a-col flex="auto" :style="{
    'background-color': 'white',
    'border-bottom': '1px solid rgb(240, 242, 245)'
  }">
    <a-space class="p-10">
      <template v-if="store.getters.designType === 'frontend'">
        <a-button
          :type="`${curOper === 'move' ? 'primary' : 'default'}`"
          @click="onOperBtnClicked('move')"
        >
          <DragOutlined />移动
        </a-button>
        <a-button
          :type="`${curOper === 'resize' ? 'primary' : 'default'}`"
          @click="onOperBtnClicked('resize')"
        >
          <GatewayOutlined />缩放
        </a-button>
        <a-button>
          <PushpinOutlined />磁吸
        </a-button>
      </template>
      <template v-if="store.getters.designType === 'backend'">
        <a-button @click="showAddTable = true">
          <PlusOutlined />添加表
        </a-button>
      </template>
    </a-space>
  </a-col>
  <a-col flex="300px">
    <a-input-search
      class="p-10"
      enter-button
      v-model:value="schNode"
      placeholder="input search text"
      @search="onSchNodeSubmit"
    />
  </a-col>
</a-row>
<a-modal
  v-model:visible="showAddTable"
  title="添加表"
  @ok="onAddTableSubmit"
>
  <add-table-form ref="addTableRef" :showButtons="false"/>
</a-modal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import {
  DragOutlined,
  GatewayOutlined,
  PushpinOutlined,
  BarsOutlined,
  AppstoreOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import { OperType } from '@/common'
import AddTableForm from '../components/AddTableForm.vue'
export default defineComponent({
  name: 'OperationBox',
  components: {
    DragOutlined,
    GatewayOutlined,
    PushpinOutlined,
    BarsOutlined,
    AppstoreOutlined,
    PlusOutlined,
    AddTableForm
  },
  setup () {
    const store = useStore()
    const curOper = computed(() => store.getters.curOper)
    const schCompo = ref('')
    const displayMod = ref('list')
    const schNode = ref('')
    const addTableRef = ref()
    const showAddTable = ref(false)

    function onOperBtnClicked (oper: OperType) {
      store.commit('SET_OPER', oper)
    }
    function onSchCompSubmit () {
      console.log(schCompo.value)
    }
    function onSchNodeSubmit () {
      console.log(schNode)
    }
    function onDisplayModSwitch () {
      displayMod.value = displayMod.value === 'list' ? 'grid' : 'list'
    }
    async function onAddTableSubmit () {
      try {
        await addTableRef.value.formRef.validate()
        store.commit('ADD_TABLE', addTableRef.value.formState)
        showAddTable.value = false
      } catch (e) {
        console.log(e)
        return
      }
    }
    return {
      store,
      curOper,
      schCompo,
      displayMod,
      schNode,
      addTableRef,
      showAddTable,

      onOperBtnClicked,
      onSchCompSubmit,
      onDisplayModSwitch,
      onSchNodeSubmit,
      onAddTableSubmit,
    }
  }
})
</script>
