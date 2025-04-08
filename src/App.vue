<template>
  <section class="player-section">
    <div class="grid">
      <div class="cell">
        <SectionTitle title="Preview" />
        <video-player :options="previewVideoOptions" />
      </div>
      <div class="cell">
        <SectionTitle title="Program" />
        <video-player :options="queueVideoOptions" />
      </div>
    </div>
  </section>
  <section class="play-queue">
    <div class="grid">
      <div class="cell library-section play-queue__timeline pt-5">
        <SectionTitle title="Library" />
        <Library></Library>
        <ImportBay></ImportBay>
      </div>
      <div class="cell play-queue__timeline pt-5">
        <SectionTitle title="Queue" />
        <QueueTimeline></QueueTimeline>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.player-section {
  height: 44%;

  .grid {
    height: 100%;

    .cell {
      height: 100%;
      position: relative;
    }
  }
}
.play-queue {
  height: 56%;

  .grid {
    height: 100%;

    .cell {
      height: 100%;
    }
  }

  .library-section {
    height: 100%;
    overflow-y: scroll;
  }

  &__preview {
    height: 100%;
    overflow-y: scroll;
    position: relative;
  }
  &__timeline {
    height: 100%;
    overflow-y: scroll;
    position: relative;
  }
}
</style>
<script setup>
import VideoPlayer from "@/components/VideoPlayer.vue";
import QueueTimeline from "@/components/QueueTimeline.vue";
import Library from "@/components/Library.vue";
import SectionTitle from "@/components/SectionTitle.vue";
import ImportBay from "@/components/ImportBay.vue";

const previewVideoOptions = {
  autoplay: false,
  controls: true,
  width: 320,
  sources: [
    {
      src: "/src/components/video-placeholder.mp4",
      type: "video/mp4",
    },
  ],
};

const queueVideoOptions = {
  autoplay: true,
  controls: false,
  loop: true,
  width: 320,
  sources: [
    {
      src: "/src/components/video-placeholder.mp4",
      type: "video/mp4",
    },
  ],
};
</script>
