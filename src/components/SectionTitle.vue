<template>
  <h4 class="is-size-6 has-text-weight-light pl-5 pr-5">{{ title }}</h4>
</template>
<style lang="scss" scoped>
h4 {
  position: absolute;
  top: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1080;
  width: 100%;
}
</style>
<script setup>
const props = defineProps({ title: String });
</script>
