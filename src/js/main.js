import $ from 'jquery';
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

$(() => {
    setCSSCustomProperties();
    $('body').addClass('colours-applied');

    colors.forEach((color) => {
        // If colour is dark, set its disabled colour to be light
        let disabledLight = contrastChecker.isLevelCustom(color, '#ffffff', 4.5);

        $('#colors-fg').append(
            `<button class="property-group__button property-group__button--color ${color === faceForegroundColor ? 'active' : ''} ${
                color === faceBackgroundColor ? 'disabled' : ''
            } ${
                disabledLight ? 'disabled-light' : ''
            }" data-background="${color}" style="background-color: ${color}"></button>`,
        );
        $('#colors-bg').append(
            `<button class="property-group__button property-group__button--color ${color === faceBackgroundColor ? 'active' : ''} ${
                color === faceForegroundColor ? 'disabled' : ''
            } ${
                disabledLight ? 'disabled-light' : ''
            }" data-foreground="${color}" style="background-color: ${color}"></button>`,
        );
    });

    noseList.forEach((nose) => {
        $('.property-group#parts-nose').append(createPartButton(nose));
    });

    eyeList.forEach((eye) => {
        $('.property-group#parts-eye-1').append(createPartButton(eye));
        $('.property-group#parts-eye-2').append(createPartButton(eye));
    });

    mouthList.forEach((mouth) => {
        $('.property-group#parts-mouth').append(createPartButton(mouth));
    });

    $('.property-group__button--color').on('click', function () {
        const fg = $(this).data('foreground');
        const bg = $(this).data('background');

        if (fg) {
            if (fg === faceForegroundColor) {
                setFaceForeground(faceBackgroundColor);
                backgroundColor(faceBackgroundColor);
            }
            setFaceBackground(fg);
            foregroundColor(fg);
        }
        if (bg) {
            if (bg === faceBackgroundColor) {
                setFaceBackground(faceForegroundColor);
                foregroundColor(faceForegroundColor);
            }
            setFaceForeground(bg);
            backgroundColor(bg);
        }

        setCSSCustomProperties();
        updateFavicon();
    });

    $('#randomise').on('click', function (e) {
        randomiseFaceParts();
        faceJiggle();
    });

    $('.face-history').on('click', '.face-history__item>svg', function () {
        setFromHistory(this.id);

        setCSSCustomProperties();
        foregroundColor(faceBackgroundColor.toUpperCase());
        backgroundColor(faceForegroundColor.toUpperCase());
        faceJump();
    });

    $('#export').on('click', function () {
        exportSVG(getFaceSVG());
    });
    $(document).on('svgUpdated', function () {
        updateFavicon();
    });
});

function foregroundColor(color = null) {
    // set
    if (color) {
        $('[data-background').removeClass('disabled');
        $(`[data-background="${color}"]`).addClass('disabled');
        $('[data-foreground]').removeClass('active');
        $(`[data-foreground="${color}"]`).addClass('active');
    }
    // get
    else return document.body.style.getPropertyValue('--foreground');
}

function backgroundColor(color = null) {
    // set
    if (color) {
        $('[data-foreground').removeClass('disabled');
        $(`[data-foreground="${color}"]`).addClass('disabled');
        $('[data-background]').removeClass('active');
        $(`[data-background="${color}"]`).addClass('active');
    }
    // get
    else return document.body.style.getPropertyValue('--background');
}

function setCSSCustomProperties() {
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
    $('.face').removeClass('jiggle').removeClass('jump');
    setTimeout(function () {
        $('.face').addClass('jiggle');
    }, 0);
}
function faceJump() {
    $('.face').removeClass('jiggle').removeClass('jump');
    setTimeout(function () {
        $('.face').addClass('jump');
    }, 0);
}

function updateFavicon() {
    const prepend = 'data:image/svg+xml;utf8,';
    const svg = getFaceSVG('15%').replace(/\"/g, "'").replace(/\#/g, '%23');

    let toDelete;
    if ((toDelete = document.querySelector('link#favicon'))) toDelete.remove;

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

function createPartButton(partData) {
    const $button = document.createElement('button');
    const svgBase64 = partData.path.match(/data:.+?,(.*)/)[1];
    const svg = atob(svgBase64).trim();
    $button.classList.add("property-group__button", "property-group__button--part")
    $button.dataset.part = partData.name;
    $button.innerHTML = svg;
    return $($button);
}
