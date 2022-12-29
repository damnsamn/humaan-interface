import $ from "jquery";
import ColorContrastChecker from "color-contrast-checker";
import {colors, gridDivisions, gridSize} from "./face/config";
import {
    draw,
    eye1Part,
    eye2Part,
    face,
    faceBackgroundColor,
    faceForegroundColor,
    getFaceSVG,
    mouthPart,
    nosePart,
    randomiseFace,
    setFaceBackground,
    setFaceForeground,
    updateFlipButtonStates,
    updatePartButtonStates,
} from "./face/face";
import {eyeList, mouthList, noseList} from "./face/parts";
import {Flip, grid} from "./utilities";
import flipIcon from "/assets/images/flip.svg";
import "/scss/style.scss";
import {Part} from "./Part";

let contrastChecker = new ColorContrastChecker();

const history = [];

updateCSSColors();
updateFavicon();

const foregroundButtons = document.querySelector("#colors-fg");
const backgroundButtons = document.querySelector("#colors-bg");

colors.forEach((color) => {
    foregroundButtons.appendChild(createColorButton(color, true));
    backgroundButtons.appendChild(createColorButton(color, false));
});

const eye1Buttons = document.querySelector("#parts-eye-1");
const eye2Buttons = document.querySelector("#parts-eye-2");
const eye1ClearButton = createPartButton({name: "Eye00"});
const eye2ClearButton = createPartButton({name: "Eye00"});
eye1Buttons.appendChild(eye1ClearButton);
eye2Buttons.appendChild(eye2ClearButton);
eye1ClearButton.addEventListener("click", () => {
    face.findOne("#" + eye1Part.name)?.remove();
    eye1Part.clear();
    updatePartButtonStates();
});
eye2ClearButton.addEventListener("click", () => {
    face.findOne("#" + eye2Part.name)?.remove();
    eye2Part.clear();
    updatePartButtonStates();
});
eyeList.forEach((eye, i) => {
    const eye1Button = createPartButton(eye);
    const eye2Button = createPartButton(eye);

    eye1Buttons.appendChild(eye1Button);
    eye2Buttons.appendChild(eye2Button);

    eye1Button.addEventListener("click", () => {
        face.findOne("#" + eye1Part.name)?.remove();
        eye1Part.set(i, eye1Part.flipX, eye1Part.flipY, {
            x: eye1Part.SVG?.x() / gridSize ?? 0,
            y: eye1Part.SVG?.y() / gridSize ?? 0,
            width: eye1Part.SVG?.width() / gridSize ?? gridDivisions / 2,
            height: eye1Part.SVG?.height() / gridSize ?? gridDivisions / 2,
        });
        updatePartButtonStates();
    });
    eye2Button.addEventListener("click", () => {
        face.findOne("#" + eye2Part.name)?.remove();
        eye2Part.set(i, eye2Part.flipX, eye2Part.flipY, {
            x: eye2Part.SVG?.x() / gridSize ?? 0,
            y: eye2Part.SVG?.y() / gridSize ?? 0,
            width: eye2Part.SVG?.width() / gridSize ?? gridDivisions / 2,
            height: eye2Part.SVG?.height() / gridSize ?? gridDivisions / 2,
        });
        updatePartButtonStates();
    });
});

const noseButtons = document.querySelector("#parts-nose");
const noseClearButton = createPartButton({name: "Nose00"});
noseButtons.appendChild(noseClearButton);
noseClearButton.addEventListener("click", () => {
    face.findOne("#" + nosePart.name)?.remove();
    nosePart.clear();
    updatePartButtonStates();
});
noseList.forEach((nose, i) => {
    const noseButton = createPartButton(nose);

    noseButtons.appendChild(noseButton);

    noseButton.addEventListener("click", () => {
        face.findOne("#" + nosePart.name)?.remove();
        nosePart.set(i);
        updatePartButtonStates();
    });
});

const mouthButtons = document.querySelector("#parts-mouth");
const mouthClearButton = createPartButton({name: "Mouth00"});
mouthButtons.appendChild(mouthClearButton);
mouthClearButton.addEventListener("click", () => {
    face.findOne("#" + mouthPart.name)?.remove();
    mouthPart.clear();
    updatePartButtonStates();
});
mouthList.forEach((mouth, i) => {
    const mouthButton = createPartButton(mouth);

    mouthButtons.appendChild(mouthButton);
    mouthButton.addEventListener("click", () => {
        face.findOne("#" + mouthPart.name)?.remove();
        mouthPart.set(i);
        updatePartButtonStates();
    });
});

const flipButtons = document.querySelectorAll("[data-flip]");
flipButtons.forEach((button) => {
    button.innerHTML = flipIcon;
    button.addEventListener("click", () => {
        const axis = button.dataset.flip;
        button.classList.toggle("active");
        const propertyGroup = button.parentElement.nextElementSibling;
        propertyGroup.classList.toggle("flip-" + axis);

        const name = propertyGroup.id.split("parts-")[1];
        const part = Part.getByName(name);
        part.setFlipX(!part.flipX);
        face.findOne("#" + name)
            .children()
            .flip(axis);
    });
});

const allColorButtons = document.querySelectorAll(".property-group__button--color");
allColorButtons.forEach((button) =>
    button.addEventListener("click", (e) => {
        const fg = button.dataset.foreground;
        const bg = button.dataset.background;

        if (fg && fg !== faceForegroundColor) {
            if (fg === faceBackgroundColor) {
                setFaceBackground(faceForegroundColor);
                setFaceForeground(fg);
                updateForegroundButtons(fg);
                updateBackgroundButtons(faceBackgroundColor);
            } else {
                setFaceForeground(fg);
                updateForegroundButtons(fg);
            }
        }

        if (bg && bg !== faceBackgroundColor) {
            if (bg === faceForegroundColor) {
                setFaceForeground(faceBackgroundColor);
                setFaceBackground(bg);
                updateBackgroundButtons(bg);
                updateForegroundButtons(faceForegroundColor);
            } else {
                setFaceBackground(bg);
                updateBackgroundButtons(bg);
            }
        }

        updateCSSColors();
        updateFavicon();
    }),
);

const randomiseButton = document.querySelector("#randomise");
randomiseButton.addEventListener("click", () => {
    addToHistory();
    face.children().remove();
    randomiseFace();
    faceJiggle();
});

const faceHistory = document.querySelector(".face-history");
faceHistory.addEventListener("click", (e) => {
    const historyButton = e.target.closest(".face-history__item > svg");

    if (historyButton) {
        setFromHistory(historyButton.id);

        updateCSSColors();
        updateForegroundButtons(faceForegroundColor.toUpperCase());
        updateBackgroundButtons(faceBackgroundColor.toUpperCase());
        faceJump();
    }
});

const exportButton = document.querySelector("#export");
exportButton.addEventListener("click", () => {
    exportSVG(getFaceSVG());
});

document.addEventListener("svgUpdated", function () {
    updateFavicon();
});

randomiseFace();

function updateForegroundButtons(color) {
    const foregroundButtons = document.querySelectorAll(".property-group__button--color[data-foreground]");
    const backgroundButtons = document.querySelectorAll(".property-group__button--color[data-background]");

    foregroundButtons.forEach((button) => {
        button.classList.toggle("active", color === button.dataset.foreground);
    });
    backgroundButtons.forEach((button) => {
        button.classList.toggle("disabled", color === button.dataset.background);
    });
}

function updateBackgroundButtons(color) {
    const foregroundButtons = document.querySelectorAll(".property-group__button--color[data-foreground]");
    const backgroundButtons = document.querySelectorAll(".property-group__button--color[data-background]");

    foregroundButtons.forEach((button) => {
        button.classList.toggle("disabled", color === button.dataset.foreground);
    });
    backgroundButtons.forEach((button) => {
        button.classList.toggle("active", color === button.dataset.background);
    });
}

function updateCSSColors() {
    document.body.style.setProperty("--background", faceForegroundColor);
    document.body.style.setProperty("--face-foreground", faceForegroundColor);
    document.body.style.setProperty("--face-background", faceBackgroundColor);

    if (contrastChecker.isLevelCustom(faceForegroundColor, faceBackgroundColor, 2)) {
        document.body.style.setProperty("--foreground", faceBackgroundColor);
        return;
    }

    if (contrastChecker.isLevelCustom(faceBackgroundColor, "#000000", 2)) {
        document.body.style.setProperty("--foreground", "rgba(0,0,0,0.8)");
        return;
    }

    if (contrastChecker.isLevelCustom(faceBackgroundColor, "#FFFFFF", 2)) {
        document.body.style.setProperty("--foreground", "#FFFFFF");
        return;
    }

    document.body.classList.add("colours-applied");
}

function faceJiggle() {
    const face = document.querySelector(".face");
    face.classList.remove("jiggle", "jump");
    setTimeout(function () {
        face.classList.add("jiggle");
    }, 0);
}

function faceJump() {
    const face = document.querySelector(".face");
    face.classList.remove("jiggle", "jump");
    setTimeout(function () {
        face.classList.add("jump");
    }, 0);
}

function updateFavicon() {
    const prepend = "data:image/svg+xml;utf8,";
    const svg = getFaceSVG("15%").replace(/"/g, "'").replace(/#/g, "%23");

    let toDelete = document.querySelector("link#favicon");
    if (toDelete) toDelete.remove();

    const linkEl = document.createElement("link");
    linkEl.setAttribute("rel", "icon");
    linkEl.setAttribute("href", `${prepend}${svg}`);
    linkEl.id = "favicon";
    document.head.appendChild(linkEl);
}

function setFromHistory(id) {
    addToHistory();

    const historyItem = history.find((item) => item.oldFace.node.id === id);

    eye1Part.setProperties(historyItem.oldEye1Part);
    eye2Part.setProperties(historyItem.oldEye2Part);
    nosePart.setProperties(historyItem.oldNosePart);
    mouthPart.setProperties(historyItem.oldMouthPart);

    face.clear();
    eye1Part.SVG?.addTo(face);
    eye2Part.SVG?.addTo(face);
    nosePart.SVG?.addTo(face);
    mouthPart.SVG?.addTo(face);

    updatePartButtonStates();
    updateFlipButtonStates();

    const fg = historyItem.oldFace.findOne("svg").fill().toUpperCase();
    const bg = historyItem.oldFace.findOne("rect").fill().toUpperCase();

    setFaceBackground(bg);
    setFaceForeground(fg);
    updateForegroundButtons(fg);
    updateBackgroundButtons(bg);

    updateCSSColors();
    updateFavicon();
}

function addToHistory() {
    const state = Flip.getState("#face-history");

    const oldFace = draw
        .clone()
        .addTo("#face-history")
        .back()
        .id("history-" + history.length);
    const oldEye1Part = {...eye1Part};
    const oldEye2Part = {...eye2Part};
    const oldNosePart = {...nosePart};
    const oldMouthPart = {...mouthPart};

    $("#history-" + history.length).wrap("<div class='face-history__item' tabindex='0'></div>");
    history.unshift({
        oldFace,
        oldEye1Part,
        oldEye2Part,
        oldNosePart,
        oldMouthPart,
    });
    if (history.length > 5) {
        history[5].oldFace.parent().remove();
    }
    Flip.from(state);
}

function exportSVG(svg) {
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svg], {type: "image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function createColorButton(color, isForeground) {
    const plane = isForeground ? "foreground" : "background";

    // If colour is dark, set its disabled colour to be light
    let disabledLight = contrastChecker.isLevelCustom(color, "#ffffff", 4.5);

    const $button = document.createElement("button");
    $button.classList.add("property-group__button", "property-group__button--color");
    $button.classList.toggle("active", color === (isForeground ? faceForegroundColor : faceBackgroundColor));
    $button.classList.toggle("disabled", color === (isForeground ? faceBackgroundColor : faceForegroundColor));
    $button.classList.toggle("disabled-light", disabledLight);
    $button.dataset[plane] = color;
    $button.style.backgroundColor = color;

    return $button;
}

function createPartButton(partData) {
    const $button = document.createElement("button");

    $button.classList.add("property-group__button", "property-group__button--part");
    $button.dataset.part = partData.name;

    if (partData?.path) {
        $button.innerHTML = partData.path;
    }

    return $button;
}
