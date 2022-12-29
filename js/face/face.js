import {SVG} from "@svgdotjs/svg.js";
import {debug, gridSize, gridDivisions, gridPadding} from "./config";
import {grid, chooseRandomColor, randomInt, randomIntHalf, getSvgFromPath, Flip} from "../utilities";
import {eyeList, mouthList, noseList} from "./parts";
import {Part} from "../Part";

export const Moods = {
    RANDOM: 0,
    HAPPY: 1,
    SAD: 2,
};

export let faceBackgroundColor = chooseRandomColor(),
    faceForegroundColor = chooseRandomColor(),
    mood = Moods.RANDOM;

const width = (gridDivisions + gridPadding * 2) * gridSize,
    height = width;

export const draw = SVG().addTo("#face").size(width, height).id("face-svg").viewbox(0, 0, width, height);

let background = draw.rect(width, height).attr({fill: faceBackgroundColor}).id("background");

export let face = draw
    .nested()
    .size(gridSize * gridDivisions, gridSize * gridDivisions)
    .move(grid(gridPadding), grid(gridPadding))
    .fill(faceForegroundColor)
    .id("foreground");

let gridLines = draw
    .nested()
    .move(grid(gridPadding), grid(gridPadding))
    .stroke(faceForegroundColor)
    .opacity(0.8)
    .remove();

for (let i = 1; i < gridDivisions; i++) {
    gridLines.line(i * gridSize, 0, i * gridSize, gridSize * gridDivisions);
    gridLines.line(0, i * gridSize, gridSize * gridDivisions, i * gridSize);
    gridLines.rect(gridDivisions * gridSize, gridDivisions * gridSize).fill({color: null, opacity: 0});
}

let draggingPart;

export const eye1Part = new Part("eye-1", eyeList, false);
export const eye2Part = new Part("eye-2", eyeList, false);
export const nosePart = new Part("nose", noseList, false);
export const mouthPart = new Part("mouth", mouthList, true);

const faceSVG = document.querySelector("#face-svg");

faceSVG.addEventListener("mouseover", onMouseOver);
faceSVG.addEventListener("touchstart", onMouseOver);

faceSVG.addEventListener("mouseout", onMouseOut);
faceSVG.addEventListener("touchend", onMouseOut);

faceSVG.addEventListener("mousedown", onMouseDown);
faceSVG.addEventListener("touchstart", onMouseDown);

function onMouseOver(e) {
    const part = e.target.closest("#foreground > *");
    if (part && !draggingPart) part.classList.add("hover");
}

function onMouseOut(e) {
    const part = e.target.closest("#foreground > *");
    if (part && !draggingPart) {
        part.classList.remove("hover");
        hideGrid();
    }
}

function onMouseDown(e) {
    const part = e.target.closest("#foreground > *");
    if (part) {
        showGrid();
        draggingPart = true;

        const partSVG = part.instance;

        const scale = draw.width() / faceSVG.clientWidth;

        partSVG
            .rect(partSVG.width(), partSVG.height())
            .fill("transparent")
            .stroke({color: faceForegroundColor, width: 2 * scale})
            .id("outline");

        partSVG.front();
        part.classList.add("dragging");

        if (e.touches && e.touches.length > 0) {
            setTouchEventOffsets(e, faceSVG);
        }

        const startX = e.offsetX * scale;
        const startY = e.offsetY * scale;
        const startOffsetX = startX - (partSVG.x() + gridPadding * gridSize);
        const startOffsetY = startY - (partSVG.y() + gridPadding * gridSize);

        faceSVG.addEventListener("mousemove", onMouseMove);
        faceSVG.addEventListener("touchmove", onMouseMove);

        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("touchend", onMouseUp);

        function onMouseMove(e) {
            e.preventDefault();

            if (e.touches) setTouchEventOffsets(e, faceSVG);

            const newX = e.offsetX * scale - gridPadding * gridSize - startOffsetX;
            const newY = e.offsetY * scale - gridPadding * gridSize - startOffsetY;

            const gridX = Math.round(newX / (gridSize / 2));
            const gridY = Math.round(newY / (gridSize / 2));

            if (!(gridX / 2 < 0) && !(gridX / 2 > gridDivisions - partSVG.width() / gridSize))
                partSVG.x(grid(gridX * 0.5));
            if (!(gridY / 2 < 0) && !(gridY / 2 > gridDivisions - partSVG.height() / gridSize))
                partSVG.y(grid(gridY * 0.5));
        }

        function onMouseUp(e) {
            draggingPart = null;
            hideGrid();
            partSVG.find("#outline").remove();
            part.classList.remove("hover");
            part.classList.remove("dragging");

            faceSVG.removeEventListener("mousemove", onMouseMove);
            faceSVG.removeEventListener("touchmove", onMouseMove);

            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("touchend", onMouseUp);
        }
    }
}

export function randomiseFace() {
    eye1Part.clear();
    eye2Part.clear();
    nosePart.clear();
    mouthPart.clear();

    mouthPart.randomise();

    let eyeSlots = mouthPart.partData.slots;

    if (!mouthPart.partData.skipNose) {
        nosePart.randomise();
        eyeSlots = nosePart.partData.slots;
    }

    if (eyeSlots[0]) {
        eye1Part.randomise(eyeSlots[0]);
    }

    if (eyeSlots[1]) {
        eye2Part.randomise(eyeSlots[1]);
    }

    updatePartButtonStates();
    updateFlipButtonStates();
}

export function setFaceForeground(color) {
    faceForegroundColor = color;
    face.fill(faceForegroundColor);
    gridLines.stroke(faceForegroundColor);
}

export function setFaceBackground(color) {
    faceBackgroundColor = color;
    background.fill(faceBackgroundColor);
}

export function getFaceSVG(radius) {
    const hoveredParts = faceSVG.querySelectorAll(".hover");
    hoveredParts.forEach((part) => part.classList.remove("hover"));
    const newSVG = draw.clone();
    newSVG.attr("xmlns:svgjs", null);

    if (radius) newSVG.find("#background").radius(radius);

    hoveredParts.forEach((part) => part.classList.add("hover"));
    return newSVG.svg();
}

export function showGrid() {
    gridLines.addTo(draw);
    gridLines.backward();
}
export function hideGrid() {
    gridLines.remove();
}
function setTouchEventOffsets(e, parent) {
    const touch = e.touches[0];

    if (touch) {
        e.offsetX = touch.pageX - parent.getBoundingClientRect().left;
        e.offsetY = touch.pageY - parent.getBoundingClientRect().top;
    }
}

export function setActivePartButton(buttonsEl, name) {
    buttonsEl.childNodes.forEach((button) => button.classList.remove("active"));
    buttonsEl.querySelector(`[data-part="${name}"]`)?.classList.add("active");
}

export function updatePartButtonStates() {
    document.querySelector("#parts-eye-1").childNodes.forEach((button) => {
        button.classList.toggle("active", button.dataset.part === (eye1Part.partData?.name ?? "Eye00"));
    });
    document.querySelector("#parts-eye-2").childNodes.forEach((button) => {
        button.classList.toggle("active", button.dataset.part === (eye2Part.partData?.name ?? "Eye00"));
    });
    document.querySelector("#parts-nose").childNodes.forEach((button) => {
        button.classList.toggle("active", button.dataset.part === (nosePart.partData?.name ?? "Nose00"));
    });
    document.querySelector("#parts-mouth").childNodes.forEach((button) => {
        button.classList.toggle("active", button.dataset.part === (mouthPart.partData?.name ?? "Mouth00"));
    });
}

export function updateFlipButtonStates() {
    document.querySelector("#eye-1-flip-x").classList.toggle("active", eye1Part.flipX);
    document.querySelector("#parts-eye-1").classList.toggle("flip-x", eye1Part.flipX);

    document.querySelector("#eye-2-flip-x").classList.toggle("active", eye2Part.flipX);
    document.querySelector("#parts-eye-2").classList.toggle("flip-x", eye2Part.flipX);

    document.querySelector("#nose-flip-x").classList.toggle("active", nosePart.flipX);
    document.querySelector("#parts-nose").classList.toggle("flip-x", nosePart.flipX);

    document.querySelector("#mouth-flip-x").classList.toggle("active", mouthPart.flipX);
    document.querySelector("#mouth-flip-y").classList.toggle("active", mouthPart.flipY);
    document.querySelector("#parts-mouth").classList.toggle("flip-x", mouthPart.flipX);
    document.querySelector("#parts-mouth").classList.toggle("flip-y", mouthPart.flipY);
}
