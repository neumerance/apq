<template>
  <section class="toolbar-section has-background-light">
    <app-tool-bar></app-tool-bar>
  </section>
  <section class="player-section">
    <div class="grid">
      <div class="cell">
        <audio-output-selector
          audioDeviceFor="previewAudioDevice"
        ></audio-output-selector>
        <video-player
          :options="previewVideoOptions"
          :audio-device-id="previewAudioDevice"
        />
      </div>
      <div class="cell">
        <audio-output-selector
          audio-device-for="queueAudioDevice"
        ></audio-output-selector>
        <video-player
          :options="queueVideoOptions"
          :audio-device-id="queueAudioDevice"
        />
      </div>
    </div>
  </section>
  <section class="play-queue">
    <div class="grid">
      <div class="cell library-section play-queue__timeline pt-5">
        <section-title title="Library"></section-title>
        <library></library>
        <import-bay></import-bay>
      </div>
      <div class="cell play-queue__timeline pt-5">
        <section-title title="Queue"></section-title>
        <queue-timeline :enqueued-scenes="enqueuedScenes"></queue-timeline>
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
import AudioOutputSelector from "@/components/AudioOutputSelector.vue";
import { onMounted, watch } from "vue";
import { useAudioDeviceStore } from "@/stores/audioDeviceStore";
import { storeToRefs } from "pinia";

const audioDeviceStore = useAudioDeviceStore();
const { previewAudioDevice, queueAudioDevice } = storeToRefs(audioDeviceStore);

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
  muted: false,
  sources: [
    {
      src: "/src/assets/video/placeholder.mp4",
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
      src: "/src/assets/video/video-audio-test.mp4",
      type: "video/mp4",
    },
  ],
};

onMounted(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  audioDeviceStore.storeDevices(devices);
});
</script>
