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
  getSvgFromPath
} from "./utilities"
import {
  eyeList,
  partList,
  mouthList,
  noseList,
} from "./parts"

const
  backgroundColor = chooseRandomColor(),
  foregroundColor = chooseRandomColor()

let
  mouthData,
  noseData,
  eyeData = []



const draw =
  SVG()
    .addTo('body')
    .size((gridDivisions + gridPadding * 2) * gridSize, (gridDivisions + gridPadding * 2) * gridSize)

const background = draw.rect(draw.width(), draw.height()).attr({ fill: backgroundColor })
const face =
  draw.nested()
    .size(gridSize * gridDivisions, gridSize * gridDivisions)
    .move(grid(gridPadding), grid(gridPadding))
    .fill(foregroundColor)


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


mouthData = renderPart(face, mouthList);

if (!mouthData.skipNose)
  noseData = renderPart(face, noseList);


function renderPart(face, partList) {
  const partData = partList[randomInt(partList.length - 1)]

  getSvgFromPath(partData.path).then(value => {
    const flipX = randomInt(1)

    // Flip bounds
    flipX && (partData.boundX = gridDivisions - partData.boundX - partData.boundW)

    // Define part
    const part =
      face
        .nested()
        .svg(value)
        .move(grid(partData.boundX), grid(partData.boundY))
        .size(grid(partData.width), grid(partData.height))

    // Flip part
    flipX && part.children().children().flip("x")

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

    // Draw bounds
    if (debug) {
      face
        .rect(grid(partData.boundW), grid(partData.boundH))
        .move(grid(partData.boundX), grid(partData.boundY))
        .fill({ color: foregroundColor, opacity: 0.2 })
        .stroke(foregroundColor)

      if (partData.slots) {
        for (let i = 0; i < partData.slots.length; i++) {
          const slot = partData.slots[i];
          face
            .rect(grid(slot.width), grid(slot.height))
            .move(grid(slot.x), grid(slot.y))
            .fill({ color: "#ff00ff", opacity: 0.2 })
            .stroke("#ff00ff")
        }
      }
    }

  })
  return partData
}