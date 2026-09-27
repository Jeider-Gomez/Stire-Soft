<template>
  <component :is="icon" :size="size" aria-hidden="true" />
</template>

<script setup lang="ts">
import { ListChecks, CodeXml, TextCursorInput, ListOrdered, ArrowLeftRight, Shapes, PanelsTopLeft } from 'lucide-vue-next'

const props = withDefaults(defineProps<{ type: string; size?: number }>(), { size: 20 })

const ICONS: Record<string, unknown> = {
  mcq: ListChecks,
  coding: CodeXml,
  fill_code: TextCursorInput,
  ordering: ListOrdered,
  matching: ArrowLeftRight,
  drag_drop: Shapes,
  html_css: PanelsTopLeft
}

const icon = computed(() => ICONS[props.type] ?? ListChecks)
</script>
