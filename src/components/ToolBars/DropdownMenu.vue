<template>
  <div
    class="dropdown"
    :class="{ 'is-active': isHovered }"
    @mouseenter="onHovered(true)"
    @mouseleave="onHovered(false)"
  >
    <div class="dropdown-trigger is-flex is-align-items-center">
      <a
        class="is-small has-text-dark pl-2 pr-2"
        aria-haspopup="true"
        aria-controls="file-dropdown-menu"
      >
        <span>{{ label }}</span>
        <span class="icon is-small">
          <i class="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </a>
    </div>
    <div v-if="subMenus" class="dropdown-menu" id="file-dropdown-menu" role="menu">
      <div class="dropdown-content">
        <a
          v-for="(subMenu, index) in subMenus"
          href="#"
          class="dropdown-item has-text-light"
        >
          {{ subMenu }}
        </a>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.dropdown {
  z-index: 1090;
}
</style>
<script setup>
import { ref } from "vue";

const props = defineProps({
  label: String,
  subMenus: Array,
});

const isHovered = ref(false);
const onHovered = (bool) => {
  isHovered.value = bool;
};
</script>
