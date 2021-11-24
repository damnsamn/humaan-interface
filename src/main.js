import $ from "jquery";
import jqueryColor from 'jquery-color';
import ColorContrastChecker from "color-contrast-checker";
import { faceForegroundColor, faceBackgroundColor, setFaceBackground, setFaceForeground, getFaceSVG, randomiseFaceParts, setFromHistory } from "./face/face";
import "./scss/style.scss"
import { colors } from "./face/config";

let contrastChecker = new ColorContrastChecker()
// jqueryColor();

$(() => {
  setCSSCustomProperties()
  $("body").addClass("colours-applied")

  colors.forEach(color => {
    // If colour is dark, set its disabled colour to be light
    let disabledLight = contrastChecker.isLevelCustom(color, "#ffffff", 4.5);

    $("#colors-fg").append(`<button class="button-group__button ${color === faceForegroundColor ? "active" : ""} ${disabledLight ? "disabled-light" : ""}" data-background="${color}" style="background-color: ${color}" ${color === faceBackgroundColor ? "disabled" : ""}></button>`)
    $("#colors-bg").append(`<button class="button-group__button ${color === faceBackgroundColor ? "active" : ""} ${disabledLight ? "disabled-light" : ""}" data-foreground="${color}" style="background-color: ${color}" ${color === faceForegroundColor ? "disabled" : ""}></button>`)
  });

  $(".button-group__button").on("click", function () {
    const fg = $(this).data("foreground");
    const bg = $(this).data("background");

    if (fg) {
      setFaceBackground(fg)
      foregroundColor(fg);
    }
    if (bg) {
      setFaceForeground(bg)
      backgroundColor(bg);
    }

    setCSSCustomProperties()
    updateFavicon()
  })

  $(".face").on("mousedown", function (e) {
    e.preventDefault();
    randomiseFaceParts();

    faceJiggle();
  })

  $(".face-history").on("click", ".face-history__item>svg", function () {
    setFromHistory(this.id);

    setCSSCustomProperties()
    foregroundColor(faceBackgroundColor.toUpperCase())
    backgroundColor(faceForegroundColor.toUpperCase())
    faceJump();
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
    $("[data-background").attr("disabled", false);
    $(`[data-background="${color}"]`).attr("disabled", true)
    $("[data-foreground]").removeClass("active")
    $(`[data-foreground="${color}"]`).addClass("active")
  }
  // get
  else
    return document.body.style.getPropertyValue("--foreground")
}

function backgroundColor(color = null) {
  // set
  if (color) {
    $("[data-foreground").attr("disabled", false);
    $(`[data-foreground="${color}"]`).attr("disabled", true)
    $("[data-background]").removeClass("active")
    $(`[data-background="${color}"]`).addClass("active")
  }
  // get
  else
    return document.body.style.getPropertyValue("--background")
}

function setCSSCustomProperties() {
  // console.log(Color)
  $("body").animate({
    background: "#ff0000"
  }, 1000)
  document.body.style.setProperty("--background", faceForegroundColor)

  if (contrastChecker.isLevelCustom(faceForegroundColor, faceBackgroundColor, 2)) {
    document.body.style.setProperty("--foreground", faceBackgroundColor)
    return
  }

  if (contrastChecker.isLevelCustom(faceBackgroundColor, "#000000", 2)) {
    document.body.style.setProperty("--foreground", "#000000")
    return
  }

  if (contrastChecker.isLevelCustom(faceBackgroundColor, "#FFFFFF", 2)) {
    document.body.style.setProperty("--foreground", "#FFFFFF")
    return
  }
}

function faceJiggle() {
  $(".face").removeClass("jiggle").removeClass("jump");
  setTimeout(function () { $(".face").addClass("jiggle") }, 0);
}
function faceJump() {
  $(".face").removeClass("jiggle").removeClass("jump");
  setTimeout(function () { $(".face").addClass("jump") }, 0);
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