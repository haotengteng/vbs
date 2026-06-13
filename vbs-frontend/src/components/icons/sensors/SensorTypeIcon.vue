<script setup lang="ts">
import { computed } from 'vue';
import LevelIcon from './LevelIcon.vue';
import FlowIcon from './FlowIcon.vue';
import PhIcon from './PhIcon.vue';
import TempIcon from './TempIcon.vue';
import DoIcon from './DoIcon.vue';
import CodIcon from './CodIcon.vue';
import Nh3Icon from './Nh3Icon.vue';
import TurbIcon from './TurbIcon.vue';
import GenericIcon from './GenericIcon.vue';

const props = defineProps<{
  type?: string;
  size?: number;
}>();

const iconType = computed(() => {
  if (!props.type) return 'generic';
  const t = props.type.toLowerCase();
  switch (t) {
    case 'level':
      return 'level';
    case 'flow':
      return 'flow';
    case 'ph':
      return 'ph';
    case 'temp':
      return 'temp';
    case 'do':
      return 'do';
    case 'cod':
      return 'cod';
    case 'nh3':
      return 'nh3';
    case 'turb':
      return 'turb';
    default:
      return 'generic';
  }
});
</script>

<template>
  <LevelIcon v-if="iconType === 'level'" :size="size" />
  <FlowIcon v-else-if="iconType === 'flow'" :size="size" />
  <PhIcon v-else-if="iconType === 'ph'" :size="size" />
  <TempIcon v-else-if="iconType === 'temp'" :size="size" />
  <DoIcon v-else-if="iconType === 'do'" :size="size" />
  <CodIcon v-else-if="iconType === 'cod'" :size="size" />
  <Nh3Icon v-else-if="iconType === 'nh3'" :size="size" />
  <TurbIcon v-else-if="iconType === 'turb'" :size="size" />
  <GenericIcon v-else :size="size" />
</template>
