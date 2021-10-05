<template>
<a-row type="flex">
  <a-col flex="300px" style="line-height: 32px">
    <ul class="list-inline text-center">
      <li class="list-inline-item" v-if="seledObj">
        <b>选中对象</b>：{{seledObj}}
      </li>
      <li class="list-inline-item">
        <b>鼠标位置</b>：{{mousePos.x}},{{mousePos.y}}
      </li>
    </ul>
  </a-col>
  <a-col flex="auto">
    <a-radio-group
      :value="store.getters.designType"
      button-style="solid"
      @change="e => { store.commit('SET_DESIGN_TYPE', e.target.value) }"
    >
      <a-radio-button value="frontend">前端设计</a-radio-button>
      <a-radio-button value="backend">后端设计</a-radio-button>
    </a-radio-group>
  </a-col>
  <a-col flex="300px" style="line-height: 32px">
    <ul class="list-inline text-center">
      <li class="list-inline-item" v-if="seledObj">
        <b>UI框架</b>：{{uiFramework}}
      </li>
      <li class="list-inline-item">
        <b>UI库</b>：{{uiLibrary}}
      </li>
      <li class="list-inline-item">
        <a href="#">
          <SettingOutlined :style="{
            'font-size': '19px',
            'vertical-align': 'middle'
          }"/>
        </a>
      </li>
    </ul>
  </a-col>
</a-row>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { SettingOutlined } from '@ant-design/icons-vue'
import { useStore } from 'vuex'
import { Point } from '@/common'
export default defineComponent({
  name: 'FooterInformationBox',
  components: {
    SettingOutlined
  },
  setup () {
    const store = useStore()
    const mousePos = reactive(new Point())
    const seledCompo = computed(() => store.getters.seledCompo)
    const seledPage = computed(() => store.getters.seledPage)
    const seledObj = computed(() => seledCompo.value.name || seledPage.value.name)
    const uiFramework = computed(() => store.getters.uiFramework)
    const uiLibrary = computed(() => store.getters.uiLibrary)

    onMounted(() => {
      const pnlMain = document.getElementById('pnlMain')
      if (!pnlMain) {
        return
      }
      pnlMain.onmousemove = (e: MouseEvent) => {
        mousePos.x = e.offsetX
        mousePos.y = e.offsetY
      }
    })

    return {
      store,
      mousePos,
      seledObj,
      uiFramework,
      uiLibrary
    }
  }
})
</script>

<style lang="less">
.ant-descriptions-item {
  padding-bottom: 0 !important;
}
</style>
