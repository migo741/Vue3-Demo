<template>
  <Teleport to="body">
    <div v-if="visible" class="modal">
      <div class="modal-content">
        <slot name="title">
          <p>Modal Title</p>
        </slot>
        <p @click="handleClose">x</p>
        <slot name="content">
          <p>Modal Content</p>
        </slot>
      </div>
    </div>
  </Teleport>
</template>
<script setup>
import { ref, defineProps, defineEmits } from "vue";
const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits("update:visible");
const handleClose = () => {
  emit("update:visible", false);
};
</script>
<style scoped>
.modal {
  position: fixed;
  left: 45%;
  top: 5%;
  border: 1px solid #000;
}
</style>
