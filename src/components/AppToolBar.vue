<template>
  <div class="app-tool-bar ml-5 mr-5 grid">
    <div
      class="app-tool-bar__branding cell is-flex is-align-items-center is-justify-content-start"
    >
      <img class="app-tool-bar__icon mr-5" :src="AppIcon" />
      <span class="has-text-weight-bold has-text-dark mr-5">APQ</span>

      <div class="app-tool-bar__tools">
        <dropdown-menu
          label="File"
          subMenus="['Open', 'Save', 'Save As']"
        ></dropdown-menu>
        <dropdown-menu label="About"></dropdown-menu>
      </div>
    </div>
    <div
      class="app-tool-bar__display cell is-flex is-align-items-center is-justify-content-center"
    >
      <span class="mr-1"><full-screen></full-screen></span>
      <span class="ml-1"><virtual-webcam></virtual-webcam></span>
    </div>
    <div
      class="app-tool-bar__settings cell is-flex is-align-items-center is-justify-content-end"
    >
      <dropdown-menu
        label="Settings"
        :subMenus="['General Settings', 'Video Output', 'Audio Output']"
      ></dropdown-menu>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.app-tool-bar {
  &__icon {
    border-radius: 4px;
    margin: 3px;
  }
}
</style>
<script setup>
import DropdownMenu from "@/components/ToolBars/DropdownMenu.vue";
import FullScreen from "@/components/ToolBars/FullScreen.vue";
import VirtualWebcam from "./ToolBars/VirtualWebcam.vue";
import AppIcon from "@/assets/icons/apq_icon_27x27.png";
</script>
