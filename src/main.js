import { SVG } from "@svgdotjs/svg.js"
import {
  eyeList,
  noseList
} from "./parts"
import {
  grid,
  chooseRandomColor,
  randomInt,
  randomIntHalf,
  getSvgFromPath
} from "./utilities"

const gridDivisions = 11
const gridPadding = 3
export const gridSize = 50
const backgroundColor = chooseRandomColor()
const foregroundColor = chooseRandomColor()

const draw = SVG()
  .addTo('body')
  .size((gridDivisions + gridPadding * 2) * gridSize, (gridDivisions + gridPadding * 2) * gridSize)

const background = draw.rect(draw.width(), draw.height()).attr({ fill: backgroundColor })
const face = draw.nested()
  .size(gridSize * gridDivisions, gridSize * gridDivisions)
  .move(grid(gridPadding), grid(gridPadding))
  .fill(foregroundColor)


// Grid
for (let i = 1; i < gridDivisions; i++) {
  face
    .line(i * gridSize, 0, i * gridSize, face.height())
    .stroke("#fff")
  face
    .line(0, i * gridSize, face.width(), i * gridSize)
    .stroke("#fff")
}
let sq = face
  .rect(gridDivisions * gridSize, gridDivisions * gridSize)
  .fill({ color: null, opacity: 0 })
  .stroke("#fff")


// Debug
const nose = face.symbol()
const noseData = noseList[randomInt(noseList.length - 1)];
getSvgFromPath(noseData.path).then(value => nose.svg(value))
nose
  .size(grid(noseData.width), grid(noseData.height))

face
  .rect(grid(noseData.boundW), grid(noseData.boundH))
  .move(grid(noseData.boundX), grid(noseData.boundY))
  .fill({ color: foregroundColor, opacity: 0.2 })
  .stroke(foregroundColor)

face
  .use(nose)
  .addClass("nose")
  .move(
    grid(noseData.boundX + randomIntHalf(noseData.boundW - noseData.width)),
    grid(noseData.boundY + randomIntHalf(noseData.boundH - noseData.height))
  );


// // Nose
// const nose = face.symbol()
// const noseData = noseList[randomInt(noseList.length)];
// getSvgFromPath(noseData.path).then(value => nose.svg(value))
// nose.size(grid(noseData.width), grid(noseData.height))
// face.use(nose).move(
//   grid(noseData.minX + randomInt(noseData.maxX - noseData.width)),
//   grid(noseData.minY + randomInt(noseData.maxY - noseData.height))
// )

// const eye1 = face.symbol();
// const eye1Data = eyeList[randomInt(eyeList.length)];
// getSvgFromPath(eye1Data.path).then(value => eye1.svg(value))
// eye1.size(grid(eye1Data.width), grid(eye1Data.height))
// face.use(eye1).move(
//   grid(randomInt(eye1Data.maxX - eye1Data.width + 1)),
//   grid(randomInt(eye1Data.maxY - eye1Data.height + 1))
// )

// const eye2 = face.symbol();
// const eye2Data = eyeList[randomInt(eyeList.length)];
// getSvgFromPath(eye2Data.path).then(value => eye2.svg(value))
// eye2.size(grid(eye2Data.width), grid(eye2Data.height))
// face.use(eye2).move(
//   grid(6 + randomInt(eye2Data.maxX - eye2Data.width + 1)),
//   grid(randomInt(eye2Data.maxY - eye2Data.height + 1))
// )

// Nose
// const nose = face.symbol()
// const noseData = partsList.nose[randomInt(partsList.nose.length)];
// getSvgFromPath(noseData.path).then(value => nose.svg(value))
// nose.size(grid(noseData.width), grid(noseData.height))
// face.use(nose).move(
//   grid(randomInt(noseData.maxX - noseData.width+1)),
//   grid(randomInt(noseData.maxY - noseData.height+1))
// )
