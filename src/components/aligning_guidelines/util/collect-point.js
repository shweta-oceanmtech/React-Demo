import { aligningLineConfig } from "../constant";
import { getDistanceList } from "./basic";

const originMap = {
  tl: ["right", "bottom"],
  tr: ["left", "bottom"],
  br: ["left", "top"],
  bl: ["right", "top"],
  mt: ["center", "bottom"],
  mr: ["left", "center"],
  mb: ["center", "top"],
  ml: ["right", "center"],
};

export function collectVerticalPoint(props) {
  const { target, isScale, isUniform, corner, point, diagonalPoint, list } =
    props;
  const { dis, arr } = getDistanceList(point, list, "x");
  const margin = aligningLineConfig.margin / (target.canvas?.getZoom() ?? 1);
  if (dis > margin) return [];
  let v = arr[arr.length - 1].x - point.x;

  const dirX = corner.includes("l") ? -1 : 1;
  v *= dirX;

  const { width, height, scaleX, scaleY } = target;
  const dStrokeWidth = target.strokeUniform ? 0 : target.strokeWidth;
  const scaleWidth = scaleX * width + dStrokeWidth;
  const sx = (v + scaleWidth) / scaleWidth;
  if (isScale) {
    target.set("scaleX", scaleX * sx);
    if (isUniform) target.set("scaleY", scaleY * sx);
  } else {
    target.set("width", width * sx);
    if (isUniform) target.set("height", height * sx);
  }
  const originArr = aligningLineConfig.contraryOriginMap ?? originMap;
  target.setRelativeXY(diagonalPoint, ...originArr[corner]);
  target.setCoords();
  return arr.map((target) => ({ origin: point, target }));
}

export function collectHorizontalPoint(props) {
  const { target, isScale, isUniform, corner, point, diagonalPoint, list } =
    props;
  const { dis, arr } = getDistanceList(point, list, "y");
  const margin = aligningLineConfig.margin / (target.canvas?.getZoom() ?? 1);
  if (dis > margin) return [];
  let v = arr[arr.length - 1].y - point.y;

  const dirY = corner.includes("t") ? -1 : 1;
  v *= dirY;

  const { width, height, scaleX, scaleY } = target;
  const dStrokeWidth = target.strokeUniform ? 0 : target.strokeWidth;
  const scaleHeight = scaleY * height + dStrokeWidth;
  const sy = (v + scaleHeight) / scaleHeight;
  if (isScale) {
    target.set("scaleY", scaleY * sy);
    if (isUniform) target.set("scaleX", scaleX * sy);
  } else {
    target.set("height", height * sy);
    if (isUniform) target.set("width", width * sy);
  }
  const originArr = aligningLineConfig.contraryOriginMap ?? originMap;
  target.setRelativeXY(diagonalPoint, ...originArr[corner]);
  target.setCoords();
  return arr.map((target) => ({ origin: point, target }));
}
