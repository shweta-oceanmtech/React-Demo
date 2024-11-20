import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const StylishTextCanvas = () => {
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);  // Ref to store the fabric canvas instance
    const [selectedText, setSelectedText] = useState(null);
    const [textDataState, setTextData] = useState([]);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            backgroundColor: '#f5f5f5',
        });

        fabricCanvasRef.current = canvas;  // Store the canvas instance in the ref

        // Handle text selection
        canvas.on('object:selected', (e) => {
            const selectedObject = e.target;
            if (selectedObject && selectedObject.type === 'text') {
                setSelectedText(selectedObject);
            }
        });

        return () => {
            canvas.dispose();
        };
    }, []);

    const handleTextClick = (textItem) => {
        const { text, fontSize, fontFamily, fontWeight, fill, shadow, angle } = textItem;
        const canvas = fabricCanvasRef.current;  // Access the Fabric canvas instance

        const fabricText = new fabric.Textbox(text, {
            left: Math.random() * 600,  // Randomized position
            top: Math.random() * 400,   // Randomized position
            fontSize,
            fontFamily,
            fontWeight,
            fill,
            shadow,
            angle,
            editable: true,  // Make text editable
        });

        canvas.add(fabricText);
        setSelectedText(fabricText); // Automatically select the text
        canvas.renderAll(); // Ensure the canvas is updated
    };

    const updateText = (e) => {
        if (selectedText) {
            selectedText.text = e.target.value;
            selectedText.canvas.renderAll();
        }
    };

    useEffect(() => {
        const fetchStylishText = async () => {
            try {
                const response = await fetch('http://localhost:5000/template-generate');
                const textData = await response.json();
                setTextData(textData);
            } catch (error) {
                console.error('Error fetching stylish text:', error);
            }
        };

        fetchStylishText();
    }, []);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <canvas ref={canvasRef} style={{ marginRight: '20px' }} />

            <div>
                <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
                    {(textDataState || []).map((item, key) => (
                        <li key={key} onClick={() => handleTextClick(item)} style={{ cursor: 'pointer', marginBottom: '10px' }}>
                            <span style={{ color: item.fill, fontFamily: item.fontFamily, fontSize: item.fontSize, textShadow: item.shadow }}>
                                {item.text}
                            </span>
                        </li>
                    ))}
                </ul>

                {selectedText && (
                    <div style={{ marginTop: '20px' }}>
                        <input
                            type="text"
                            value={selectedText.text}
                            onChange={updateText}
                            style={{ fontSize: '16px', padding: '5px' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StylishTextCanvas;
