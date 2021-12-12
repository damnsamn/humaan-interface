import $ from "jquery";
import { SVG } from "@svgdotjs/svg.js"
import {
  debug,
  gridSize,
  gridDivisions,
  gridPadding,
} from "./config"
import {
  grid,
  chooseRandomColor,
  randomInt,
  randomIntHalf,
  getSvgFromPath,
  Flip
} from "./utilities"
import {
  eyeList,
  mouthList,
  noseList,
} from "./parts"

import _ from "lodash";

export const Moods = {
  RANDOM: 0,
  HAPPY: 1,
  SAD: 2,
};

export let
  faceBackgroundColor = chooseRandomColor(),
  faceForegroundColor = chooseRandomColor(),
  mood = Moods.RANDOM;

let
  mouthData,
  noseData,
  eyeSlots = [],
  history = []

const
  width = (gridDivisions + gridPadding * 2) * gridSize,
  height = width,
  renderedEvent = new Event("svgUpdated");



let draw =
  SVG()
    .addTo('#face')
    .size(width, height)
    .id("face-svg")
    .viewbox(0, 0, width, height)

let background =
  draw
    .rect(width, height)
    .attr({ fill: faceBackgroundColor })
    .id("background")

let face =
  draw
    .nested()
    .size(gridSize * gridDivisions, gridSize * gridDivisions)
    .move(grid(gridPadding), grid(gridPadding))
    .fill(faceForegroundColor)
    .id("foreground");


// Grid
// --------------------------------------------------------
if (debug) {
  for (let i = 1; i < gridDivisions; i++) {
    face
      .line(i * gridSize, 0, i * gridSize, face.height())
      .stroke("#fff")
    face
      .line(0, i * gridSize, face.width(), i * gridSize)
      .stroke("#fff")
  }
  face
    .rect(gridDivisions * gridSize, gridDivisions * gridSize)
    .fill({ color: null, opacity: 0 })
    .stroke("#fff")
}
// --------------------------------------------------------

render();

function render() {
  mouthData = renderPart(face, mouthList, true).then(async (mouth) => {

    eyeSlots = mouth.slots;

    if (!mouth.skipNose) {
      noseData = await renderPart(face, noseList).then((nose) => {
        eyeSlots = nose.slots;
      });
    }

    await drawEyes(face).then(() => {
      document.dispatchEvent(renderedEvent)
    });
  });
}

async function renderPart(face, partList, shouldFlipY) {
  let partListCopy = _.cloneDeep(partList);
  const i = randomInt(partListCopy.length - 1),
    partData = partListCopy[i]

  await getSvgFromPath(partData.path).then(value => {
    const
      flipX = randomInt(1),
      flipY =
        mood === Moods.RANDOM ? randomInt(1) :
          mood === Moods.HAPPY ? 0 :
            mood === Moods.HAPPY ? 1 :
              false;

    // Flip bounds
    if (flipX)
      partData.boundX = gridDivisions - partData.boundX - partData.boundW

    // Define part
    const part =
      face
        .nested()
        .svg(value)
        .move(grid(partData.boundX), grid(partData.boundY))
        .size(grid(partData.width), grid(partData.height))

    // Flip part
    flipX && part.children().children().flip("x")
    if (shouldFlipY && flipY) {
      // flipX && part.children().children().flip("x")
      part.children().children().rotate(180)
    }

    // Position part
    const
      x = randomIntHalf(partData.boundW - partData.width),
      y = randomIntHalf(partData.boundH - partData.height)
    part.dmove(
      grid(x),
      grid(y)
    )

    if (partData.slots) {
      // Normalise slots
      for (let i = 0; i < partData.slots.length; i++) {
        const slot = partData.slots[i]
        slot.x += partData.boundX + x
        slot.y += partData.boundY + y
      }

      // Flip slots
      if (flipX) {
        for (let i = 0; i < partData.slots.length; i++) {
          const
            slot = partData.slots[i],
            axis = partData.boundX + x + partData.width / 2

          slot.x = (axis) - (slot.x - (axis)) - slot.width
        }
      }
    }

    // DEBUG: Draw bounds
    if (debug) {
      face
        .rect(grid(partData.boundW), grid(partData.boundH))
        .move(grid(partData.boundX), grid(partData.boundY))
        .fill({ color: "#ff00ff", opacity: 0.2 })
        .stroke("#ff00ff")
      if (partData.slots) {
        for (let i = 0; i < partData.slots.length; i++) {
          const slot = partData.slots[i];
          face
            .rect(grid(slot.width), grid(slot.height))
            .move(grid(slot.x), grid(slot.y))
            .fill({ color: "#0000ff", opacity: 0.2 })
            .stroke("#0000ff")
        }
      }
    }
    face.flatten()

  })
  return partData
}

async function drawEyes(face) {
  for (let i = 0; i < eyeSlots.length; i++) {
    const slot = eyeSlots[i];
    let slotX = Math.max(0, slot.x);
    let slotY = Math.max(0, slot.y);
    let slotW = Math.abs(Math.max(0, slot.x) - Math.min(gridDivisions, slot.x + slot.width))
    let slotH = Math.abs(Math.max(0, slot.y) - Math.min(gridDivisions, slot.y + slot.height))

    debug &&
      face
        .line(grid(slotX), grid(slotY), grid(slotX + slotW), grid(slotY + slotH))
        .stroke("#000")

    const availableEyes = eyeList.filter((element) => element.width <= slotW && element.height <= slotH)
    const eyeData = availableEyes[randomInt(availableEyes.length - 1)];

    await getSvgFromPath(eyeData.path).then(value => {
      const flipX = randomInt(1)

      // Render part
      const eye =
        face.nested()
          .svg(value)
          .size(grid(eyeData.width), grid(eyeData.height))
          .move(grid(slotX), grid(slotY))


      // Flip part
      flipX && eye.children().children().flip("x")

      // Position part
      const
        x = randomIntHalf(slotW - eyeData.width),
        y = randomIntHalf(slotH - eyeData.height)
      eye.dmove(
        grid(x),
        grid(y)
      )
      face.flatten()
    })
  }
}

export function setFaceForeground(color) {
  faceForegroundColor = color;
  face.fill(faceForegroundColor)
}

export function setFaceBackground(color) {
  faceBackgroundColor = color;
  background.fill(faceBackgroundColor)
}

export function getFaceSVG(radius) {
  const faceSVG = draw.clone()
  faceSVG.attr("xmlns:svgjs", null)
  if (radius)
    faceSVG.find("#background").radius(radius)
  return faceSVG.svg()
}
export function randomiseFaceParts() {
  addToHistory();
  face.children().remove()
  render();
}

export function setFromHistory(id) {
  let historyFace = SVG(`#${id}`).clone();
  addToHistory();
  draw.clear();
  background = historyFace.findOne("rect").addTo(draw).id("background");
  faceBackgroundColor = background.fill();
  face = historyFace.findOne("svg").addTo(draw).id("foreground");
  faceForegroundColor = face.fill();
  document.dispatchEvent(renderedEvent)

}
function addToHistory() {
  const state = Flip.getState("#face-history");
  console.log(state)
  const oldFace = draw.clone()
    .addTo("#face-history")
    .back()
    .id("history-" + history.length);
  $("#history-" + history.length).wrap("<div class='face-history__item' tabindex='0'></div>")
  history.unshift(oldFace);
  if (history.length > 5) {
    history[5].parent().remove();
  }
  Flip.from(state);
}