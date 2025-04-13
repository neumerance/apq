import { defineStore } from "pinia";
import { ref } from "vue";

export const useAudioDeviceStore = defineStore("audioDeviceStore", () => {
  const audioDevices = ref([]);
  const queueAudioDevice = ref(null);
  const previewAudioDevice = ref(null);

  const storeDevices = (devices) => {
    audioDevices.value = devices.filter(
      (device) => device.kind === "audioinput" && !device.label.includes("NDI")
    );
  };

  const assignedDevice = (device, deviceFor = "queueAudioDevice") => {
    if (!deviceFor || !deviceFor.length) return;

    if (deviceFor === "queueAudioDevice") queueAudioDevice.value = device;
    if (deviceFor === "previewAudioDevice") previewAudioDevice.value = device;
  };

  return {
    audioDevices,
    queueAudioDevice,
    previewAudioDevice,
    storeDevices,
    assignedDevice,
  };
});
