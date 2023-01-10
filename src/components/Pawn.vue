<script setup>
defineProps({
  id: {
    type: String,
    required: true,
  },
  color: {
    validator: (color) => ['white', 'black'].includes(color),
    required: true,
  }
})
</script>

<template>
  <div
    :data-color="color"
    :data-id="id"
    class="pawn"
  ></div>
</template>

<style scoped>
.pawn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 1px solid #8d8a8a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pawn[data-color="white"] {
  background-color: white;
}

.pawn[data-color="black"] {
  background-color: black;
  color: white;
}
</style>