<template>
  <button
    class="button is-small"
    :class="{ 'is-danger': obsVirtualCamEnabled }"
    @click="toggleOBSVirtualWebcam"
  >
    OBS Virtual Cam
  </button>
</template>
<style lang="scss" scoped></style>
<script setup>
import { ref } from "vue";
const obsVirtualCamEnabled = ref(false);

const toggleOBSVirtualWebcam = async () => {
  obsVirtualCamEnabled.value = !obsVirtualCamEnabled.value;
  window.electronAPI.toggleOBSVirtualWebcam(obsVirtualCamEnabled.value);
};
</script>
