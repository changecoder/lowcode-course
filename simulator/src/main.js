import { createApp, h } from 'vue'

import { Designer } from './designer'
import { Material } from './material'
import { Editor } from './editor'
import DesignPlugin from './components/designer-plugin.vue'

import assets from './services/assets.json'

const editor = new Editor()
const designer = new Designer({ editor })
editor.set('designer', designer)

const material = new Material(editor)

material.setAssets(assets)

createApp(h(DesignPlugin, { editor })).mount(document.querySelector('#lce-container'))
