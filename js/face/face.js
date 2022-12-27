import $ from 'jquery';
import {SVG} from '@svgdotjs/svg.js';
import {debug, gridSize, gridDivisions, gridPadding} from './config';
import {grid, chooseRandomColor, randomInt, randomIntHalf, getSvgFromPath, Flip} from '../utilities';
import {eyeList, mouthList, noseList} from './parts';

import cloneDeep from 'lodash/cloneDeep';

export const Moods = {
    RANDOM: 0,
    HAPPY: 1,
    SAD: 2,
};

export let faceBackgroundColor = chooseRandomColor(),
    faceForegroundColor = chooseRandomColor(),
    mood = Moods.RANDOM;

let mouthPart,
    nosePart,
    eyeSlots = [],
    history = [];

const width = (gridDivisions + gridPadding * 2) * gridSize,
    height = width,
    renderedEvent = new Event('svgUpdated');

let draw = SVG().addTo('#face').size(width, height).id('face-svg').viewbox(0, 0, width, height);

let background = draw.rect(width, height).attr({fill: faceBackgroundColor}).id('background');

let face = draw
    .nested()
    .size(gridSize * gridDivisions, gridSize * gridDivisions)
    .move(grid(gridPadding), grid(gridPadding))
    .fill(faceForegroundColor)
    .id('foreground');

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

render();

let draggingPart;
const faceSVG = document.querySelector('#face-svg');

faceSVG.addEventListener('mouseover', onMouseOver);
faceSVG.addEventListener('touchstart', onMouseOver);

faceSVG.addEventListener('mouseout', onMouseOut);
faceSVG.addEventListener('touchend', onMouseOut);

faceSVG.addEventListener('mousedown', onMouseDown);
faceSVG.addEventListener('touchstart', onMouseDown);

function onMouseOver(e) {
    const part = e.target.closest('#foreground > *');
    if (part && !draggingPart) part.classList.add('hover');
}

function onMouseOut(e) {
    const part = e.target.closest('#foreground > *');
    if (part && !draggingPart) {
        part.classList.remove('hover');
        hideGrid();
    }
}

function onMouseDown(e) {
    const part = e.target.closest('#foreground > *');
    if (part) {
        showGrid();
        draggingPart = true;

        const partSVG = part.instance;

        const scale = draw.width() / faceSVG.clientWidth;

        partSVG
            .rect(partSVG.width(), partSVG.height())
            .fill('transparent')
            .stroke({color: faceForegroundColor, width: 2 * scale})
            .id('outline');

        partSVG.front();
        part.classList.add('dragging');

        if (e.touches && e.touches.length > 0) {
            setTouchEventOffsets(e, faceSVG);
        }

        const startX = e.offsetX * scale;
        const startY = e.offsetY * scale;
        const startOffsetX = startX - (partSVG.x() + gridPadding * gridSize);
        const startOffsetY = startY - (partSVG.y() + gridPadding * gridSize);

        faceSVG.addEventListener('mousemove', onMouseMove);
        faceSVG.addEventListener('touchmove', onMouseMove);

        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchend', onMouseUp);

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
            partSVG.find('#outline').remove();
            part.classList.remove('hover');
            part.classList.remove('dragging');

            faceSVG.removeEventListener('mousemove', onMouseMove);
            faceSVG.removeEventListener('touchmove', onMouseMove);

            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchend', onMouseUp);

            document.dispatchEvent(renderedEvent);
        }
    }
}

function render() {
    mouthPart = renderPart(face, mouthList, true);

    let [mouth, mouthData] = mouthPart;
    eyeSlots = mouthData.slots;

    console.log({mouth, mouthData});

    if (!mouthData.skipNose) {
        nosePart = renderPart(face, noseList);
        const [nose, noseData] = nosePart;

        eyeSlots = noseData.slots;
    }

    drawEyes(face);

    document.dispatchEvent(renderedEvent);
}

function renderPart(face, partList, shouldFlipY) {
    let partListCopy = cloneDeep(partList);
    const i = randomInt(partListCopy.length - 1),
        partData = partListCopy[i];
    let part;

    const svg = getSvgFromPath(partData.path);

    const flipX = randomInt(1),
        flipY = mood === Moods.RANDOM ? randomInt(1) : mood === Moods.HAPPY ? 0 : mood === Moods.HAPPY ? 1 : false;

    // Flip bounds
    if (flipX) partData.boundX = gridDivisions - partData.boundX - partData.boundW;

    // Define part
    part = face
        .nested()
        .svg(svg)
        .move(grid(partData.boundX), grid(partData.boundY))
        .size(grid(partData.width), grid(partData.height))
        .id(partData.name);

    // Flip part
    flipX && part.children().children().flip('x');
    if (shouldFlipY && flipY) {
        // flipX && part.children().children().flip("x")
        part.children().children().rotate(180);
    }

    // Position part
    const x = randomIntHalf(partData.boundW - partData.width),
        y = randomIntHalf(partData.boundH - partData.height);
    part.dmove(grid(x), grid(y));

    if (partData.slots) {
        // Normalise slots
        for (let i = 0; i < partData.slots.length; i++) {
            const slot = partData.slots[i];
            slot.x += partData.boundX + x;
            slot.y += partData.boundY + y;
        }

        // Flip slots
        if (flipX) {
            for (let i = 0; i < partData.slots.length; i++) {
                const slot = partData.slots[i],
                    axis = partData.boundX + x + partData.width / 2;

                slot.x = axis - (slot.x - axis) - slot.width;
            }
        }
    }

    // DEBUG: Draw bounds
    if (debug) {
        face.rect(grid(partData.boundW), grid(partData.boundH))
            .move(grid(partData.boundX), grid(partData.boundY))
            .fill({color: '#ff00ff', opacity: 0.2})
            .stroke('#ff00ff');
        if (partData.slots) {
            for (let i = 0; i < partData.slots.length; i++) {
                const slot = partData.slots[i];
                face.rect(grid(slot.width), grid(slot.height))
                    .move(grid(slot.x), grid(slot.y))
                    .fill({color: '#0000ff', opacity: 0.2})
                    .stroke('#0000ff');
            }
        }
    }
    part.flatten();
    return [part, partData];
}

function drawEyes(face) {
    for (let i = 0; i < eyeSlots.length; i++) {
        const slot = eyeSlots[i];
        let slotX = Math.max(0, slot.x);
        let slotY = Math.max(0, slot.y);
        let slotW = Math.abs(Math.max(0, slot.x) - Math.min(gridDivisions, slot.x + slot.width));
        let slotH = Math.abs(Math.max(0, slot.y) - Math.min(gridDivisions, slot.y + slot.height));

        debug && face.line(grid(slotX), grid(slotY), grid(slotX + slotW), grid(slotY + slotH)).stroke('#000');

        const availableEyes = eyeList.filter((element) => element.width <= slotW && element.height <= slotH);
        const eyeData = availableEyes[randomInt(availableEyes.length - 1)];

        const svg = getSvgFromPath(eyeData.path);
        const flipX = randomInt(1);

        // Render part
        const eye = face
            .nested()
            .svg(svg)
            .size(grid(eyeData.width), grid(eyeData.height))
            .move(grid(slotX), grid(slotY))
            .id(eyeData.name);

        // Flip part
        flipX && eye.children().children().flip('x');

        // Position part
        const x = randomIntHalf(slotW - eyeData.width),
            y = randomIntHalf(slotH - eyeData.height);
        eye.dmove(grid(x), grid(y));
        eye.flatten();
    }
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
    const hoveredParts = faceSVG.querySelectorAll('.hover');
    hoveredParts.forEach((part) => part.classList.remove('hover'));
    const newSVG = draw.clone();
    newSVG.attr('xmlns:svgjs', null);

    if (radius) newSVG.find('#background').radius(radius);

    hoveredParts.forEach((part) => part.classList.add('hover'));
    return newSVG.svg();
}

export function randomiseFaceParts() {
    addToHistory();
    face.children().remove();
    render();
}

export function setFromHistory(id) {
    let historyFace = SVG(`#${id}`).clone();
    addToHistory();
    draw.clear();
    background = historyFace.findOne('rect').addTo(draw).id('background');
    faceBackgroundColor = background.fill();
    face = historyFace.findOne('svg').addTo(draw).id('foreground');
    faceForegroundColor = face.fill();
    document.dispatchEvent(renderedEvent);
}
function addToHistory() {
    const state = Flip.getState('#face-history');
    const oldFace = draw
        .clone()
        .addTo('#face-history')
        .back()
        .id('history-' + history.length);
    $('#history-' + history.length).wrap("<div class='face-history__item' tabindex='0'></div>");
    history.unshift(oldFace);
    if (history.length > 5) {
        history[5].parent().remove();
    }
    Flip.from(state);
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
