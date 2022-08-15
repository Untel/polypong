<template>
{{ id }}
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { defineComponent } from 'vue';

const auth = useAuthStore();

defineComponent({ name: 'MatchCard' });

const props = defineProps({
  id: {
    type: Number,
  },
});

function onClick(): void {
  console.log('click', props.id);
}

const emit = defineEmits(['matchCardClick']);

function matchCardClick() { emit('matchCardClick', props.id); }

</script>
