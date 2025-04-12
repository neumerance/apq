<template>
  <button
    class="button is-small"
    :class="{ 'is-danger': virtualCamEnabled }"
    @click="toggleVirtualWebcam"
  >
    OBS Virtual Cam
  </button>
</template>
<style lang="scss" scoped></style>
<script setup>
import { ref } from "vue";
const virtualCamEnabled = ref(false);

const toggleVirtualWebcam = async () => {
  virtualCamEnabled.value = !virtualCamEnabled.value;

  const devices = await navigator.mediaDevices.enumerateDevices();
  const unityDeviceExists = devices.find(
    (device) => device.label === "Unity Video Capture"
  );
  if (unityDeviceExists) return;

  window.electronAPI.toggleVirtualWebcam(virtualCamEnabled.value);
};
</script>
