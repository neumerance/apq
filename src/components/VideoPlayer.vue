<template>
  <div class="video-wrapper">
    <video ref="videoPlayer" class="video-js"></video>
  </div>
  <canvas ref="videoCanvasRef" style="display: none"></canvas>
</template>

<style lang="scss" scoped>
.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;

  .video-js {
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
  }
}
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { storeToRefs } from "pinia";
import videojs from "video.js";

// Define props
const props = defineProps({
  options: {
    type: Object,
    default: () => ({}),
  },
  audioDeviceId: String,
});

// Refs to access the DOM elements
const videoPlayer = ref(null);
const videoCanvasRef = ref(null);
let player = null;

const routeAudioToAudioDevice = async (deviceId) => {
  if (typeof videoPlayer.value.setSinkId !== "function") {
    console.warn("setSinkId is not supported in your Electron version");
    return;
  }

  try {
    await videoPlayer.value.setSinkId(deviceId);
    console.log(`Audio output device set to ${deviceId}`);
  } catch (error) {
    console.error(
      `Error setting audio output device for deviceId ${deviceId}:`,
      error
    );
  }
};

watch(
  () => props.audioDeviceId,
  (audioDeviceId) => {
    console.log("audioDeviceId changed:", audioDeviceId);
    routeAudioToAudioDevice(audioDeviceId);
  }
);

// Mounted hook equivalent using onMounted
onMounted(() => {
  player = videojs(videoPlayer.value, props.options, () => {
    player.log("onPlayerReady", this);
  });

  player.on("play", () => {
    console.log("player is playing");

    const canvas = videoCanvasRef.value;
    const video = videoPlayer.value;
    const ctx = canvas.getContext("2d");

    canvas.width = 1920;
    canvas.height = 1080;

    const sendFrame = () => {
      if (video.paused || video.ended) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = canvas.toDataURL("image/jpeg");

      // Send to main process
      window.electronAPI.sendFrame(frame);
      requestAnimationFrame(sendFrame);
    };

    sendFrame();
  });
});

// BeforeDestroy equivalent using onBeforeUnmount
onBeforeUnmount(() => {
  if (player) {
    player.dispose();
  }
});
</script>
