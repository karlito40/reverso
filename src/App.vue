<script setup>
import gsap from "gsap";
import { nextTick, onMounted, watch } from 'vue';
import Draggable from "gsap/Draggable";

import Board from './components/Board.vue';
import Pawn from './components/Pawn.vue';
import { useReverso } from './game_logic/game';
import { BLACK, GAME_FINISHED, WHITE, TIE, GAME_PLAYING } from "./constants";

function findHittedBox ($draggedPawn) {
  const $boxes = document.querySelectorAll('.droppable-box');
  for (const $box of $boxes) {
    if (Draggable.hitTest($draggedPawn, $box)) {
      return $box;
    }
  }
}

const { game, whiteStack, blackStack, findPawnInStack, dropPawn, restart } = useReverso();

function addDragAndDrop () {
  return Draggable.create('.draggable-pawn', {
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
} 

onMounted(addDragAndDrop);

watch(() => game.state, async (state) => {
  if (state === GAME_PLAYING) {
    await nextTick();
    addDragAndDrop();
  }
})

</script>

<template>
  <main>
    <header>
      Au tour des <b>{{ game.activePlayer === WHITE ? 'blancs' : 'noirs' }}</b>
    </header>
    
    <div class="game">
      <div class="board-container">
        <Board :board="game.board"/>

        <div 
          v-if="game.state === GAME_FINISHED"
          class="game-status"
        >
          <p v-if="game.winner === TIE">Egalite</p>
          <p v-else>Les {{ game.winner === BLACK ? 'noirs' : 'blancs' }} remportent la partie</p>
          
          <button @click="restart">Rejouer</button>
        </div>
      </div>
      <div class="stacks">
        <div 
          v-for="(stack, i) in [whiteStack, blackStack]"
          :key="i"
          class="stack"
          :class="{
            'is-disable': stack[0]?.color !== game.activePlayer,
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
  <pre class="debug">{{  game.board  }}</pre>
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

.game-container {
  position: relative;
}

.game-status {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: rgba(0, 0, 0, 0.4);
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
