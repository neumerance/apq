<template>
  <section class="player-section">
    <div class="grid">
      <div class="cell">
        <video-player :options="previewVideoOptions" />
      </div>
      <div class="cell">
        <video-player :options="queueVideoOptions" />
      </div>
    </div>
  </section>
  <section class="play-queue">
    <div class="grid">
      <div class="cell play-queue__timeline">
      </div>
      <div class="cell play-queue__timeline">
        <QueueTimeline />
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

  &__preview {
    height: 100%;
    overflow-y: scroll;
  }
  &__timeline {
    height: 100%;
    overflow-y: scroll;
  }
}
</style>
<script setup>
import VideoPlayer from '@/components/VideoPlayer.vue';
import QueueTimeline from '@/components/QueueTimeline.vue';

const previewVideoOptions = {
  autoplay: false,
  controls: true,
  width: 320,
  sources: [
    {
      src:
        '/src/components/video-placeholder.mp4',
      type: 'video/mp4'
    }
  ]
}

const queueVideoOptions = {
  autoplay: true,
  controls: false,
  loop: true,
  width: 320,
  sources: [
    {
      src:
        '/src/components/video-placeholder.mp4',
      type: 'video/mp4'
    }
  ]
}
</script>
