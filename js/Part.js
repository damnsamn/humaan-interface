import {cloneDeep} from "lodash";
import {debug, gridDivisions} from "./face/config";
import {face} from "./face/face";
import {getSvgFromPath, grid, randomBool, randomInt, randomIntHalf} from "./utilities";

export class Part {
    static #instances = [];

    name;
    #partList;
    #shouldFlipY;

    partData;
    flipX;
    flipY;
    SVG;

    #boundX;
    #boundY;
    #boundW;
    #boundH;

    constructor(name, partList, shouldFlipY) {
        this.name = name;
        this.#partList = partList;
        this.#shouldFlipY = shouldFlipY;

        Part.#instances.push(this);
    }

    randomise(slot = null) {
        let i;

        if (slot) {
            this.setBounds(...Object.values(Part.normaliseSlot(slot)));

            const availableParts = this.#partList.filter(
                (element) => element.width <= this.#boundW && element.height <= this.#boundH,
            );

            const availablePart = availableParts[randomInt(availableParts.length - 1)];
            i = this.#partList.findIndex((part) => part === availablePart);
        } else {
            i = randomInt(this.#partList.length - 1);
        }

        this.set(i, randomBool(), this.#shouldFlipY ? randomBool() : false, slot);

        return this;
    }

    setBounds(x, y, w, h) {
        this.#boundX = x;
        this.#boundY = y;
        this.#boundW = w;
        this.#boundH = h;

        return this;
    }

    setFlipX(bool) {
        this.flipX = bool;

        return this;
    }

    setFlipY(bool) {
        if (this.#shouldFlipY) {
            this.flipY = bool;
        }

        return this;
    }

    set(index, flipX = this.flipX, flipY = this.flipY, slot = null) {
        this.setFlipX(flipX);
        this.setFlipY(flipY);

        this.partData = cloneDeep(this.#partList[index]);

        // If we're provided with a slot, ensure that we've set normalised bounds
        if (slot) {
            this.setBounds(...Object.values(Part.normaliseSlot(slot)));
        }

        // If we're not within a slot, set our bounds. If we are - we're randomising they've already been set for that process
        if (!slot) {
            this.setBounds(this.partData.boundX, this.partData.boundY, this.partData.boundW, this.partData.boundH);
        }

        // Flip bounds (if we weren't already given some)
        if (flipX && !slot) {
            this.#boundX = gridDivisions - this.partData.boundX - this.partData.boundW;
        }

        const svg = getSvgFromPath(this.partData.path);

        // Define part
        this.SVG = face
            .nested()
            .svg(svg)
            .move(grid(this.#boundX), grid(this.#boundY))
            .size(grid(this.partData.width), grid(this.partData.height))
            .id(this.name);

        // Flip part
        flipX && this.SVG.children().children().flip("x");
        if (this.#shouldFlipY && flipY) {
            // this.SVG.children().children().flip("y");
            this.SVG.children().children().rotate(180);
        }

        // Position part
        const x = randomIntHalf(this.#boundW - this.partData.width);
        const y = randomIntHalf(this.#boundH - this.partData.height);
        this.SVG.dmove(grid(x), grid(y));

        // If part has slots, transform the slots to match
        if (this.partData.slots) {
            // Normalise slots
            for (let i = 0; i < this.partData.slots.length; i++) {
                const slot = this.partData.slots[i];
                slot.x += this.#boundX + x;
                slot.y += this.#boundY + y;
            }

            // Flip slots
            if (flipX) {
                for (let i = 0; i < this.partData.slots.length; i++) {
                    const slot = this.partData.slots[i];
                    const axis = this.#boundX + x + this.partData.width / 2;

                    slot.x = axis - (slot.x - axis) - slot.width;
                }
            }
        }

        // DEBUG: Draw bounds
        if (debug) {
            face.rect(grid(this.#boundW), grid(this.#boundH))
                .move(grid(this.#boundX), grid(this.#boundY))
                .fill({color: "#ff00ff", opacity: 0.2})
                .stroke("#ff00ff");
            if (this.partData.slots) {
                for (let i = 0; i < this.partData.slots.length; i++) {
                    const slot = this.partData.slots[i];
                    face.rect(grid(slot.width), grid(slot.height))
                        .move(grid(slot.x), grid(slot.y))
                        .fill({color: "#0000ff", opacity: 0.2})
                        .stroke("#0000ff");
                }
            }
        }

        // Flatten the SVG
        this.SVG.flatten();

        return this;
    }

    clear() {
        if (this.SVG) {
            this.SVG.remove();
        }

        this.partData = null;
        this.flipX = null;
        this.flipY = null;
        this.SVG = null;
        this.#boundX = null;
        this.#boundY = null;
        this.#boundW = null;
        this.#boundH = null;

        return this;
    }

    setProperties(object) {
        Object.entries(object).forEach(([key, value]) => {
            this[key] = value;
        });
    }

    static normaliseSlot(slot) {
        return {
            x: Math.max(0, slot.x),
            y: Math.max(0, slot.y),
            w: Math.abs(Math.max(0, slot.x) - Math.min(gridDivisions, slot.x + slot.width)),
            h: Math.abs(Math.max(0, slot.y) - Math.min(gridDivisions, slot.y + slot.height)),
        };
    }

    static getByName(name) {
        return Part.#instances.find((part) => part.name === name);
    }
}
