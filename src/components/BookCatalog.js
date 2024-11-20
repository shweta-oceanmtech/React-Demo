import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import './App.css';

const BookCatalog = () => {
  const leftPageRef = useRef(null);
  const rightPageRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping] = useState(false);

  const catalogPages = [
    {
      left: [
        { type: 'image', src: 'https://via.placeholder.com/150', x: 50, y: 50, width: 150, height: 150 },
        { type: 'text', text: 'Product 1', x: 50, y: 220, fontSize: 24, fill: '#333' },
      ],
      right: [
        { type: 'image', src: 'https://via.placeholder.com/150', x: 50, y: 50, width: 150, height: 150 },
        { type: 'text', text: 'Product 2', x: 50, y: 220, fontSize: 24, fill: '#333' },
      ],
    },
    {
      left: [
        { type: 'image', src: 'https://via.placeholder.com/150', x: 50, y: 50, width: 150, height: 150 },
        { type: 'text', text: 'Product 3', x: 50, y: 220, fontSize: 24, fill: '#333' },
      ],
      right: [
        { type: 'image', src: 'https://via.placeholder.com/150', x: 50, y: 50, width: 150, height: 150 },
        { type: 'text', text: 'Product 4', x: 50, y: 220, fontSize: 24, fill: '#333' },
      ],
    },
    {
        left: [
          { type: 'image', src: 'https://via.placeholder.com/150', x: 50, y: 50, width: 150, height: 150 },
          { type: 'text', text: 'Product 5', x: 50, y: 220, fontSize: 24, fill: '#333' },
        ],
        right: [
          { type: 'image', src: 'https://via.placeholder.com/150', x: 50, y: 50, width: 150, height: 150 },
          { type: 'text', text: 'Product 6', x: 50, y: 220, fontSize: 24, fill: '#333' },
        ],
      },
    // More pages can be added here...
  ];

  const loadPage = (page, canvasRef, isLeft) => {
    const canvas = new fabric.Canvas(canvasRef.current);
    canvas.setHeight(600);
    canvas.setWidth(400);
    canvas.clear();

    const pageContent = isLeft ? catalogPages[page].left : catalogPages[page].right;
    pageContent.forEach(item => {
      if (item.type === 'image') {
        fabric.Image.fromURL(item.src, (img) => {
          img.set({
            left: item.x,
            top: item.y,
            scaleX: item.width / img.width,
            scaleY: item.height / img.height,
          });
          canvas.add(img);
        });
      } else if (item.type === 'text') {
        const text = new fabric.Text(item.text, {
          left: item.x,
          top: item.y,
          fontSize: item.fontSize,
          fill: item.fill,
        });
        canvas.add(text);
      }
    });
  };

  useEffect(() => {
    loadPage(currentPage, leftPageRef, true);
    loadPage(currentPage, rightPageRef, false);
  }, [currentPage]);

  // Function to handle page flipping animation
  const handlePageFlip = (direction) => {
    if (flipping || (direction === 'next' && currentPage === catalogPages.length - 1) || 
        (direction === 'prev' && currentPage === 0)) {
      return;  // Prevent multiple flips and out of bounds
    }

    setFlipping(true);
    const book = document.querySelector('.book');
    book.classList.add(direction === 'next' ? 'flip-next' : 'flip-prev');

    setTimeout(() => {
      setCurrentPage(prevPage => direction === 'next' ? prevPage + 1 : prevPage - 1);
      book.classList.remove('flip-next', 'flip-prev');
      setFlipping(false);
    }, 600);  // Match the animation duration
  };

  return (
    <div className="book-container">
      <h2>Stylish Book Catalog with Real Page Flip</h2>

      <div className="book">
        <div className="book-page left">
          <canvas ref={leftPageRef} />
        </div>
        <div className="book-page right">
          <canvas ref={rightPageRef} />
        </div>
      </div>

      <div className="book-nav">
        <button onClick={() => handlePageFlip('prev')} disabled={currentPage === 0 || flipping}>
          Previous Page
        </button>
        <button onClick={() => handlePageFlip('next')} disabled={currentPage === catalogPages.length - 1 || flipping}>
          Next Page
        </button>
      </div>
    </div>
  );
};

export default BookCatalog;
