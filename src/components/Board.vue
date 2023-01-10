<script setup>
import Pawn from './Pawn.vue';

const props = defineProps({
  board: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="board">
    <div 
      v-for="(line, i) in props.board"
      :key="i"
      class="row"
    >
      <div 
        v-for="(pawn, j) in line"
        :key="j"
        :data-x="j"
        :data-y="i"
        :class="{
          'droppable-box': !pawn
        }"
        class="box"
      >
        <Pawn v-if="pawn" v-bind="pawn"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  background-color: rgb(210 243 243);
  border-bottom: 1px solid rgb(23 139 134);
  border-left: 1px solid rgb(23 139 134);
  box-shadow: 0 0 13px rgba(0, 0,0, 0.3)
}

.row {
  display: flex;
}

.box {
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgb(23 139 134);
  border-right: 1px solid rgb(23 139 134);
  width: 4rem;
  height: 4rem;
} 
</style>