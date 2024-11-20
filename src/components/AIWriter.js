import React, { useState } from 'react';

const fetchImages = async (query, perPage = 100) => {
  const response = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=${perPage}`, {
    headers: {
      'Authorization': 'UdeQUXrTv5jfyPcDtkcTf2OnyojjjTrrZHFQ60lckkbr16YjjVlb4w4M'
    }
  });
  const data = await response.json();
  return data.photos.map(photo => photo.src.original);
};

function AIWriter() {
  const [prompt, setPrompt] = useState('');
  const [imageUrls, setImageUrls] = useState([]);

  const handleFetchImages = async () => {
    const urls = await fetchImages(prompt);
    setImageUrls(urls);
  };

  return (
    <div>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt"
      />
      <button onClick={handleFetchImages}>Fetch Images</button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {imageUrls.map((url, index) => (
          <img key={index} src={url} width={300} height={300} alt={`Generated from prompt ${index}`} />
        ))}
      </div>
    </div>
  );
}

export default AIWriter;
