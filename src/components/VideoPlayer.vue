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

<script>
import videojs from "video.js";

export default {
  name: "VideoPlayer",
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      player: null,
    };
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer, this.options, () => {
      this.player.log("onPlayerReady", this);
    });

    this.player.on("play", () => {
      console.log("player is playing");

      const canvas = this.$refs.videoCanvasRef;
      const video = this.$refs.videoPlayer;
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
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
};
</script>
