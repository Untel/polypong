<template>
  <q-input
    :type="showPassword ? 'text' : 'password'"
    lazy-rules
    :rules="[
      (val: string) => !!val || 'Password cannot be empty',
      (val: string) => val.length > 6 || 'Password must be stronger',
    ]"
    v-bind="$attrs"
    >
    <template v-slot:append>
      <q-icon
        :name="showPassword ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        @click="showPassword = !showPassword"
      />
    </template>

  </q-input>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue';

const showPassword: Ref<boolean> = ref(false);
</script>
