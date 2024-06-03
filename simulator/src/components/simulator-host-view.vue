<template>
  <div>
    <h1>BuiltinSimulatorHostView</h1>
    <div class="lc-simulator-content">
      <iframe ref="iframeRef" />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { BuiltinSimulatorHost } from '../host'
const props = defineProps(['project', 'designer', 'library'])
const { project, designer, library } = props
const iframeRef = ref(null)
const host = new BuiltinSimulatorHost(project, designer)
watch(() => props.library, (value) => {
  host.setProps({
    library: value
  })
}, {immediate: true})
onMounted(() => {
  host.mountContentFrame(iframeRef.value) 
})
</script>