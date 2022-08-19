<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 320px
  min-width: 320px
</style>

<template>
<q-card>
  <pre>{{ history }}</pre>
</q-card>
</template>

<script lang="ts" setup>
import {
  defineComponent, PropType,
} from 'vue';
import { UserMatchesHistory } from 'src/stores/history.store';
import { useSocialStore } from '../stores/social.store';

const soc = useSocialStore();

defineComponent({ name: 'StatsCard' });

const props = defineProps({
  history: Object as PropType<UserMatchesHistory>,
});

// const emit = defineEmits([
//  'addFriend', 'unfriend', 'block', 'unblock',
// ]);

// function inviteToLobby(id: number) { emit('inviteToLobby', id); }

</script>
