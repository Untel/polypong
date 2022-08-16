<template>
<q-card>

</q-card>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth.store';
import { defineComponent, PropType } from 'vue';

const auth = useAuthStore();

defineComponent({ name: 'MatchCard' });

const props = defineProps({
  match: {
    type: Object as PropType<any>,
  },
});

// const emit = defineEmits(['matchCardClick']);
//
// function onClick(): void {
//  emit('matchCardClick');
// }

</script>
