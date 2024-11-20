import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

// Import images
import dummyImage from "./assets/dummy-image.png";

const App = () => {
    const canvasRef = useRef(null);
    const dropAreaRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [isHandMode, setIsHandMode] = useState(false); // Track if hand mode is active

    useEffect(() => {
        // Initialize fabric canvas
        const canvasInstance = new fabric.Canvas(canvasRef.current, {
            selection: true,
        });
        fabric.Object.prototype.transparentCorners = false;

        // Create shapes with initial dummy images
        const shapes = [
            new fabric.Rect({
                width: 200,
                height: 200,
                left: 10,
                top: 300,
                fill: 'rgba(0,0,0,0)', // Transparent background initially
                stroke: '#000',
                strokeWidth: 2,
                hasControls: true,
            }),
            new fabric.Circle({
                radius: 100,
                left: 300,
                top: 300,
                fill: 'rgba(0,0,0,0)', // Transparent background initially
                stroke: '#000',
                strokeWidth: 2,
                hasControls: true,
            }),
            new fabric.Triangle({
                width: 200,
                height: 200,
                left: 300,
                top: 100,
                fill: 'rgba(0,0,0,0)', // Transparent background initially 
                stroke: '#000',
                strokeWidth: 2,
                hasControls: true,
            }),
        ];

        shapes.forEach(shape => {
            canvasInstance.add(shape);
            loadPattern(dummyImage, shape, canvasInstance);
        });

        setCanvas(canvasInstance);

        // Set up drag and drop events on the div element
        const dropArea = dropAreaRef.current;
        dropArea.addEventListener('dragover', handleDragOver);
        dropArea.addEventListener('drop', (e) => handleDrop(e, canvasInstance));

        // Handle keydown events for switching tools
        const handleKeyDown = (e) => {
            if (e.key === 'v' || e.key === 'V') {
                enableMoveTool(canvasInstance);
            } else if (e.key === 'h' || e.key === 'H') {
                enableHandTool(canvasInstance);
            }
        };

        // Attach event listeners for keyboard input
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup function
        return () => {
            canvasInstance.dispose();
            dropArea.removeEventListener('dragover', handleDragOver);
            dropArea.removeEventListener('drop', (e) => handleDrop(e, canvasInstance));
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault(); // Allow drop
    };

    const handleDrop = (e, canvasInstance) => {
        e.preventDefault(); // Prevent the default action of opening the image in a new tab

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgSrc = event.target.result;

                // Get the drop coordinates relative to the canvas
                const rect = dropAreaRef.current.getBoundingClientRect();
                const dropX = e.clientX - rect.left;
                const dropY = e.clientY - rect.top;

                // Find the shape where the image was dropped
                const targetShape = canvasInstance.getObjects().find((obj) => {
                    const bound = obj.getBoundingRect();
                    return dropX >= bound.left && dropX <= bound.left + bound.width &&
                           dropY >= bound.top && dropY <= bound.top + bound.height;
                });

                // If a shape is found, apply the image to it
                if (targetShape) {
                    loadPattern(imgSrc, targetShape, canvasInstance);
                }
            };
            reader.readAsDataURL(file); // Read the uploaded image as a data URL
        }
    };

    const loadPattern = (url, shape, canvasInstance) => {
        fabric.util.loadImage(url, (img) => {
            if (canvasInstance && shape) {
                // Remove the existing image if any
                shape.set('fill', 'rgba(0,0,0,0)');

                // Get the dimensions of the shape
                const shapeWidth = shape.width * shape.scaleX;
                const shapeHeight = shape.height * shape.scaleY;

                // Calculate the scaling for the pattern to fully cover the shape
                const imgWidth = img.width;
                const imgHeight = img.height;

                const scaleX = shapeWidth / imgWidth;
                const scaleY = shapeHeight / imgHeight;

                // Create a pattern with scaling and center the image
                const pattern = new fabric.Pattern({
                    source: img,
                    repeat: 'no-repeat',
                    offsetX: 0,
                    offsetY: 0,
                    patternTransform: [scaleX, 0, 0, scaleY, 0, 0] // Apply scaling to fill the shape
                });

                shape.set('fill', pattern); // Fill the shape with the image pattern
                shape.setCoords(); // Update the shape's coordinates
                canvasInstance.renderAll(); // Re-render the canvas
            }
        });
    };

    const enableMoveTool = (canvasInstance) => {
        setIsHandMode(false); // Disable hand mode
        canvasInstance.isDrawingMode = false; // Disable drawing/panning
        canvasInstance.selection = true; // Re-enable object selection
        canvasInstance.forEachObject((obj) => {
            obj.selectable = true; // Enable selection of all objects
        });
        canvasInstance.off('mouse:down'); // Remove hand tool events
        canvasInstance.off('mouse:move');
        canvasInstance.off('mouse:up');
        canvasInstance.renderAll();
    };

    const enableHandTool = (canvasInstance) => {
        setIsHandMode(true); // Enable hand mode
        canvasInstance.selection = false; // Disable object selection
        canvasInstance.forEachObject((obj) => {
            obj.selectable = false; // Disable selection of all objects
        });

        // Enable canvas panning (dragging)
        canvasInstance.on('mouse:down', (opt) => {
            canvasInstance.isDragging = true;
            canvasInstance.selection = false; // Ensure selection is disabled while dragging
            canvasInstance.lastPosX = opt.e.clientX;
            canvasInstance.lastPosY = opt.e.clientY;
        });

        canvasInstance.on('mouse:move', (opt) => {
            if (canvasInstance.isDragging) {
                const e = opt.e;
                const vpt = canvasInstance.viewportTransform || [1, 0, 0, 1, 0, 0]; // Ensure viewportTransform is defined
                vpt[4] += e.clientX - canvasInstance.lastPosX; // Update X-axis
                vpt[5] += e.clientY - canvasInstance.lastPosY; // Update Y-axis
                canvasInstance.setViewportTransform(vpt); // Apply new viewport transformation
                canvasInstance.lastPosX = e.clientX;
                canvasInstance.lastPosY = e.clientY;
            }
        });

        canvasInstance.on('mouse:up', () => {
            canvasInstance.isDragging = false;
            canvasInstance.selection = false; // Keep selection disabled during hand mode
        });
    };

    // Toggle between move and hand tool via buttons
    const toggleMoveTool = () => {
        if (canvas) enableMoveTool(canvas);
    };

    const toggleHandTool = () => {
        if (canvas) enableHandTool(canvas);
    };

    return (
        <div>
            <h2>Drag and Drop an Image into a Shape</h2>
            <p>Press 'V' for Move Tool (edit shapes), 'H' for Hand Tool (move canvas)</p>

            {/* Toolbar with icons for move and hand tool */}
            <div style={{ marginBottom: '10px' }}>
                <button onClick={toggleMoveTool} title="Move Tool (V)">
                    Move Tool (V)
                </button>
                <button onClick={toggleHandTool} title="Hand Tool (H)">
                    Hand Tool (H)
                </button>
            </div>

            {/* Add a div to handle drag and drop */}
            <div id="canvas-area" style={{ width: "800px", height: "600px", position: "relative", overflow: "hidden" }}>
                <div
                    id="drop-area"
                    ref={dropAreaRef}
                    style={{ width: '800px', height: '600px', border: '1px solid black', position: 'relative' }}
                >
                    <canvas ref={canvasRef} id="c" width="800" height="600" style={{ position: 'absolute', left: 0, top: 0 }} />
                </div>
            </div>
            <p>Drag an image file and drop it into one of the shapes.</p>
        </div>
    );
};

export default App;
