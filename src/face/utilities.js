import {
  gridSize,
  colors
} from "./config"
import $ from "jquery"

// Returns a random int between 0 and provided max
export const randomInt = (max) => Math.round(Math.random() * (max));

// Returns a random 0.5 between 0 and provided max
export const randomIntHalf = (max) => Math.round(Math.random() * (max) * 2) / 2;

export const grid = (value) => value * gridSize;

let changedColors = [...colors];
export const chooseRandomColor = () => changedColors.splice(randomInt(changedColors.length - 1), 1)[0]

export async function getSvgFromPath(path) {
  let svg;
  await $.get(path, (contents) => {
    let $el = $('svg', contents);
    $el.removeAttr("fill").removeAttr("width").removeAttr("height").children().removeAttr("fill")
    svg = $el.prop("outerHTML")
  }, 'xml');
  return svg;
}
export class Flip {
  static transition = 250;
  static count = 0;

  static getState(selector) {
    const stateArray = [];
    const $children = $(selector).children();
    let stylesToReset = [];

    stylesToReset = $children.map((index, el) => {
      return {
        position: $(el).css("position"),
        transform: $(el).css("transform"),
        margin: $(el).css("margin"),
      };
    });
    $children.not(".removing").css({
      "position": "static",
      "transform": "none",
      "margin": 0,
    });
    $children.each(function () {
      stateArray.push({
        offset: (() => {
          const parentOffset = $(this).parent().offset();
          const thisOffset = $(this).offset();
          return { top: thisOffset.top - parentOffset.top, left: thisOffset.left - parentOffset.left }

        })(),
        $element: $(this),
      })
    })
    $children.not(".removing").each((index, el) => {
      $(el).css(stylesToReset[index])
    })

    return { selector, children: stateArray };
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
    newItems.forEach(($item) => $item.removeAttr("style"))



    const commonItems = [];
    _.forEach(newState.children, (value) => {
      const $element = value.$element;
      const commonItem = _.find(prevState.children, { $element });
      if (commonItem)
        commonItems.push({ $element, prevOffset: commonItem.offset, newOffset: value.offset })
    });
    // merge these
    commonItems.forEach((item) => {
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
          $(this).not(".removing").removeAttr("style")
        })
    })




    const oldItems = [];
    _.forEach(prevState.children, (value) => {
      const $element = value.$element;
      const oldItem = !_.find(newState.children, { $element }) || $element.hasClass("removing");
      if (oldItem)
        oldItems.push({ $element, offset: value.offset });
    });
    oldItems.forEach((item) => {
      $(prevState.selector).append(item.$element);
      item.$element
        .addClass("removing")
        .css({
          "position": "absolute",
          "top": item.offset.top,
          "left": item.offset.left,
        });
      setTimeout(() => {
        item.$element.remove();
      }, Flip.transition)
    })
    this.count++;
  }
}