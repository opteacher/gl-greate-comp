<template>
<div class="center-container">
  <sel-ui-fwk-form :onFormSubmit="onSelUiFwkSubmit"/>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import SelUiFwkForm from '../components/SelUiFwkForm.vue'
export default defineComponent({
  name: 'Create',
  components: {
    SelUiFwkForm
  },
  setup () {
    const router = useRouter()
    function onSelUiFwkSubmit (formState: any) {
      console.log(formState)
      router.push('/main')
    }
    return {
      onSelUiFwkSubmit
    }
  }
})
</script>
