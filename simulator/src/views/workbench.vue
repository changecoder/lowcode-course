<template>
  <DesignerPlugin :editor="editor" />
</template>
<script setup>
import DesignerPlugin from '../components/designer-plugin.vue'
import { Designer } from '../designer'
import { Material } from '../material'
import { Editor } from '../editor'

import assets from '../services/assets.json'
import schema from '../services/schema.json'

const editor = new Editor()
const designer = new Designer({ editor })
editor.set('designer', designer)

const material = new Material(editor)
material.setAssets(assets)

const { project } = designer

project.open(schema)
</script>