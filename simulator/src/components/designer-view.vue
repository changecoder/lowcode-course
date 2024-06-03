<template>
  <ProjectView :designer="designer" />
</template>
<script setup>
import { watch } from 'vue'
import ProjectView from './project-view.vue'
const props = defineProps(['designer', 'simulatorProps', 'componentMetadatas', 'editor'])
const { designer } = props
watch(props, (value) => {
  designer.setProps(value)
}, { immediate: true})
</script>