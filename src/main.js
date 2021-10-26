import $ from "jquery";
import ColorContrastChecker from "color-contrast-checker";
import { faceForegroundColor, faceBackgroundColor, setFaceBackground, setFaceForeground } from "./face/face";
import "./scss/style.scss"
import { colors } from "./face/config";

let contrastChecker = new ColorContrastChecker()

$(() => {
  document.body.style.setProperty("--foreground", faceBackgroundColor)
  document.body.style.setProperty("--background", faceForegroundColor)
  setBodyClass()

  colors.forEach(color => {
    $(".buttons").append(`<button data-foreground="${color}" style="background-color: ${color}">Background</button>`)
    $(".buttons").append(`<button data-background="${color}" style="background-color: ${color}">Foreground</button>`)
  });

  $("button").on("click", function () {
    const fg = $(this).data("foreground");
    const bg = $(this).data("background");

    if (fg === backgroundColor() || bg === foregroundColor())
      return

    if (fg) {
      foregroundColor(fg);
      setFaceBackground(fg)
    }
    if (bg) {
      backgroundColor(bg);
      setFaceForeground(bg)
    }
  })

})

function foregroundColor(color = null) {
  // set
  if (color) {
    document.body.style.setProperty("--foreground", color)
    setBodyClass()
  }
  // get
  else
    return document.body.style.getPropertyValue("--foreground")
}

function backgroundColor(color = null) {
  // set
  if (color) {
    document.body.style.setProperty("--background", color)
    setBodyClass()
  }
  // get
  else
    return document.body.style.getPropertyValue("--background")
}

function setBodyClass() {

  if (contrastChecker.isLevelCustom(foregroundColor(), backgroundColor(), 2)) {
    $("body").removeClass("text-dark").removeClass("text-light")
    return
  }

  if (contrastChecker.isLevelCustom(backgroundColor(), "#000000", 2)) {
    $("body").addClass("text-dark").removeClass("text-light")
    return
  }

  if (contrastChecker.isLevelCustom(backgroundColor(), "#FFFFFF", 2)) {
    $("body").removeClass("text-dark").addClass("text-light")
    return
  }
}