
import {
  collectHorizontalPoint,
  collectVerticalPoint,
} from "./util/collect-point";
import {
  drawHorizontalLine,
  drawPointList,
  drawVerticalLine,
} from "./util/draw";
import { collectLine } from "./util/collect-line";
import { aligningLineConfig } from "./constant";
import { getObjectsByTarget } from "./util/get-objects-by-target";
import { getContraryMap, getPointMap } from "./util/basic";

export function initAligningGuidelines(canvas, options = {}) {
  Object.assign(aligningLineConfig, options);

  const horizontalLines = new Set();
  const verticalLines = new Set();
  let onlyDrawPoint = false;
  const cacheMap = new Map();

  const getCaCheMapValue = (object) => {
    const cacheKey = [
      object.calcTransformMatrix().toString(),
      object.width,
      object.height,
    ].join();
    const cacheValue = cacheMap.get(cacheKey);
    if (cacheValue) return cacheValue;
    const value = object.getCoords();
    value.push(object.getCenterPoint());
    cacheMap.set(cacheKey, value);
    return value;
  };

  function moving(e) {
    const target = e.target;
    target.setCoords();
    onlyDrawPoint = false;
    verticalLines.clear();
    horizontalLines.clear();

    const objects =
      options.getObjectsByTarget?.(target) ?? getObjectsByTarget(target);
    const points = [];
    for (const object of objects) points.push(...getCaCheMapValue(object));

    const { vLines, hLines } = collectLine(target, points);
    vLines.forEach((o) => {
      verticalLines.add(JSON.stringify(o));
    });
    hLines.forEach((o) => {
      horizontalLines.add(JSON.stringify(o));
    });
  }

  function scalingOrResizing(e) {
    const target = e.target;
    target.setCoords();
    const isScale = String(e.transform.action).startsWith("scale");
    verticalLines.clear();
    horizontalLines.clear();

    const objects =
      options.getObjectsByTarget?.(target) ?? getObjectsByTarget(target);
    let corner = e.transform.corner;
    if (target.flipX) corner = corner.replace("l", "r").replace("r", "l");
    if (target.flipY) corner = corner.replace("t", "b").replace("b", "t");

    const pointMap = options.getPointMap?.(target) ?? getPointMap(target);
    if (!(corner in pointMap)) return;
    onlyDrawPoint = corner.includes("m");
    if (onlyDrawPoint) {
      const angle = target.getTotalAngle();
      if (angle % 90 !== 0) return;
    }

    const contraryMap =
      options.getContraryMap?.(target) ?? getContraryMap(target);

    const point = pointMap[corner];
    const diagonalPoint = contraryMap[corner];
    const uniformIsToggled = e.e[canvas.uniScaleKey];
    let isUniform =
      (canvas.uniformScaling && !uniformIsToggled) ||
      (!canvas.uniformScaling && uniformIsToggled);

    if (onlyDrawPoint) isUniform = false;

    const list = [];
    for (const object of objects) list.push(...getCaCheMapValue(object));

    const props = {
      target,
      point,
      diagonalPoint,
      corner,
      list,
      isScale,
      isUniform,
    };

    const vLines = collectVerticalPoint(props);
    const hLines = collectHorizontalPoint(props);
    vLines.forEach((o) => {
      verticalLines.add(JSON.stringify(o));
    });
    hLines.forEach((o) => {
      horizontalLines.add(JSON.stringify(o));
    });
  }

  function beforeRender() {
    canvas.clearContext(canvas.contextTop);
  }

  function afterRender() {
    if (onlyDrawPoint) {
      const list = [];
      if (!options.closeVLine) {
        for (const v of verticalLines) list.push(JSON.parse(v));
      }
      if (!options.closeHLine) {
        for (const h of horizontalLines) list.push(JSON.parse(h));
      }
      drawPointList(canvas, list);
    } else {
      if (!options.closeVLine) {
        for (const v of verticalLines) drawVerticalLine(canvas, JSON.parse(v));
      }
      if (!options.closeHLine) {
        for (const h of horizontalLines) {
          drawHorizontalLine(canvas, JSON.parse(h));
        }
      }
    }
  }

  function mouseUp() {
    verticalLines.clear();
    horizontalLines.clear();
    cacheMap.clear();
    canvas.requestRenderAll();
  }

  canvas.on("object:resizing", scalingOrResizing);
  canvas.on("object:scaling", scalingOrResizing);
  canvas.on("object:moving", moving);
  canvas.on("before:render", beforeRender);
  canvas.on("after:render", afterRender);
  canvas.on("mouse:up", mouseUp);

  return () => {
    canvas.off("object:resizing", scalingOrResizing);
    canvas.off("object:scaling", scalingOrResizing);
    canvas.off("object:moving", moving);
    canvas.off("before:render", beforeRender);
    canvas.off("after:render", afterRender);
    canvas.off("mouse:up", mouseUp);
  };
}
