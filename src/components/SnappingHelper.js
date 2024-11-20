import { fabric } from "fabric";

const snappingDistance = 10;

export const handleObjectMoving = (canvas, obj, guidelines, setGuidelines) => {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const left = obj.left;
    const top = obj.top;
    const right = left + obj.width * obj.scaleX;
    const bottom = top + obj.height * obj.scaleY;

    const centerX = left + (obj.width * obj.scaleX) / 2;
    const centerY = top + (obj.height * obj.scaleY) / 2;

    let newGuidelines = [];
    clearGuidelines(canvas);

    const snap = (value, snapTo) => Math.abs(value - snapTo) < snappingDistance;

    let snapped = false;

    // Check snapping for each coordinate and add guidelines
    if (snap(left, 0)) {
        obj.set({ left: 0 });
        newGuidelines.push(createVerticalGuideline(canvas, 0, "vertical-left"));
        snapped = true;
    }

    if (snap(right, canvasWidth)) {
        obj.set({ left: canvasWidth - obj.width * obj.scaleX });
        newGuidelines.push(createVerticalGuideline(canvas, canvasWidth, "vertical-right"));
        snapped = true;
    }

    if (snap(top, 0)) {
        obj.set({ top: 0 });
        newGuidelines.push(createHorizontalGuideline(canvas, 0, "horizontal-top"));
        snapped = true;
    }

    if (snap(bottom, canvasHeight)) {
        obj.set({ top: canvasHeight - obj.height * obj.scaleY });
        newGuidelines.push(createHorizontalGuideline(canvas, canvasHeight, "horizontal-bottom"));
        snapped = true;
    }

    if (snap(centerX, canvasWidth / 2)) {
        obj.set({ left: canvasWidth / 2 - (obj.width * obj.scaleX) / 2 });
        newGuidelines.push(createVerticalGuideline(canvas, canvasWidth / 2, "vertical-center"));
        snapped = true;
    }

    if (snap(centerY, canvasHeight / 2)) {
        obj.set({ top: canvasHeight / 2 - (obj.height * obj.scaleY) / 2 });
        newGuidelines.push(createHorizontalGuideline(canvas, canvasHeight / 2, "horizontal-center"));
        snapped = true;
    }

    // Render new guidelines
    newGuidelines.forEach(line => canvas.add(line));
    setGuidelines(newGuidelines);

    canvas.renderAll();
};


export const createVerticalGuideline = (canvas, x, id) => {
    console.log("canvas, x, id",canvas, x, id);
    return new fabric.Line([x, 0, x, canvas.height], {
        id,
        stroke: "red",
        strokeWidth: 1,
        selectable: false,
        evented: false,
        strokeDashArray: [5, 5],
        opacity: 0.8,
    });
};

export const createHorizontalGuideline = (canvas, y, id) => {
    return new fabric.Line([0, y, canvas.width, y], {
        id,
        stroke: "red",
        strokeWidth: 1,
        selectable: false,
        evented: false,
        strokeDashArray: [5, 5],
        opacity: 0.8,
    });
};

export const clearGuidelines = (canvas) => {
    const objects = canvas.getObjects().filter(obj => obj.type === "line");
    objects.forEach(obj => {
        if (obj.id && (obj.id.startsWith("vertical-") || obj.id.startsWith("horizontal-"))) {
            canvas.remove(obj);
        }
    });
    canvas.renderAll();
};

const guidelinesExists = (canvas, id) => {
    const objects = canvas.getObjects().filter(obj => obj.type === "line");
    return objects.some(obj => obj.id === id);
};