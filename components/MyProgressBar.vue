<template>
    <div class="ProgressBar-container">
        <div class="ProgressBar-filler" :style="fillerStyles">&nbsp;</div>
    </div>
</template>

<script lang="ts" setup>
    import { computed, ref, watch, onMounted } from "vue";

    interface Props {
        duration?: number;
        completed?: number;
        bgcolor?: string;
        height?: string;
        isNotification?: boolean;
    }

    const props = withDefaults(defineProps<Props>(), {
        duration: 0,
        completed: 0,
        bgcolor: "green",
        height: "5px",
        isNotification: false,
    });
    const emit = defineEmits(["update", "completed"]);
    const completed = ref(props.completed);
    let lastEmittedValue = -1;

    watch(completed, (newVal) => {
        completed.value = newVal;
        const flooredValue = Math.floor(newVal);
        if (flooredValue !== lastEmittedValue) {
            lastEmittedValue = flooredValue;
            emit("update", flooredValue);
            if (flooredValue === 100) {
                emit("completed");
            }
        }
    });

    onMounted(() => {
        let adjustMS = 0;
        if (props.duration > 0) {
            if (props.isNotification) {
                adjustMS = 600;
            }
            const increment = 100 / ((props.duration+adjustMS) / 10);
            let progress = 0;
            const interval = setInterval(() => {
                progress += increment;
                if (progress >= 100) {
                    completed.value = 100;
                    clearInterval(interval);
                } else {
                    completed.value = progress;
                }
            }, 10);
        }
    });

    const fillerStyles = computed(() => {
        return {
            height: props.height,
            width: `${completed.value}%`,
            backgroundColor: props.bgcolor,
            transition: "width 10ms linear",
        };
    });
</script>

<style scoped>
.ProgressBar-container {
    width: 100%;
    background-color: #e0e0de;
}
</style>