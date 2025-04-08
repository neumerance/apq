<template>
  <div class="library p-3">
    <article class="message m-0 mt-3" v-for="(item, index) in items" :key="index">
      <div
        class="message-header is-size-7 p-2 is-flex is-justify-content-space-between is-align-items-center"
        @click="toggle(index)"
      >
        <div class="library-group_title is-flex is-align-items-center">
          <span class="mr-2">{{ item.title }}</span>
          <span class="icon">
            <i
              class="fas"
              :class="{
                'fa-angle-down': !item.open,
                'fa-angle-up': item.open,
              }"
            >
            </i>
          </span>
        </div>
        <div class="action">
          <button class="button is-primary is-small mr-2">Enqueue</button>
          <button class="button is-info is-small mr-2">Update Queue</button>
          <button class="button is-danger is-small mr-2">Delete</button>
        </div>
      </div>

      <transition name="accordion">
        <div
          class="message-body is-size-7 p-0"
          :class="{
            'accordion-open': item.open,
            'accordion-close': !item.open,
          }"
        >
          <div class="p-3">
            {{ item.content }}
          </div>
        </div>
      </transition>
    </article>
  </div>
</template>

<style lang="scss" scoped>
.accordion-open,
.accordion-close {
  transition: max-height 0.6s ease;
  overflow: hidden;
}
.accordion-close {
  max-height: 0;
  opacity: 0;
}
.accordion-open {
  max-height: 400px;
}
</style>
<script setup>
import { ref, onMounted, nextTick } from "vue";

const items = ref([
  {
    title: "Accordion Item #1",
    content: "This is the content of the first accordion item.",
    open: false,
  },
  {
    title: "Accordion Item #2",
    content: "This is the content of the second accordion item.",
    open: false,
  },
]);
const toggle = (index) => {
  items.value[index].open = !items.value[index].open;
};
</script>
