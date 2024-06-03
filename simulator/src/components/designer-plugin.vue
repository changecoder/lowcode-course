<template>
  <DesignerView
    :componentMetadatas="componentMetadatas"
    :simulatorProps="{
      library,
      utilsMetadata
    }"
    :designer="editor.get('designer')"
    :editor="editor"
  />
</template>
<script setup>
import { ref } from 'vue'
import DesignerView from './designer-view.vue'

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
  }
}

setupAssets()
</script>