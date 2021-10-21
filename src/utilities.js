import {
  gridSize,
  colors
} from "./config"
import $ from "jquery"

// Returns a random int between 0 and provided max
export const randomInt = (max) => Math.round(Math.random() * (max))

// Returns a random 0.5 between 0 and provided max
export const randomIntHalf = (max) => Math.round(Math.random() * (max) * 2) / 2

export const grid = (value) => value * gridSize

export const chooseRandomColor = () => colors.splice(randomInt(colors.length - 1), 1)[0]

export async function getSvgFromPath(path) {
  let svg
  await $.get(path, (contents) => {
    let $el = $('svg', contents)
    $el.removeAttr("fill").removeAttr("width").removeAttr("height").children().removeAttr("fill")
    svg = $el.prop("outerHTML")
  }, 'xml')
  return svg
}
