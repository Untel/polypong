<template>
  <q-field
    :model-value="modelValue"
    borderless class="wrapper full-width">
    <LogoBannerCoalition
      v-for="coalition in CoalitionChoice"
      class="coalition_choice"
      :key="coalition"
      :coalition="coalition"
      :show-banner="modelValue == coalition"
      @click="updateValue(coalition)"
    />
  </q-field>
</template>

<script setup lang="ts">
import LogoBannerCoalition from 'src/components/LogoBannerCoalition.vue';
import { CoalitionChoice } from 'src/types';
import { defineComponent, PropType } from 'vue';

defineComponent({
  components: {
    LogoBannerCoalition,
  },
});

const props = defineProps({
  modelValue: {
    type: String as PropType<CoalitionChoice>,
    required: false,
  },
});
const emit = defineEmits(['update:modelValue']);

const updateValue = (coalition: CoalitionChoice) => {
  emit('update:modelValue', coalition !== props.modelValue ? coalition : '');
};
</script>

<style lang="scss" scoped>
  .wrapper {
    margin-bottom: 20px;
    margin-top: 20px;
    // display: flex;

    .coalition_choice {
      cursor: pointer;
    }
  }
</style>
