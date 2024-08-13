// Auteur: Roel Kemp
document.addEventListener('DOMContentLoaded', drawFretboard);
document.addEventListener('DOMContentLoaded', refreshScale);

const canvas1 = document.getElementById('canvas1');
canvas1.setAttribute("width", window.innerWidth-20+"");
canvas1.setAttribute("height", window.innerHeight+"");
const ctx1 = canvas1.getContext('2d');

const canvas2 = document.getElementById('canvas2');
canvas2.setAttribute("width", window.innerWidth-20+"");
canvas2.setAttribute("height", window.innerHeight+"");
const ctx2 = canvas2.getContext('2d');

const scaleDisplay = document.getElementById("scale_display");
scaleDisplay.style.fontSize = 1 + (innerWidth / 1000) + "rem";

const customStrings = document.getElementById("strings_text");

// Hier kunnen snaren worden toegevoegd of worden verwijderd.
// "flatSharp" geeft aan of een toon verhoogd of verlaagd is.
// Als je een Bb snaar toe wilt voegen schrijf je dus: B, -1.
let tuning = [
    new Tone("E", 0),
    new Tone("B", 0),
    new Tone("G", 0),
    new Tone("D", 0),
    new Tone("A", 0),
    new Tone("E", 0)
]

const COLOR_SCHEME = ["#b40000", "#000082", "#ff2828", "#1414ff",
    "#ff6464", "#6464ff", "#8000ff"];

const FRETBOARD_X = 75;
const FRETBOARD_Y = 10;

const FRETBOARD_MARGIN = 5;
const FRETBOARD_WIDTH = window.innerWidth - FRETBOARD_MARGIN;
const STRING_SPACING = 40;
let fretboardHeight = tuning.length * STRING_SPACING;
const FRETBOARD_COLOR = "#000";

const STRING_EDGE_SPACE = 15;
const STRING_COLOR = "#FFF";

const NR_OF_FRETS = 16; // incl. fret 0.
const FRET_SPACE_RATIO = 0.975;
const MAGIC = 1.04;
const FRET_COLOR = "#444";
const FRET_SIZE = 5;
const OCTAVE_FRET = 12;

const INLAY_POSITIONS = [3, 5, 7, 9, 12, 15];
const INLAY_SIZE = 10;
const INLAY_COLOR = "#666";
const INLAY_TEXT_COLOR = "#FFF";

const FB_NR_SPACING = 40;
const POS_NR_FONT = "2rem courier new";
const POS_NR_OFFSET = -8;
const DOUBLE_D_OFFSET = -6;

let fretXs = calcFretXs();
let toneXs = calcToneXs();
let stringYs = calcStringYs();

const LEGEND_SPACING = 70;
const LEGEND_X = (innerWidth / 2) - (LEGEND_SPACING * COLOR_SCHEME.length / 2);
let legendY = fretboardHeight + FB_NR_SPACING + 50;
const LEGEND_FONT = "2rem courier new";
const ROOT_RING_COLOR = "#fff";
const ROOT_RING_WIDTH = 3;

const LABEL_SIZE = innerWidth / 220 + 10;
const LABEL_TEXT_X_OFFSET = -13;
const LABEL_TEXT_Y_OFFSET = 10;
const LABEL_TEXT_COLOR = "#FFF";
const LABEL_TEXT_FONT = (innerWidth / 1500) + 1 + "rem courier new";

function validateCustomStrings() {
    let splitArray = customStrings.value.trim().split(" ");

    for (let i = 0; i < splitArray.length; i++) {
        if (splitArray[i].length === 0) {
            return false;
        }
        if (!("ABCDEFGabcdefg".includes(splitArray[i][0]))) {
            return false;
        }
        if (splitArray[i].length > 1) {
            if (splitArray[i][1] === "b") {
                for (let j = 1; j < splitArray[i].length; j++) {
                    if (splitArray[i][j] != "b") {
                        return false;
                    }
                }
            }
            else if (splitArray[i][1] === "#") {
                for (let j = 1; j < splitArray[i].length; j++) {
                    if (splitArray[i][j] != "#") {
                        return false;
                    }
                }
            } else {
                return false;
            }
        }
    }
    return true;
}

function changeStrings() {
    if (validateCustomStrings()) {
        let splitArray = customStrings.value.trim().split(" ");
        let toneArray = [];
        for (let i = 0; i < splitArray.length; i++) {
            let str = splitArray[i];
            let natural = str[0].toUpperCase();
            let flatsharp = 0;
            if (str.length > 1) {
                flatsharp = str[1] == "b" ? -str.length+1 : str.length-1;
            }
            toneArray.unshift(new Tone(natural, flatsharp));
        }
        tuning = toneArray;
        refreshAll();
    } else {
        customStrings.value = "";
        customStrings.placeholder = "wrong format! (use:B Eb A#)";
    }
}

function refreshAll() {
    ctx1.clearRect(0, 0, innerWidth, innerHeight);
    fretboardHeight = tuning.length * STRING_SPACING;
    legendY = fretboardHeight + FB_NR_SPACING + 50;
    fretXs = calcFretXs();
    toneXs = calcToneXs();
    stringYs = calcStringYs();
    drawFretboard();
    refreshScale();
}

function drawFretboard() {
    ctx1.fillStyle = FRETBOARD_COLOR;
    ctx1.beginPath();
    ctx1.fillRect(FRETBOARD_X, FRETBOARD_Y, FRETBOARD_WIDTH, fretboardHeight);
    ctx1.fillStyle = FRET_COLOR;
    for (let i = 0; i < calcFretXs().length; i++) {
        ctx1.fillRect(fretXs[i], FRETBOARD_Y, FRET_SIZE, fretboardHeight);
    }
    ctx1.font = POS_NR_FONT;
    for (let i = 0; i < INLAY_POSITIONS.length; i++) {
        ctx1.fillStyle = INLAY_COLOR;
        if (INLAY_POSITIONS[i] === OCTAVE_FRET) {
            ctx1.beginPath();
            ctx1.arc(toneXs[INLAY_POSITIONS[i]], FRETBOARD_Y + (fretboardHeight / 6 * 2), INLAY_SIZE,
                0, 2 * Math.PI);
            ctx1.fill();
            ctx1.beginPath();
            ctx1.arc(toneXs[INLAY_POSITIONS[i]], FRETBOARD_Y + (fretboardHeight / 6 * 4), INLAY_SIZE,
                0, 2 * Math.PI);
            ctx1.fill();
        } else {
            ctx1.arc(toneXs[INLAY_POSITIONS[i]], FRETBOARD_Y + fretboardHeight / 2, INLAY_SIZE,
                0, 2 * Math.PI);
            ctx1.fill();
        }
        ctx1.fillStyle = INLAY_TEXT_COLOR;
        ctx1.fillText(""+INLAY_POSITIONS[i],
            toneXs[INLAY_POSITIONS[i]] + POS_NR_OFFSET + (INLAY_POSITIONS[i] > 9 ? DOUBLE_D_OFFSET : 0),
            FRETBOARD_Y + fretboardHeight + FB_NR_SPACING);
    }

    ctx1.fillStyle = STRING_COLOR;
    for (let i = 0; i < stringYs.length; i++) {
        ctx1.fillRect(0, FRETBOARD_Y + stringYs[i],FRETBOARD_X + FRETBOARD_WIDTH,i + 1);
    }

    ctx1.font = LEGEND_FONT;
    for (let i = 0; i < COLOR_SCHEME.length; i++) {
        ctx1.fillStyle = COLOR_SCHEME[i];
        ctx1.beginPath();
        ctx1.arc(LEGEND_X + i * LEGEND_SPACING, legendY, LABEL_SIZE, 0, 2 * Math.PI);
        ctx1.fill();
        if (i === 0) {
            ctx1.lineWidth = ROOT_RING_WIDTH;
            ctx1.strokeStyle = ROOT_RING_COLOR;
            ctx1.stroke();
        }
        ctx1.fillStyle = LABEL_TEXT_COLOR;
        let ordIndic;
        if (i + 1 === 1) {
            ordIndic = "st";
        } else if (i + 1 === 2) {
            ordIndic = "nd";
        } else if (i + 1 === 3) {
            ordIndic = "rd";
        } else {
            ordIndic = "th";
        }
        ctx1.fillText((i+1) + ordIndic, LEGEND_X + (i * LEGEND_SPACING) + LABEL_TEXT_X_OFFSET,
            legendY + LABEL_TEXT_Y_OFFSET, LABEL_SIZE * 1.5);
    }
}

function calcFretXs() {
    let fretSpacing = FRETBOARD_WIDTH / ((NR_OF_FRETS + 1) * Math.pow(FRET_SPACE_RATIO, NR_OF_FRETS)) * MAGIC;
    let fretXs = [];
    for (let i = 0; i < NR_OF_FRETS; i++) {
        let fretX = FRETBOARD_X + (i * fretSpacing);
        fretXs.push(fretX);
        fretSpacing *= FRET_SPACE_RATIO;
    }
    return fretXs;
}

function calcToneXs() {
    let toneXs = [];
    let fretXs = calcFretXs();
    toneXs.push(FRETBOARD_X / 2); // <-- For the open string.
    for (let i = 1; i < NR_OF_FRETS; i++) {
        toneXs.push(fretXs[i] - ((fretXs[i] - (fretXs[i-1])) / 2));
    }
    return toneXs;
}

function calcStringYs() {
    let stringYs = [];
    for (let i = 0; i < tuning.length; i++) {
        let stringY = STRING_EDGE_SPACE + (i * ((fretboardHeight - STRING_EDGE_SPACE * 2) / (tuning.length - 1 || 1)));
        stringYs.push(stringY);
    }
    return stringYs;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const NATURALS = "CDEFGAB";
const SEMITONES = "C D EF G A B";
const IONIAN_PATTERN = [2, 2, 1, 2, 2, 2, 1];

function Tone(natural, flatSharp, interval) {
    this.natural = natural;
    this.flatSharp = parseInt(flatSharp);
    this.interval = interval || 0;

    this.toString = () => {
        let accidentals = "";
        for (let i = 0; i < Math.abs(flatSharp); i++) {
            accidentals += (flatSharp < 0 ? "b" : "#");
        }
        return natural + accidentals;
    }
}

function Scale(root, mode) {
    if (mode === undefined) {
        mode = 1;
    }
    let accidentals;

    let tones = [];
    let semitoneSteps = 0;
    for (let i = 1; i <= NATURALS.length; i++) {
        tones.push(calcTone(i, semitoneSteps));
        semitoneSteps += calcWholeHalfPattern()[i - 1];
    }
    this.tones = tones;

    function calcTone(interval, semitoneSteps) {
        let targetNatural = toneAt(NATURALS.indexOf(root.natural) + interval - 1, NATURALS);
        let flatSharpOffset = root.flatSharp;

        if (toneAt(SEMITONES.indexOf(root.natural) + semitoneSteps, SEMITONES) !== targetNatural) {
            for (let i = 1; i <= 6; i++) {
                if (toneAt(SEMITONES.indexOf(root.natural) + semitoneSteps - i, SEMITONES) === targetNatural) {
                    flatSharpOffset += i;
                    break;
                } else if (toneAt(SEMITONES.indexOf(root.natural) + semitoneSteps + i, SEMITONES) === targetNatural) {
                    flatSharpOffset -= i;
                    break;
                }
            }
        }
        accidentals += flatSharpOffset;
        return new Tone(targetNatural, flatSharpOffset, interval);
    }

    function calcWholeHalfPattern() {
        let index = mode - 1;
        while (index < 0) {
            index += IONIAN_PATTERN.length;
        }
        let pattern = [];
        for (let i = 0; i < IONIAN_PATTERN.length; i++) {
            pattern[i] = IONIAN_PATTERN[(index + i) % IONIAN_PATTERN.length];
        }
        return pattern;
    }

    function toneAt(index, scaleString) {
        while (index < 0) {
            index += scaleString.length;
        }
        return scaleString.charAt(index % scaleString.length);
    }

    this.toString = () => {
        let sclStr = "";
        for (let i = 0; i < tones.length; i++) {
            sclStr += tones[i] + (i === tones.length - 1 ? "" : " ");
        }
        sclStr += "(" + tones[0] + ")";
        return sclStr;
    }
}

function getReorderedSemitones(startTone) {
    let index = SEMITONES.indexOf(startTone.natural);
    index += startTone.flatSharp;
    while (index < 0) {
        index += SEMITONES.length;
    }
    return SEMITONES.substring(index % SEMITONES.length) + SEMITONES.substring(0, index % SEMITONES.length);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let scale;

function refreshScale() {
    ctx2.clearRect(0, 0, innerWidth, innerHeight);

    let selNatural = document.getElementById("select_natural").value;
    let selAcc = document.getElementById("select_accidental").value;
    let selMode = document.getElementById("select_scale").value;

    scale = new Scale(new Tone(selNatural, selAcc), selMode);

    scaleDisplay.textContent = scale;
    drawScale();
}

function drawScale() {
    ctx2.font = LABEL_TEXT_FONT;
    ctx2.strokeStyle = ROOT_RING_COLOR;
    ctx2.lineWidth = ROOT_RING_WIDTH;
    for (let i = 0; i < tuning.length; i++) {
        let reorderedSemitones = getReorderedSemitones(tuning[i]);
        for (let j = 0; j < scale.tones.length; j++) {
            let toneIndex = reorderedSemitones.indexOf(scale.tones[j].natural) +
                parseInt(scale.tones[j].flatSharp);

            while (toneIndex < 0) {
                toneIndex += OCTAVE_FRET;
            }
            toneIndex %= OCTAVE_FRET;

            let x = toneXs[toneIndex];

            let y = FRETBOARD_Y + stringYs[i] + i;
            ctx2.fillStyle = COLOR_SCHEME[scale.tones[j].interval - 1];
            ctx2.beginPath();
            ctx2.arc(x, y, LABEL_SIZE, 0, 2 * Math.PI);
            ctx2.fill();
            ctx2.fillStyle = LABEL_TEXT_COLOR;
            ctx2.fillText(scale.tones[j].toString(), x + LABEL_TEXT_X_OFFSET,
                y + LABEL_TEXT_Y_OFFSET, LABEL_SIZE * 1.5);
            if (scale.tones[j].interval === 1) {
                ctx2.beginPath();
                ctx2.arc(x, y, LABEL_SIZE, 0, 2 * Math.PI);
                ctx2.stroke();
            }
            if (toneIndex <= 3) {
                ctx2.fillStyle = COLOR_SCHEME[scale.tones[j].interval - 1];
                ctx2.beginPath();
                ctx2.arc(toneXs[toneIndex + OCTAVE_FRET % toneXs.length], y, LABEL_SIZE,
                    0, 2 * Math.PI);
                ctx2.fill();
                ctx2.fillStyle = LABEL_TEXT_COLOR;
                ctx2.fillText(scale.tones[j].toString(),
                    toneXs[toneIndex + OCTAVE_FRET % toneXs.length] + LABEL_TEXT_X_OFFSET,
                    y + LABEL_TEXT_Y_OFFSET, LABEL_SIZE * 1.5);
                if (scale.tones[j].interval === 1) {
                    ctx2.beginPath();
                    ctx2.arc(toneXs[toneIndex + OCTAVE_FRET % toneXs.length], y, LABEL_SIZE,
                        0, 2 * Math.PI);
                    ctx2.stroke();
                }
            }
        }
    }
}