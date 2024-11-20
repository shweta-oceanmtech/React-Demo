import { Canvas, FabricObject, Rect, Textbox } from "fabric";
import { useEffect, useRef } from "react";
import { initAligningGuidelines } from "./components/aligning_guidelines";

function App() {
  const ref = useRef(null);
  const canvasRef = useRef();
  useEffect(() => {
    if (!ref.current) return;
    canvasRef.current = new Canvas(ref.current, { width: 800, height: 500 });
    initAligningGuidelines(canvasRef.current, {
      getObjectsByTarget: (target) => {
        const set = new Set();
        const objects = target.canvas?.getObjects() ?? [];
        for (const obj of objects) {
          if (target == obj) continue;
          if (obj.get("isGridLine")) {
            continue;
          }
          set.add(obj);
        }
        return set;
      },
    });
    return () => {
      canvasRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    for (let i = 0; i < 10; i++) {
      const rect = new Rect({
        left: rnd(300),
        top: rnd(300),
        width: rnd(10, 100),
        height: rnd(10, 100),
        fill:
          "#" +
          rnd(256 ** 3)
            .toString(16)
            .padStart(5, "0"),
      });
      if (i < 5) {
        rect.set("isGridLine", true);
        rect.set("fill", "red");
      }
      canvas.add(rect);
    }

    const textbox = new Textbox("Hello Fabric.js", {
      left: 100,
      top: 200,
      width: 300,
      height: 50,
      fill: "blue",
      fontSize: 20,
      editable: true,
    });
    canvas.add(textbox);

    canvas.renderAll();
  }, []);

  return (
    <>
      <p>
        The red rectangle represents the graphics that ignore the reference
        lines.
      </p>
      <canvas ref={ref}></canvas>
    </>
  );
}

export default App;
function rnd(m, n) {
  if (n == undefined) {
    n = m;
    m = 0;
  }
  return ((Math.random() * (n - m)) | 0) + m;
}
