import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const App = () => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [isHandMode, setIsHandMode] = useState(false);
    const [isMoveMode, setIsMoveMode] = useState(false);

    useEffect(() => {
        const canvasInstance = new fabric.Canvas(canvasRef.current, {
            selection: true,
        });
        fabric.Object.prototype.transparentCorners = false;

        setCanvas(canvasInstance);

        const handleKeyDown = (e) => {
            if (e.key === 'v' || e.key === 'V') {
                enableMoveTool(canvasInstance);
            } else if (e.key === 'h' || e.key === 'H') {
                enableHandTool(canvasInstance);
            } else if (e.key === 't' || e.key === 'T') {
                addText(canvasInstance);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            canvasInstance.dispose();
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const addText = (canvasInstance) => {
        const text = new fabric.Textbox('Your text here', {
            left: 50,
            top: 50,
            width: 200,
            fontSize: 20,
            editable: true,
        });
        canvasInstance.add(text);
        canvasInstance.setActiveObject(text);
        canvasInstance.renderAll()
    };

    const enableMoveTool = (canvasInstance) => {
        setIsHandMode(false);
        setIsMoveMode(true);
        canvasInstance.isDrawingMode = false;
        canvasInstance.selection = true;
        canvasInstance.forEachObject((obj) => {
            obj.selectable = true;
            obj.lockMovementX = false;
            obj.lockMovementY = false;
            obj.editable = true;
        });
        canvasInstance.off('mouse:down');
        canvasInstance.off('mouse:move');
        canvasInstance.off('mouse:up');
        canvasInstance.renderAll();
    };

    const enableHandTool = (canvasInstance) => {
        setIsHandMode(true);
        setIsMoveMode(false);
        canvasInstance.selection = false;

        // Lock movement for all objects when in hand mode
        canvasInstance.forEachObject((obj) => {
            obj.selectable = false;
            obj.lockMovementX = true;
            obj.lockMovementY = true;
            obj.editable = false;
        });

        let isDragging = false;
        let lastPosX = 0;
        let lastPosY = 0;

        // Mouse down handler for starting the drag
        canvasInstance.on('mouse:down', (opt) => {
            const evt = opt.e;
            if (isHandMode) {
                isDragging = true;
                canvasInstance.selection = false;
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;
            }
        });

        // Mouse move handler for dragging
        canvasInstance.on('mouse:move', (opt) => {
            if (isDragging) {
                const e = opt.e;
                const vpt = canvasInstance.viewportTransform || [1, 0, 0, 1, 0, 0];
                vpt[4] += e.clientX - lastPosX;
                vpt[5] += e.clientY - lastPosY;
                canvasInstance.setViewportTransform(vpt);
                lastPosX = e.clientX;
                lastPosY = e.clientY;
            }
        });

        // Mouse up handler for ending the drag
        canvasInstance.on('mouse:up', () => {
            isDragging = false;
            canvasInstance.selection = true;
        });
    };

    return (
        <div>
            <h2>Add Text to the Canvas</h2>
            <p>Press 'V' for Move Tool, 'H' for Hand Tool, 'T' to add text.</p>

            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => enableMoveTool(canvas)} title="Move Tool (V)">
                    Move Tool (V)
                </button>
                <button onClick={() => enableHandTool(canvas)} title="Hand Tool (H)">
                    Hand Tool (H)
                </button>
            </div>

            <div id="canvas-area" style={{ border: '1px solid black', width: "800px", height: "600px", position: "relative", overflow: "hidden" }}>
                <canvas ref={canvasRef} id="c" width="800" height="600" style={{ border: '1px solid black' }} />
            </div>
            <p>Press 'T' to add text to the canvas.</p>
        </div>
    );
};

export default App;
