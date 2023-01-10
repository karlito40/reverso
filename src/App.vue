<script setup>
import gsap from "gsap";
import { onMounted } from 'vue';
import Draggable from "gsap/Draggable";

import Board from './components/Board.vue';
import Pawn from './components/Pawn.vue';
import { useReverso } from './game_logic/game';
import { WHITE } from "./constants";

function findHittedBox ($draggedPawn) {
  const $boxes = document.querySelectorAll('.droppable-box');
  for (const $box of $boxes) {
    if (Draggable.hitTest($draggedPawn, $box)) {
      return $box;
    }
  }
}

const { activePlayer, state, whiteStack, blackStack, findPawnInStack, dropPawn } = useReverso()

onMounted(() => {
  Draggable.create('.draggable-pawn', {
    type: 'x, y',
    onRelease ({ target }) {
      const hittedBox = findHittedBox(target);
      if (hittedBox) {
        const x = parseInt(hittedBox.dataset.x, 10);
        const y = parseInt(hittedBox.dataset.y, 10);
        const pawn = findPawnInStack(target.dataset.id);
        
        dropPawn(pawn, { x, y });
      } else {
        gsap.to(target, { x: 0, y: 0 });
      }
    }
  })
})

</script>

<template>
  <main>
    <header>
      Au tour des <b>{{ state.activePlayer === WHITE ? 'blancs' : 'noirs' }}</b>
    </header>
    
    <div class="game">
      <Board :board="state.board"/>
      <div class="stacks">
        <div 
          v-for="(stack, i) in [whiteStack, blackStack]"
          :key="i"
          class="stack"
          :class="{
            'is-disable': stack[0].color !== state.activePlayer,
          }"
        >
          <Pawn 
            v-for="pawn in stack"
            :key="pawn.id"
            v-bind="pawn"
            :style="{
              'margin-top': '-2rem'
            }"
            class="draggable-pawn"
          />
        </div>
      </div>
    </div>
  </main>
  <pre class="debug">{{  state.board  }}</pre>
</template>

<style scoped>
header {
  margin-bottom: 1rem;
}

b {
  border-bottom: 2px solid black;
  font-weight: bold;
} 

.game {
  display: flex;
}

.stacks {
  display: flex;
  margin-left: 2rem;
} 

.stack {
  margin-right: 1rem;
}

.stack.is-disable {
  opacity: 0.25;
  pointer-events: none !important;
}
</style>
