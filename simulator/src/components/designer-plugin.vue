<template>
  <div>
    <div v-if="loading">Loading</div>
    <div v-else>
      <DesignerView
        :componentMetadatas="componentMetadatas"
        :simulatorProps="{
          library,
          utilsMetadata
        }"
        :designer="editor.get('designer')"
        :editor="editor"
      />
    </div>
  </div>

</template>
<script setup>
import { ref } from 'vue'
import DesignerView from './designer-view.vue'

const loading = ref(true)
const { editor } = defineProps(['editor'])
const componentMetadatas = ref([])
const library = ref([])
const utilsMetadata = ref([])

const setupAssets = async () => {
  try {
    const assets = await editor.onceGot('assets')
    const { components, packages, utils } = assets
    if (components) {
      componentMetadatas.value = components
    }
    if (packages) {
      library.value = packages
    }
    if (utils) {
      utilsMetadata.value = utils
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

setupAssets()
</script>