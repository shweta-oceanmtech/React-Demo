import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Document, Page, Image, Link, View, pdf, Text } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import './App.css';
// import PDFDemo from './components/PDFDemo';

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

    initCanvas.on('mouse:down', (options) => {
      if (options.target) {
        setSelectedRect(options.target);
      } else {
        setSelectedRect(null);
      }
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
  };

  // const addLinkableRect = () => {
  //   const rect = new fabric.Rect({
  //     left: 100,
  //     top: 650,
  //     width: 300,
  //     height: 50,
  //     fill: 'blue',
  //   });
  //   canvas.add(rect);
  // };

  const handleAddLink = () => {
    if (selectedRect && url) {
      selectedRect.set('link', url);
      setUrl('');
    }
  };

  const exportImage = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({ format: 'png' });
      const areas = canvas.getObjects().map((obj) => {
        if (obj.link) {
          return {
            link: obj.link,
            left: obj.left,
            top: obj.top,
            width: obj.width * obj.scaleX,
            height: obj.height * obj.scaleY,
          };
        }
        return null;
      }).filter(Boolean);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body, html {
              height: 100%;
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: gray;
            }
            .container {
              position: relative;
              width: 500px;
              height: 800px;
              background-color: white;
            }
            .clickable-area {
              position : "absolute";
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${dataURL}" alt="Design" style="width: 100%; height: 100%;" />
            ${areas.map(area => `
              <a
                href="${area.link}"
                target="_blank"
                class="clickable-area"
                style="
                  left: ${area.left}px;
                  top: ${area.top}px;
                  width: ${area.width}px;
                  height: ${area.height}px;
                "
              ></a>
            `).join('')}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'design.html';
      link.click();
      URL.revokeObjectURL(url);
    }
  };
  const [newTabLink, setNewTabLink] = useState(null);
  const exportPDF = async () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({ format: 'png' });
      const areas = canvas.getObjects().map((obj) => {
        if (obj.link) {
          return {
            link: obj.link,
            openInNewTab: obj.openInNewTab,
            left: obj.left,
            top: obj.top,
            width: obj.width * obj.scaleX,
            height: obj.height * obj.scaleY,
          };
        }
        return null;
      }).filter(Boolean);
      console.log("areas", areas);
      const MyDocument = (
        <Document>
          <Page wrap={false} size={[500, 800]}>
            <View wrap={false} style={{ position: 'relative', width: 500, height: 800 }}>
              <Image src={dataURL} style={{ width: 500, height: 800 }} />
              <Text>shwtea</Text>
              {areas.map((area, index) => (
                <Link
                  key={index}
                  href={area.link}
                  style={{
                    position: 'absolute',
                    left: area.left,
                    top: area.top,
                    width: area.width,
                    height: area.height,
                    textDecoration: 'underline', // Add underline for visual cue
                    cursor: 'pointer', // Change cursor to hand on hover (optional)
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <View style={{
                    position: 'absolute',
                    left: area.left,
                    top: area.top,
                    width: area.width,
                    height: area.height,
                  }}></View>
                </Link>
              ))}
            </View>
          </Page>
        </Document>
      );

      const asPdf = pdf();
      asPdf.updateContainer(MyDocument);
      const blob = await asPdf.toBlob();
      saveAs(blob, 'design.pdf');
    }
  };


  return (
    <>
      {/* <PDFDemo /> */}
      <div className="App">
        <div className="sidebar">
          <h2>Tools</h2>
          <button onClick={() => addElement('text', { text: 'Type your text', left: 50, top: 50, width: 200, fontSize: 20 })}>Add Text</button>
          <button onClick={() => addElement('rect', { left: 150, top: 150, width: 100, height: 50, fill: 'red' })}>Add Rectangle</button>
          <button onClick={exportImage}>Export File</button>
          <button onClick={exportPDF}>Export PDF</button>
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

export default App;
