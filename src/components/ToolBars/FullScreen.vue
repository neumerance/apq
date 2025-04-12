<template>
  <div
    class="dropdown"
    :class="{ 'is-active': isHovered }"
    @mouseenter="onHovered(true)"
    @mouseleave="onHovered(false)"
  >
    <div class="dropdown-trigger is-flex is-align-items-center">
      <a
        class="button is-small"
        :class="{ 'is-success': isFullScreen }"
        aria-haspopup="true"
        aria-controls="file-dropdown-menu"
        @click="closeFullScreen"
      >
        <span>Fullscreen</span>
        <span class="icon is-small">
          <i class="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </a>
    </div>
    <div v-if="displays" class="dropdown-menu" id="file-dropdown-menu" role="menu">
      <div class="dropdown-content">
        <a
          v-for="(display, index) in displays"
          :key="`display-${index}`"
          href="#"
          class="dropdown-item has-text-light"
          @click="openDisplayWindow(display.id)"
        >
          {{ display.label }}
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
import { onMounted, ref } from "vue";

const displays = ref([]);
const isHovered = ref(false);
const isFullScreen = ref(false);

const onHovered = (bool) => {
  isHovered.value = bool;
};

const openDisplayWindow = (displayId) => {
  window.electronAPI.openFullscreenDisplay(displayId);
  isFullScreen.value = true;
};

const closeFullScreen = () => {
  window.electronAPI.closeWindow();
  isFullScreen.value = false;
};

onMounted(async () => {
  const availableDisplays = await window.electronAPI.getDisplays();

  displays.value = availableDisplays.map((display) => {
    return {
      label: `${display.id} ${display.label}`,
      id: display.id,
    };
  });
});
</script>
