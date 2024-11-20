import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BusinessPost = () => {
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([
    'nature', 'business', 'technology', 'people', 'health', 'food', 'travel', 'fashion', 'sports', 'animals'
  ]); // Add more categories as needed
  const [categoryImages, setCategoryImages] = useState({});

  const unsplashUrl = 'https://api.unsplash.com/search/photos';
  const clientId = 'EiUgL9Ui3059paQ2RSW5wOYEnJ_P0DsvY8N0srZXTmM'; // Replace with your access key

  useEffect(() => {
    const fetchCategoryImages = async () => {
      const promises = categories.map(async (category) => {
        const response = await axios.get(unsplashUrl, {
          params: {
            query: category,
            client_id: clientId,
            per_page: 10, // Number of images per category
          },
        });
        return { category, images: response.data.results };
      });

      const results = await Promise.all(promises);
      const imagesByCategory = results.reduce((acc, { category, images }) => {
        acc[category] = images;
        return acc;
      }, {});
      setCategoryImages(imagesByCategory);
    };

    fetchCategoryImages();
  }, [categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(unsplashUrl, {
        params: {
          query: searchTerm,
          client_id: clientId,
        },
      });
      setImages(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for images..."
        />
        <button type="submit">Search</button>
      </form>

      {images.length > 0 && (
        <div className="image-grid">
          {images.map((image) => (
            <img key={image.id} src={image.urls.small} alt={image.alt_description} />
          ))}
        </div>
      )}

      {images.length === 0 &&
        categories.map((category) => (
          <div key={category}>
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            <div className="image-grid">
              {categoryImages[category] &&
                categoryImages[category].map((image) => (
                  <img key={image.id} src={image.urls.small} alt={image.alt_description} />
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default BusinessPost;
