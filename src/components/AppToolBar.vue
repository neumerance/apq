<template>
  <div class="app-tool-bar ml-5 mr-5 grid">
    <div
      class="app-tool-bar__branding cell is-flex is-align-items-center is-justify-content-start"
    >
      <img class="app-tool-bar__icon mr-5" :src="AppIcon" />
      <span class="has-text-weight-bold has-text-dark mr-5">APQ</span>

      <div class="app-tool-bar__tools">
        <DropdownMenu label="File" :subMenus="['Open', 'Save', 'Save As']"></DropdownMenu>
        <DropdownMenu label="About"></DropdownMenu>
      </div>
    </div>
    <div
      class="app-tool-bar__display cell is-flex is-align-items-center is-justify-content-center"
    >
      <FullScreen></FullScreen>
    </div>
    <div
      class="app-tool-bar__settings cell is-flex is-align-items-center is-justify-content-end"
    >
      <DropdownMenu
        label="Settings"
        :subMenus="['General Settings', 'Video Output', 'Audio Output']"
      ></DropdownMenu>
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
import AppIcon from "@/assets/icons/apq_icon_27x27.png";
</script>
