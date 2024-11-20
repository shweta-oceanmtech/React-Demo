import React, { useState } from 'react';
import { Document, Page, Image, Link, View, pdf, Text } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import '../App.css';

const PDFDemo = () => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [url, setUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);

  const addElement = (type, options) => {
    const newElement = { id: Date.now(), type, ...options };
    setElements([...elements, newElement]);
  };

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  const handleAddLink = () => {
    if (selectedElement && url) {
      const updatedElements = elements.map((el) =>
        el.id === selectedElement.id ? { ...el, link: url, openInNewTab } : el
      );
      setElements(updatedElements);
      setUrl('');
      setOpenInNewTab(false);
    }
  };
 
  const exportPDF = async () => {
    const MyDocument = (
      <Document>
        <Page size={[500, 800]}>
          <View style={{ position: 'relative', width: 500, height: 800, backgroundColor: '#fff' }}>
            {elements.map((element) => {
              if (element.type === 'text') {
                return (
                  <Text key={element.id} style={{ position: 'absolute', left: element.left, top: element.top, fontSize: element.fontSize }}>
                    {element.text}
                  </Text>
                );
              } else if (element.type === 'rect') {
                return (
                  <View key={element.id} style={{ position: 'absolute', left: element.left, top: element.top, width: element.width, height: element.height, backgroundColor: element.fill }} />
                );
              } else if (element.type === 'image') {
                return (
                  <Image key={element.id} src={element.src} style={{ position: 'absolute', left: element.left, top: element.top, width: element.width, height: element.height }} />
                );
              }
              return null;
            })}
          </View>
        </Page>
      </Document>
    );

    const asPdf = pdf();
    asPdf.updateContainer(MyDocument);
    const blob = await asPdf.toBlob();
    saveAs(blob, 'design.pdf');
  };

  return (
    <div className="App">
      <div className="sidebar">
        <h2>Tools</h2>
        <button onClick={() => addElement('text', { text: 'Type your text', left: 50, top: 50, fontSize: 20 })}>Add Text</button>
        <button onClick={() => addElement('rect', { left: 150, top: 150, width: 100, height: 50, fill: 'red' })}>Add Rectangle</button>
        <button onClick={() => addElement('image', { src: 'https://img.icons8.com/ios-filled/50/000000/home.png', left: 50, top: 200, width: 50, height: 50 })}>Add Icon</button>
        <button onClick={exportPDF}>Export PDF</button>
        {selectedElement && (
          <div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL"
            />
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                />
                Open in new tab
              </label>
            </div>
            <button onClick={handleAddLink}>Add Link</button>
          </div>
        )}
      </div>
      <div className="canvas-container" style={{ position: 'relative', width: 500, height: 800, backgroundColor: '#fff', border: '1px solid #000' }}>
        {elements.map((element) => {
          if (element.type === 'text') {
            return (
              <div key={element.id} style={{ position: 'absolute', left: element.left, top: element.top, fontSize: element.fontSize }} onClick={() => handleElementClick(element)}>
                {element.text}
              </div>
            );
          } else if (element.type === 'rect') {
            return (
              <div key={element.id} style={{ position: 'absolute', left: element.left, top: element.top, width: element.width, height: element.height, backgroundColor: element.fill }} onClick={() => handleElementClick(element)} />
            );
          } else if (element.type === 'image') {
            return (
              <img key={element.id} src={element.src} alt="" style={{ position: 'absolute', left: element.left, top: element.top, width: element.width, height: element.height }} onClick={() => handleElementClick(element)} />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default PDFDemo;
