import axios from 'axios';

const apiKey = 'YOUR_YELP_API_KEY';
const baseUrl = 'https://api.yelp.com/v3';

const yelpClient = axios.create({
  baseURL: baseUrl,
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

export const searchRestaurants = async (term, location) => {
  try {
    const response = await yelpClient.get('/businesses/search', {
      params: {
        term,
        location,
      },
    });
    return response.data.businesses;
  } catch (error) {
    console.error('Error fetching data from Yelp API:', error);
    throw error;
  }
};

export const getRestaurantDetails = async (id) => {
  try {
    const response = await yelpClient.get(`/businesses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data from Yelp API:', error);
    throw error;
  }
};