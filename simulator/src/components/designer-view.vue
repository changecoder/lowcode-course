<template>
  <ProjectView :designer="designer" />
</template>
<script setup>
import { watch } from 'vue'
import ProjectView from './project-view.vue'
const props = defineProps(['designer', 'simulatorProps', 'componentMetadatas', 'editor'])
const { designer, componentMetadatas, simulatorProps, editor } = props
designer.setProps({
  componentMetadatas,
  simulatorProps,
  editor
})
watch(props, (value) => {
  designer.setProps(value)
})
</script>