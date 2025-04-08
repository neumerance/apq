<template>
  <div ref="timelineContainerEl" class="timeline-container">
    <div class="timeline has-background-dark">
      <div
        ref="needleRef"
        class="needle"
        :style="{ top: needlePosition, height: `${pixelPerMinute}px` }"
      ></div>
      <div
        class="time-slot is-flex is-justify-content-space-between is-align-items-center has-text-grey-light"
        :class="{ 'has-background-black': index % 2 === 0 }"
        :style="{ height: `${slot.height}px` }"
        v-for="(slot, index) in timeSlots"
        :key="index"
      >
        <span class="has-text-weight-light ml-3">{{ slot.time }}</span>
        <span class="has-text-weight-semibold mr-3" v-if="slot.showDate">{{
          slot.date
        }}</span>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.timeline-container {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-left: 2px solid #161515;

  .timeline {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow-y: scroll;

    .needle {
      position: absolute;
      right: 0;
      width: 90%;
      height: 3px;
      border-bottom: 2px solid red;
      z-index: 10;
      display: flex;
      align-items: center;

      &::before {
        content: "";
        width: 8px;
        height: 8px;
        background: red;
        border-radius: 50%;
        position: absolute;
        left: 0;
        bottom: -9px;
        transform: translate(-50%, -50%);
      }
    }

    .time-slot {
      height: 60px; /* 5 minutes = 60px */
      padding-left: 10px;
      font-size: 14px;
      line-height: 60px;
      position: relative;
    }

    .event {
      position: absolute;
      left: 80px;
      width: 200px;
      background: #def;
      border-left: 4px solid #39f;
      padding: 5px;
      font-size: 13px;
    }
  }
}
</style>
<script setup>
import { ref, onMounted, nextTick } from "vue";

const timeSlots = ref([]);
const needlePosition = ref("");
const now = new Date();
const pixelPerMinute = ref(5);
const timeSlotInterval = 15;
const needleRef = ref(null);

const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

// start of timeline
const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Adjust so Monday = 0
const startOfWeek = new Date(now);
startOfWeek.setDate(now.getDate() + diff);
startOfWeek.setHours(0, 0, 0, 0);
const startOfTimeline = startOfWeek;

// end of timeline
const endOfWeek = new Date(now);
endOfWeek.setDate(now.getDate() + (6 - dayOfWeek)); // Go forward to Saturday
endOfWeek.setHours(23, 59, 59, 999); // End of day
const endOfTimeline = endOfWeek;

// Create the time slots
const createTimeSlots = () => {
  let currentTime = new Date(startOfTimeline);
  while (currentTime <= endOfTimeline) {
    const formattedDate = currentTime.toLocaleDateString("en-US", {
      month: "short", // "Jan"
      day: "2-digit", // "01"
      year: "numeric", // "1987"
    });
    const formattedTime = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    timeSlots.value.push({
      date: formattedDate,
      time: formattedTime,
      height: pixelPerMinute * timeSlotInterval,
      showDate: formattedTime === "12:00 AM",
    });
    currentTime.setMinutes(currentTime.getMinutes() + timeSlotInterval);
  }
};

// Set current needle position
const setNeedlePosition = () => {
  const minutes = Math.floor((now - startOfTimeline.getTime()) / 60000);
  needlePosition.value = `${minutes * pixelPerMinute.value}px`;

  const scrollToPosition = () => {
    needleRef.value.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  };
  setTimeout(scrollToPosition, 2000);
  setInterval(scrollToPosition, 60000);
};

const showDate = (time) => {
  return time === "12:00 AM";
};

onMounted(() => {
  createTimeSlots();
  setNeedlePosition();
});
</script>
