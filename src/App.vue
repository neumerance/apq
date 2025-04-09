<template>
  <section class="toolbar-section has-background-light">
    <AppToolBar></AppToolBar>
  </section>
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
        <QueueTimeline :enqueuedScenes="enqueuedScenes"></QueueTimeline>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.toolbar-section {
  height: 33px;
  z-index: 1090;
}
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
  height: 50%;

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
import AppToolBar from "@/components/AppToolBar.vue";

const now = new Date();
const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);
const enqueuedScenes = [
  {
    title: "Worship Service Playback Batch 2",
    startTime: new Date(now.getTime() - 0.3 * 60 * 60 * 1000),
    endTime: fourHoursLater,
  },
];

const previewVideoOptions = {
  autoplay: false,
  controls: true,
  width: 320,
  muted: true,
  sources: [
    {
      src: "/src/assets/video/no-signal.mp4",
      type: "video/mp4",
    },
  ],
};

const queueVideoOptions = {
  autoplay: true,
  controls: false,
  loop: true,
  width: 320,
  muted: false,
  sources: [
    {
      src: "/src/assets/video/placeholder.mp4",
      type: "video/mp4",
    },
  ],
};
</script>
