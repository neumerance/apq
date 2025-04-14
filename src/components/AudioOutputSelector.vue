<template>
  <div class="select is-small is-normal">
    <select v-model="audioDeviceModel" @change="onSelect">
      <option disabled :value="null">Select Audio Output</option>
      <option
        v-for="(audioDevice, audioDeviceIndex) in audioDevices"
        :key="`audio-${audioDevice.id}`"
        :value="audioDevice.deviceId"
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
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAudioDeviceStore } from "@/stores/audioDeviceStore";

// Define component props
const props = defineProps({
  audioDeviceFor: String,
});

// Access the Pinia store
const audioDeviceStore = useAudioDeviceStore();

// Use storeToRefs to extract reactive references
const { audioDevices } = storeToRefs(audioDeviceStore);

// Define the model for selected audio device
const audioDeviceModel = ref(null);

// Fetch audio devices or handle store updates as needed
onMounted(() => {
  if (!audioDevices.value || audioDevices.value.length === 0) {
    // Handle case if audioDevices are empty or still loading
    console.warn("No audio devices available.");
  }
});

// Watch for changes to audioDeviceModel
// watch(audioDeviceModel, (newValue, oldValue) => {
//   console.log("audioDeviceModel changed:", newValue, oldValue);
// });

// Define the callback function for the select change event
const onSelect = () => {
  if (audioDeviceModel.value) {
    audioDeviceStore.assignedDevice(
      audioDeviceModel.value,
      props.audioDeviceFor
    );
  }
};
</script>
