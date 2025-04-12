<template>
  <button
    class="button is-small"
    :class="{ 'is-danger': toggle }"
    @click="toggleVirtualWebcam"
  >
    Virtual Camera
  </button>
</template>
<style lang="scss" scoped></style>
<script setup>
import { ref } from "vue";
const toggle = ref(false);

const toggleVirtualWebcam = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const isVirtualCamInitialized = devices.some(
    (device) => device.label === "Unity Video Capture"
  );

  window.electronAPI.toggleVirtualWebcam(!toggle.value, isVirtualCamInitialized);
  window.electronAPI.onToggleVirtualWebcam((bool) => {
    toggle.value = bool;
  });
};
</script>
