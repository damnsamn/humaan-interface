import $ from "jquery";
import ColorContrastChecker from "color-contrast-checker";
import { faceForegroundColor, faceBackgroundColor, setFaceBackground, setFaceForeground, getFaceSVG, randomiseFaceParts } from "./face/face";
import "./scss/style.scss"
import { colors } from "./face/config";

let contrastChecker = new ColorContrastChecker()

$(() => {
  document.body.style.setProperty("--foreground", faceBackgroundColor)
  document.body.style.setProperty("--background", faceForegroundColor)
  $("body").addClass("colours-applied")
  setBodyClass()

  colors.forEach(color => {
    $("#colors-fg").append(`<button class="button-group__button ${color === faceForegroundColor ? "active" : ""}" data-background="${color}" style="background-color: ${color}" ${color === faceBackgroundColor ? "disabled" : ""}></button>`)
    $("#colors-bg").append(`<button class="button-group__button ${color === faceBackgroundColor ? "active" : ""}" data-foreground="${color}" style="background-color: ${color}" ${color === faceForegroundColor ? "disabled" : ""}></button>`)
  });

  $(".button-group__button").on("click", function () {
    const fg = $(this).data("foreground");
    const bg = $(this).data("background");

    $(this).siblings().removeClass("active");
    $(this).addClass("active");

    // if (fg === backgroundColor() || bg === foregroundColor())
    //   return

    if (fg) {
      $("[data-background").attr("disabled", false);
      $(`[data-background="${fg}"]`).attr("disabled", true)
      foregroundColor(fg);
      setFaceBackground(fg)
    }
    if (bg) {
      $("[data-foreground").attr("disabled", false);
      $(`[data-foreground="${bg}"]`).attr("disabled", true)
      backgroundColor(bg);
      setFaceForeground(bg)
    }
    updateFavicon()
  })

  $(".face").on("mousedown", function (e) {
    const $face = $(this);
    e.preventDefault();
    randomiseFaceParts();
    $face.removeClass("jiggle");
    setTimeout(function () { $face.addClass("jiggle") }, 0)
  })

  $("#export").on("click", function () {
    exportSVG(getFaceSVG())
  })
  $(document).on("svgUpdated", function () {
    updateFavicon();
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

function updateFavicon() {
  const prepend = "data:image/svg+xml;utf8,"
  const svg = getFaceSVG("15%")
    .replace(/\"/g, "\'")
    .replace(/\#/g, "%23");
  $("link#favicon").attr("href", `${prepend}${svg}`)
}

function exportSVG(svg) {
  var preface = '<?xml version="1.0" standalone="no"?>\r\n';
  var svgBlob = new Blob([preface, svg], { type: "image/svg+xml;charset=utf-8" });
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}