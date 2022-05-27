<style lang="scss" scoped>
  .login-form {
    display: flex;
    flex-direction: column;
    place-items: center;
    width: min(400px);
  }
</style>

<template>
<q-form
  ref="form"
  center
  class="q-gutter-md login-form"
  @submit="onSubmitForm"
  autocorrect="off"
  autocapitalize="off"
  autocomplete="off"
  spellcheck="false"
  autofocus
>
  <q-input
    v-model="email"
    class="full-width"
    filled
    label="Email"
    hint="Username or email"
    lazy-rules
    :rules="[ val => val && val.length > 0 || 'Please type something']"
  />

  <q-input
    v-model="password"
    class="full-width"
    filled
    label="Password"
    :type="showPassword ? 'text' : 'password'"
    lazy-rules
    :rules="[ val => val && val.length > 0 || 'Please type something']"
  >
    <template v-slot:append>
      <q-icon
        :name="showPassword ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        @click="showPassword = !showPassword"
      />
    </template>
  </q-input>
  <q-input
    v-model="repeatPassword"
    class="full-width"
    filled
    label="Repeat password"
    :type="showPassword ? 'text' : 'password'"
    lazy-rules
    :rules="[ val => val && val.length > 0 || 'Please type something']"
  >
    <template v-slot:append>
      <q-icon
        :name="showPassword ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        @click="showPassword = !showPassword"
      />
    </template>
  </q-input>
  <CoalitionSelector v-model="coalition" />

  <q-btn type="submit" size="large" color="primary" class="full-width">SIGN UP</q-btn>
</q-form>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import LogoCoalition from 'src/components/LogoCoalition.vue';
import CoalitionSelector from 'src/components/CoalitionSelector.vue';

const email           = ref(null),
      password        = ref(null),
      repeatPassword  = ref(null),
      coalition       = ref(null)
;
const showPassword = ref(false);
const router = useRouter();
const onSubmitForm = (form: Event) => {

};
const emit = defineEmits(['changeBackground']);
watch(coalition, (coa) => {
  console.log('Watching it ?', coalition);
  emit('changeBackground', coa);
});
onBeforeUnmount(() => {
  console.log('Destroy it ?', coalition);
  emit('changeBackground', null);
})
</script>
