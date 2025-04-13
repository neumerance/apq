<template>
  <div class="select is-small is-normal">
    <select v-model="audioDevice">
      <option disabled :value="null">Select Audio Output</option>
      <option
        v-for="(audioDevice, audioDeviceIndex) in audioDevices"
        :key="`audio-${audioDevice.id}`"
        :value="audioDevice.id"
        @click="assignedDevice(audioDevice, audioDeviceFor)"
      >
        {{ audioDevice.label }}
      </option>
    </select>
  </div>
</template>
<style lang="scss" scoped>
.select {
  border-radius: 0;

  select {
    &:focus {
      outline: none !important;
      border: none !important;
      box-shadow: none !important; /* Some browsers add a shadow on focus */
    }

    border: none !important;
    outline: none !important;
    appearance: none !important; /* Hides the dropdown arrow in most browsers */
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
  }
}
</style>
<script setup>
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAudioDeviceStore } from "@/stores/audioDeviceStore";

const props = defineProps({
  audioDeviceFor: String,
});
const audioDeviceStore = useAudioDeviceStore();
const { audioDevices, assignedDevice } = storeToRefs(audioDeviceStore);
const audioDevice = ref(null);
</script>
