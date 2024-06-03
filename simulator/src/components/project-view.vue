<template>
  <BuiltinSimulatorHostView v-bind="props.designer.projectSimulatorProps" />
</template>
<script setup>
import BuiltinSimulatorHostView from './simulator-host-view.vue'
const props = defineProps(['designer'])
</script>