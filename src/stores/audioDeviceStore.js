import { defineStore } from "pinia";
import { ref } from "vue";

export const useAudioDeviceStore = defineStore("audioDeviceStore", () => {
  const audioDevices = ref([]);
  const queueAudioDevice = ref(null);
  const previewAudioDevice = ref(null);

  const storeDevices = (devices) => {
    audioDevices.value = devices.filter(
      (device) => device.kind === "audiooutput" && !device.label.includes("NDI")
    );
  };

  const assignedDevice = (deviceId, deviceFor = "queueAudioDevice") => {
    if (!deviceFor || !deviceFor.length) return;
    const device = audioDevices.value.find(
      (device) => device.deviceId === deviceId
    );

    if (!device) return;

    if (deviceFor === "queueAudioDevice") queueAudioDevice.value = deviceId;
    if (deviceFor === "previewAudioDevice") previewAudioDevice.value = deviceId;
  };

  return {
    audioDevices,
    queueAudioDevice,
    previewAudioDevice,
    storeDevices,
    assignedDevice,
  };
});
