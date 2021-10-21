import { gridSize } from "./main"
import $ from "jquery"

// Returns a random int between 0 and provided max
export const randomInt = (max) => Math.round(Math.random() * (max))

// Returns a random 0.5 between 0 and provided max
export const randomIntHalf = (max) => Math.round(Math.random() * (max) * 2) / 2

export const grid = (value) => value * gridSize



const colors = [
  "#643A87", // purple
  "#FFCA38", // yellow
  "#FBD0D1", // pink
  "#99DAF4", // blue
  "#F15744", // orange
  "#DECFE6", // lilac
]
export const chooseRandomColor = () => {
  const i = randomInt(colors.length - 1)
  const color = colors[i]
  colors.splice(i, 1)
  return color
}

export async function getSvgFromPath(path) {
  let svg;
  await $.get(path, function (contents) {
    let $el = $('svg', contents)
    $el.removeAttr("fill").removeAttr("width").removeAttr("height").children().removeAttr("fill")
    svg = $el.prop("outerHTML")

  }, 'xml')
  // svg = svg.html()
  return svg
}
