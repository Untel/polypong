<style lang="scss">
  .q-field--outlined .q-field__control:before {
    border: none;
  }
</style>

<template>
  <q-select
    :label="($attrs.label as string) || 'Search User'"
    dense
    rounded
    outlined
    class="full-width"
    :model-value="null"
    use-input
    hide-selected
    input-debounce="300"
    :options="options"
    option-label="name"
    @filter="filterFn"
    ref="select"
    @update:model-value="$emit('select', $event)"
  >
    <template v-slot:prepend>
      <q-icon name="search" />
    </template>
    <template v-slot:option="{ opt, itemProps }">
      <SearchUserRow
        v-bind="itemProps"
        :name="opt.name"
        :avatar="opt.avatar"
        :online="$auth.connectedUserMap[opt.id]?.status || 'offline'"
        />
    </template>
    <template v-slot:no-option="scope">
      <q-item-label v-if="scope.inputValue" header>
        No result for term {{ scope.inputValue }}
      </q-item-label>
      <template v-if="auths.length">
        <q-item-label header>
          There is {{ auths.length }} connected users you can invite
        </q-item-label>
        <template
          v-for="opt in auths"
          :key="`suggest-${opt.id}`"
        >
          <SearchUserRow
            @click="() => { select?.hidePopup(); $emit('select', opt); }"
            :name="opt.name"
            :avatar="opt.avatar"
            :online="$auth.connectedUserMap[opt.id]?.status"
            />
        </template>
      </template>
    </template>
  </q-select>
</template>

<script lang="ts" setup>
import { QSelect } from 'quasar';
import { useAuthStore, UserCon } from 'src/stores/auth.store';
import { User } from 'src/types/user';
import { computed, PropType, ref } from 'vue';
import SearchUserRow from './SearchUserRow.vue';

type U = (User);
const $auth = useAuthStore();
const options = ref<U[]>();
const select = ref<QSelect>();

const props = defineProps({
  excludes: {
    type: Array as PropType<U[]>,
    default: () => [],
  },
});

function exclude(input: Array<U>) {
  const filtered = input.filter((el) => {
    const found = props.excludes.find((e) => e.id === el.id);
    return !found;
  });
  return filtered;
}

const auths = computed(() => exclude($auth.connectedUsers));

function filterFn(val: string, update: (callback: () => void) => void) {
  $auth.searchUsers(val)
    .then((searching) => {
      update(() => {
        options.value = exclude(searching);
      });
    });
}

</script>
