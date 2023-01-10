import { createApp } from "vue";
import App from "./App.vue";

import gsap from "gsap";
import Draggable from "gsap/Draggable";

import "./assets/main.css";

gsap.registerPlugin(Draggable);

createApp(App).mount("#app");
