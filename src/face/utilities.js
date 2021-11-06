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

let changedColors = [...colors];
export const chooseRandomColor = () => changedColors.splice(randomInt(changedColors.length - 1), 1)[0]

export async function getSvgFromPath(path) {
  let svg
  await $.get(path, (contents) => {
    let $el = $('svg', contents)
    $el.removeAttr("fill").removeAttr("width").removeAttr("height").children().removeAttr("fill")
    svg = $el.prop("outerHTML")
  }, 'xml')
  return svg
}
export class Flip {
  static transition = 250;

  static getState(selector) {
    const array = [];
    const $children = $(selector).children();

    $children.css("position", "static");
    // $(this).css("position", "static");
    $children.each(function () {
      // $(this).css("position", "static");
      array.push({
        offset: (() => {
          const parentOffset = $(this).parent().offset();
          const thisOffset = $(this).offset();
          return { top: thisOffset.top - parentOffset.top, left: thisOffset.left - parentOffset.left }

        })(),
        $element: $(this),
      })
      // $(this).css("position", position);

    })

    return { selector, children: array };
  }

  static from(prevState) {
    const newState = this.getState(prevState.selector);

    const newItems = [];
    _.forEach(newState.children, (value) => {
      const $element = value.$element;
      const newItem = !_.find(prevState.children, { $element });
      if (newItem)
        newItems.push($element)
    });
    newItems.forEach(($item) => {
      $item
        .css("transform", "scale(0)")

      setTimeout(() => {
        $item
          .css({
            "transition": "transform " + Flip.transition / 1000 + "s ease",
            "transform": "scale(1)"
          })
      }, 0)
    })



    const commonItems = [];
    _.forEach(newState.children, (value) => {
      const $element = value.$element;
      const commonItem = _.find(prevState.children, { $element });
      if (commonItem)
        commonItems.push({ $element, prevOffset: commonItem.offset, newOffset: value.offset })
    });
    // merge these
    commonItems.forEach((item) => {
      console.log(item.$element)
      const currentLeft = item.$element.css("left");
      const currentTop = item.$element.css("top");
      item.$element.css({
        "position": "absolute",
        "left": currentLeft > 0 ? currentLeft : item.prevOffset.left,
        "top": currentTop > 0 ? currentTop : item.prevOffset.top,
      }).stop()
      item.$element.animate({
        left: item.newOffset.left,
        top: item.newOffset.top,
      },
        Flip.transition,
        function () {
          $(this).removeAttr("style")
        })
    })




    const oldItems = [];
    _.forEach(prevState.children, (value) => {
      const $element = value.$element;
      const oldItem = !_.find(newState.children, { $element });
      if (oldItem)
        // debugger;
        oldItems.push({ $element, offset: value.offset });
    });
    oldItems.forEach((item) => {
      $(prevState.selector).append(item.$element);

      item.$element
        .css({
          "transition": "transform " + Flip.transition / 1000 + "s ease",
          "position": "absolute",
          "top": item.offset.top,
          "left": item.offset.left,
          // "z-index":
        })
      setTimeout(() => {
        item.$element.css("transform", "scale(0)");
      }, 0)
      setTimeout(() => {
        item.$element.remove();
      }, Flip.transition)
    })
  }
}