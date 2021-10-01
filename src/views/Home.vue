<template>
  <div class="center-container">
    <div style="width: 50vw; min-height: 30vh">
      <a-row class="mb-10" :gutter="8">
        <a-col :span="12">
          <a-button class="w-100" @click="$router.push('/create')">创建</a-button>
        </a-col>
        <a-col :span="12">
          <a-button class="w-100">打开</a-button>
        </a-col>
      </a-row>
      <a-list bordered :data-source="recents">
        <template #renderItem="{ item }">
          <a-list-item>{{ item }}</a-list-item>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'Home',
  setup () {
    const recents = ref([])

    return {
      recents
    }
  }
})
</script>
