<template>
<div class="center-container">
  <sel-ui-fwk-form :onFormSubmit="onSelUiFwkSubmit"/>
</div>
</template>

<script lang="ts">
import { SelUiFwkFormState } from '@/common'
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import SelUiFwkForm from '../components/SelUiFwkForm.vue'
export default defineComponent({
  name: 'Create',
  components: {
    SelUiFwkForm
  },
  setup () {
    const store = useStore()
    const router = useRouter()
    function onSelUiFwkSubmit (formState: SelUiFwkFormState) {
      store.commit('USE_UI_LIB', formState)
      router.push('/main')
    }
    return {
      onSelUiFwkSubmit
    }
  }
})
</script>
