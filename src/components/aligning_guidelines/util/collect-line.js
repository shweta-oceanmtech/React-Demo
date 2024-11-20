import { Point } from "fabric";
import { aligningLineConfig } from "../constant";
import { getDistanceList } from "./basic";

export function collectLine(target, points) {
  console.log("target",target)
  const list = target.getCoords();
  list.push(target.getCenterPoint());
  const margin = aligningLineConfig.margin / (target.canvas?.getZoom() ?? 1);
  const opts = { target, list, points, margin };
  const vLines = collectPoints({ ...opts, type: "x" });
  const hLines = collectPoints({ ...opts, type: "y" });

  return { vLines, hLines };
}

const originArr = [
  ["left", "top"],
  ["right", "top"],
  ["right", "bottom"],
  ["left", "bottom"],
  ["center", "center"],
];

function collectPoints(props) {
  const { target, list, points, margin, type } = props;
  const res = [];
  const arr = [];
  let min = Infinity;

  for (const item of list) {
    const o = getDistanceList(item, points, type);
    arr.push(o);
    if (min > o.dis) min = o.dis;
  }

  if (min > margin) return res;

  let b = false;
  for (let i = 0; i < list.length; i++) {
    if (arr[i].dis !== min) continue;
    for (const item of arr[i].arr) {
      res.push({ origin: list[i], target: item });
    }

    if (b) continue;
    b = true;
    const d = arr[i].arr[0][type] - list[i][type];

    // Modify the original data for alignment calculations.
    list.forEach((item) => {
      item[type] += d;
    });
    // console.log("target",target)
    // target?.setXY(list[i], ...originArr[i]);
    target?.setCoords();
  }

  return res;
}
