import $ from 'jquery';
import "/scss/style.scss";
import ColorContrastChecker from 'color-contrast-checker';
import {
    faceForegroundColor,
    faceBackgroundColor,
    setFaceBackground,
    setFaceForeground,
    getFaceSVG,
    randomiseFaceParts,
    setFromHistory,
    showGrid,
    hideGrid,
} from './face/face';
import {colors} from './face/config';
import {eyeList, mouthList, noseList} from './face/parts';

let contrastChecker = new ColorContrastChecker();

updateCSSColors();
debugger;
document.addEventListener('DOMContentLoaded', () => {

    document.body.classList.toggle('colours-applied');

    const foregroundButtons = document.querySelector('#colors-fg');
    const backgroundButtons = document.querySelector('#colors-bg');

    colors.forEach((color) => {
        foregroundButtons.appendChild(createColorButton(color, true));
        backgroundButtons.appendChild(createColorButton(color, false));
    });

    const noseButtons = document.querySelector('#parts-nose');
    noseList.forEach((nose) => {
        noseButtons.appendChild(createPartButton(nose));
    });

    const eye1Buttons = document.querySelector('#parts-eye-1');
    const eye2Buttons = document.querySelector('#parts-eye-2');
    eyeList.forEach((eye) => {
        eye1Buttons.appendChild(createPartButton(eye));
        eye2Buttons.appendChild(createPartButton(eye));
    });

    const mouthButtons = document.querySelector('#parts-mouth');
    mouthList.forEach((mouth) => {
        mouthButtons.appendChild(createPartButton(mouth));
    });

    const allColorButtons = document.querySelectorAll('.property-group__button--color');
    allColorButtons.forEach((button) =>
        button.addEventListener('click', (e) => {
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

            // if (fg && fg !== faceForegroundColor) {
            //     if (fg === faceBackgroundColor) {
            //         setFaceForeground(faceBackgroundColor);
            //         updateBackgroundButtons(faceBackgroundColor);
            //     }
            //     setFaceBackground(fg);
            //     updateForegroundButtons(fg);
            // }
            // if (bg && bg !== faceBackgroundColor) {
            //     console.log({bg, faceForegroundColor, faceBackgroundColor})
            //     if (bg === faceForegroundColor) {
            //         setFaceBackground(faceForegroundColor);
            //         updateForegroundButtons(faceForegroundColor);
            //     }
            //     setFaceForeground(bg);
            //     updateBackgroundButtons(bg);
            // }

            updateCSSColors();
            updateFavicon();
        }),
    );

    const randomiseButton = document.querySelector('#randomise');
    randomiseButton.addEventListener('click', () => {
        randomiseFaceParts();
        faceJiggle();
    });

    const faceHistory = document.querySelector('.face-history');
    faceHistory.addEventListener('click', (e) => {
        const historyButton = e.target.closest('.face-history__item > svg');

        if (historyButton) {
            setFromHistory(historyButton.id);

            updateCSSColors();
            updateForegroundButtons(faceBackgroundColor.toUpperCase());
            updateBackgroundButtons(faceForegroundColor.toUpperCase());
            faceJump();
        }
    });

    const exportButton = document.querySelector('#export');
    exportButton.addEventListener('click', () => {
        exportSVG(getFaceSVG());
    });

    document.addEventListener('svgUpdated', function () {
        updateFavicon();
    });
});

function updateForegroundButtons(color) {
    const foregroundButtons = document.querySelectorAll('.property-group__button--color[data-foreground]');
    const backgroundButtons = document.querySelectorAll('.property-group__button--color[data-background]');

    foregroundButtons.forEach((button) => {
        button.classList.toggle('active', color === button.dataset.foreground);
    });
    backgroundButtons.forEach((button) => {
        button.classList.toggle('disabled', color === button.dataset.background);
    });
}

function updateBackgroundButtons(color) {
    const foregroundButtons = document.querySelectorAll('.property-group__button--color[data-foreground]');
    const backgroundButtons = document.querySelectorAll('.property-group__button--color[data-background]');

    foregroundButtons.forEach((button) => {
        button.classList.toggle('disabled', color === button.dataset.foreground);
    });
    backgroundButtons.forEach((button) => {
        button.classList.toggle('active', color === button.dataset.background);
    });
}

function updateCSSColors() {
    document.body.style.setProperty('--background', faceForegroundColor);
    document.body.style.setProperty('--face-foreground', faceForegroundColor);
    document.body.style.setProperty('--face-background', faceBackgroundColor);

    if (contrastChecker.isLevelCustom(faceForegroundColor, faceBackgroundColor, 2)) {
        document.body.style.setProperty('--foreground', faceBackgroundColor);
        return;
    }

    if (contrastChecker.isLevelCustom(faceBackgroundColor, '#000000', 2)) {
        document.body.style.setProperty('--foreground', '#000000');
        return;
    }

    if (contrastChecker.isLevelCustom(faceBackgroundColor, '#FFFFFF', 2)) {
        document.body.style.setProperty('--foreground', '#FFFFFF');
        return;
    }
}

function faceJiggle() {
    const face = document.querySelector('.face');
    face.classList.remove('jiggle', 'jump');
    setTimeout(function () {
        face.classList.add('jiggle');
    }, 0);
}

function faceJump() {
    const face = document.querySelector('.face');
    face.classList.remove('jiggle', 'jump');
    setTimeout(function () {
        face.classList.add('jump');
    }, 0);
}

function updateFavicon() {
    const prepend = 'data:image/svg+xml;utf8,';
    const svg = getFaceSVG('15%').replace(/\"/g, "'").replace(/\#/g, '%23');

    let toDelete = document.querySelector('link#favicon');
    if (toDelete) toDelete.remove();

    const linkEl = document.createElement('link');
    linkEl.setAttribute('rel', 'icon');
    linkEl.setAttribute('href', `${prepend}${svg}`);
    linkEl.id = 'favicon';
    document.head.appendChild(linkEl);
}

function exportSVG(svg) {
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svg], {type: 'image/svg+xml;charset=utf-8'});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function createColorButton(color, isForeground) {
    const plane = isForeground ? 'foreground' : 'background';

    // If colour is dark, set its disabled colour to be light
    let disabledLight = contrastChecker.isLevelCustom(color, '#ffffff', 4.5);

    const $button = document.createElement('button');
    $button.classList.add('property-group__button', 'property-group__button--color');
    $button.classList.toggle('active', color === (isForeground ? faceForegroundColor : faceBackgroundColor));
    $button.classList.toggle('disabled', color === (isForeground ? faceBackgroundColor : faceForegroundColor));
    $button.classList.toggle('disabled-light', disabledLight);
    $button.dataset[plane] = color;
    $button.style.backgroundColor = color;

    return $button;
}

function createPartButton(partData) {
    const $button = document.createElement('button');
    // const svgBase64 = partData.path.match(/data:.+?,(.*)/)[1];
    // const svg = atob(svgBase64).trim();
    $button.classList.add('property-group__button', 'property-group__button--part');
    $button.dataset.part = partData.name;
    $button.innerHTML = partData.path;
    return $button;
}
