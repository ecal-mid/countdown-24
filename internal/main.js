import {
  SequenceRunner,
  loadSequenceMetadata,
} from "./sequenceRunner.js";

import { initMenu, initTransitionUI } from "./sequenceRunnerUI.js";


const sequenceResponse = await fetch("./sequence.json")
const sequence = await sequenceResponse.json()
const sequenceData = await loadSequenceMetadata(sequence)


sequenceData.forEach(s => {
  let nextNum = Number.parseInt(s.content) - 1
  if (nextNum < 0)
    nextNum = 3
  s.nextContent = nextNum.toString()
})

//console.log(sequenceData);
const runner = new SequenceRunner(sequenceData, "3");

initMenu(runner)
initTransitionUI(runner)

runner.restart()