<template>
    <div class="my-button">
      <button v-if="props.class!='none'" :class="['btn', `btn-${props.class}`,{ 'text-uppercase': props.uppercase }]" @click="emit('click')" :style="props.styleButton" :disabled="props.disabled"><span class="btn-text mx-1"><slot>{{ props.text }}</slot></span></button>
    <div v-else><span class="btn-text mx-1" :class="['cursor-pointer',{ 'text-uppercase': props.uppercase }]" @click="emit('click')"><slot>{{ props.text }}</slot></span></div>
</div>
</template>

<script lang="ts" setup>


import type { CSSProperties } from 'vue';

interface Props {
text: string;
class: string;
styleButton: CSSProperties;
uppercase: boolean;
disabled: boolean;
}

const props: Props = defineProps({
text:         { type: String,   default: "text_button" },
class:     { type: String,   default: "success" },
styleButton:  { type: Object as PropType<CSSProperties>, default: () => ({ borderRadius: "0.375rem" }) },
uppercase:    { type: Boolean,  default: true},
disabled:     { type: Boolean,  default: false},
});
const emit = defineEmits(['click']);
</script>

<style scoped>
button {
    height:   3.125rem;
    padding:  0;
    width:    100%;
}
</style>

