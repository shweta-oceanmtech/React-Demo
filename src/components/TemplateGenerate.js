import React, { useEffect, useState } from 'react';
import * as fabric from 'fabric';

const TemplateGenerate = () => {
    const [canvas, setCanvas] = useState(null);
    const [canvasData, setCanvasData] = useState([]);

    useEffect(() => {
        const canvasElement = new fabric.Canvas('canvas1', {
            height: 800,
            width: 500,
        });
        setCanvas(canvasElement);
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch('http://localhost:5000/template-generate');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Fetched data:', data);
            setCanvasData(data);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    useEffect(() => {
        if (canvas && canvasData.length > 0) {
            canvas.clear();
            canvasData.forEach((item) => {
                console.log('Rendering item:', item);
                switch (item.type) {
                    case 'rect':
                        canvas.add(new fabric.Rect({
                            left: item.left || 0,
                            top: item.top || 0,
                            width: item.width || 100,
                            height: item.height || 100,
                            fill: item.fill || 'transparent',
                            stroke: item.borderColor || 'black',
                            strokeWidth: item.strokeWidth || 1
                        }));
                        break;
                    case 'text':
                        canvas.add(new fabric.Text(item.text || '', {
                            left: item.left || 0,
                            top: item.top || 0,
                            fontSize: item.fontSize || 20,
                            textAlign: item.textAlign || 'left',
                            fill: item.color || 'black'
                        }));
                        break;
                    case 'image':
                        if (item.src) {
                            fabric.Image.fromURL(item.src, (img) => {
                                img.set({
                                    left: item.left || 0,
                                    top: item.top || 0,
                                    width: item.width || 100,
                                    height: item.height || 100
                                });
                                img.on('error', (e) => {
                                    console.error('Error loading image:', e);
                                });
                                canvas.add(img);
                            }, {
                                crossOrigin: 'anonymous' // Handle CORS if needed
                            });
                        } else {
                            console.warn('Image source is missing:', item);
                        }
                        break;
                    default:
                        console.warn(`Unknown type: ${item.type}`);
                }
            });
            canvas.renderAll();
        }
    }, [canvas, canvasData]);

    return (
        <div>
            <canvas id="canvas1" width="500" height="800" style={{ border: '1px solid #ccc' }} />
        </div>
    );
};

export default TemplateGenerate;



import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import './App.css';

const App = () => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [selectedRect, setSelectedRect] = useState(null);
    const [url, setUrl] = useState('');

    useEffect(() => {
        const initCanvas = new fabric.Canvas('canvas', {
            height: 800,
            width: 500,
            backgroundColor: '#fff',
        });
        setCanvas(initCanvas);

        // Handle object selection
        initCanvas.on('mouse:down', (options) => {
            if (options.target) {
                setSelectedRect(options.target);
            } else {
                setSelectedRect(null);
            }
        });

        const handleObjectMoveOrModify = (options) => {
            const obj = options.target;
            if (obj) {
                console.log('obj')
                updateGuidelines(initCanvas, obj);
            }
        };

        // Draw alignment lines when object is moving or modified
        initCanvas.on('object:moving', handleObjectMoveOrModify);
        initCanvas.on('object:modified', handleObjectMoveOrModify);

        // Clean up guidelines when object is released or modified
        initCanvas.on('mouse:up', () => {
            removeGuidelines(initCanvas);
        });

        return () => {
            initCanvas.dispose();
        };
    }, []);

    const addElement = (type, options) => {
        let element;
        if (type === 'text') {
            element = new fabric.Textbox(options.text, {
                left: options.left,
                top: options.top,
                width: options.width,
                fontSize: options.fontSize,
            });
        } else if (type === 'rect') {
            element = new fabric.Rect({
                left: options.left,
                top: options.top,
                width: options.width,
                height: options.height,
                fill: options.fill,
            });
        } else if (type === 'image') {
            fabric.Image.fromURL(options.src, (img) => {
                img.set({
                    left: options.left,
                    top: options.top,
                    scaleX: options.scaleX,
                    scaleY: options.scaleY,
                });
                canvas.add(img);
                canvas.renderAll();
            });
            return;
        }
        canvas.add(element);
        canvas.renderAll();
    };

    const updateGuidelines = (canvas, movingObj) => {
        removeGuidelines(canvas);

        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const movingLeft = movingObj.left;
        const movingTop = movingObj.top;
        const movingRight = movingLeft + movingObj.width * movingObj.scaleX;
        const movingBottom = movingTop + movingObj.height * movingObj.scaleY;
        const threshold = 5;
        const guidelines = [];

        // Center lines
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        // Draw center lines if the object is close to the middle
        if (Math.abs(centerX - (movingLeft + (movingObj.width * movingObj.scaleX) / 2)) < threshold) {
            guidelines.push(new fabric.Line([centerX, 0, centerX, canvasHeight], {
                stroke: 'red',
                strokeWidth: 1,
                selectable: false,
                evented: false,
                name: 'guideline'
            }));
        }

        if (Math.abs(centerY - (movingTop + (movingObj.height * movingObj.scaleY) / 2)) < threshold) {
            guidelines.push(new fabric.Line([0, centerY, canvasWidth, centerY], {
                stroke: 'red',
                strokeWidth: 1,
                selectable: false,
                evented: false,
                name: 'guideline'
            }));
        }

        // Iterate over all objects on the canvas
        canvas.getObjects().forEach(obj => {
            if (obj === movingObj) return; // Skip the moving object

            const objLeft = obj.left;
            const objTop = obj.top;
            const objRight = objLeft + obj.width * obj.scaleX;
            const objBottom = objTop + obj.height * obj.scaleY;

            // Check for alignment with other objects
            if (Math.abs(movingLeft - objLeft) < threshold) {
                guidelines.push(new fabric.Line([objLeft, 0, objLeft, canvasHeight], {
                    stroke: 'blue',
                    strokeWidth: 1,
                    selectable: false,
                    evented: false,
                    name: 'guideline'
                }));
            }

            if (Math.abs(movingRight - objRight) < threshold) {
                guidelines.push(new fabric.Line([objRight, 0, objRight, canvasHeight], {
                    stroke: 'blue',
                    strokeWidth: 1,
                    selectable: false,
                    evented: false,
                    name: 'guideline'
                }));
            }

            if (Math.abs(movingTop - objTop) < threshold) {
                guidelines.push(new fabric.Line([0, objTop, canvasWidth, objTop], {
                    stroke: 'blue',
                    strokeWidth: 1,
                    selectable: false,
                    evented: false,
                    name: 'guideline'
                }));
            }

            if (Math.abs(movingBottom - objBottom) < threshold) {
                guidelines.push(new fabric.Line([0, objBottom, canvasWidth, objBottom], {
                    stroke: 'blue',
                    strokeWidth: 1,
                    selectable: false,
                    evented: false,
                    name: 'guideline'
                }));
            }
        });

        // Add new guidelines
        guidelines.forEach(line => canvas.add(line));

        canvas.renderAll();
    };

    const removeGuidelines = (canvas) => {
        canvas.getObjects('line').forEach(line => {
            if (line.name === 'guideline') {
                canvas.remove(line);
            }
        });
        canvas.renderAll();
    };

    const handleAddLink = () => {
        if (selectedRect && url) {
            selectedRect.set('link', url);
            setUrl('');
        }
    };

    return (
        <>
            <div className="App">
                <div className="sidebar">
                    <h2>Tools</h2>
                    <button onClick={() => addElement('text', { text: 'Type your text', left: 50, top: 50, width: 200, fontSize: 20 })}>Add Text</button>
                    <button onClick={() => addElement('rect', { left: 150, top: 150, width: 100, height: 50, fill: 'red' })}>Add Rectangle</button>
                    {selectedRect && (
                        <div>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter URL"
                            />
                            <button onClick={handleAddLink}>Add Link</button>
                        </div>
                    )}
                </div>
                <div className="canvas-container">
                    <canvas id="canvas" ref={canvasRef} />
                </div>
            </div>
        </>
    );
};

