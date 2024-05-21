import React, { useState, useEffect } from 'react';

const Explore = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [selectedCuisine, setSelectedCuisine] = useState("");
    const [uniqueCuisines, setUniqueCuisines] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const response = await fetch(`/api/explore`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setFilteredRestaurants(data);

            const cuisines = [...new Set(data.map(restaurant => restaurant.cuisine))];
            setUniqueCuisines(cuisines);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleCuisineChange = (event) => {
        setSelectedCuisine(event.target.value);
    };

    const handlePriceRangeChange = (priceRange) => {
        setSelectedPriceRange((prev) => {
            return prev.includes(priceRange)
                ? prev.filter((p) => p !== priceRange)
                : [...prev, priceRange];
        });
    };

    const handleRatingChange = (rating) => {
        setSelectedRatings((prev) => {
            return prev.includes(rating)
                ? prev.filter((r) => r !== rating)
                : [...prev, rating];
        });
    };

    const applyFilters = async () => {
        try {
            const queryParams = new URLSearchParams({
                searchQuery,
                selectedCuisine,
                selectedPriceRange: selectedPriceRange.join(','),
                selectedRatings: selectedRatings.join(','),
            });

            const response = await fetch(`/api/explore?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setFilteredRestaurants(data);
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [selectedCuisine, selectedPriceRange, selectedRatings, searchQuery]);

    const handleClearFilters = () => {
        setSelectedCuisine("");
        setSelectedPriceRange([]);
        setSelectedRatings([]);
        setSearchQuery("");
        fetchRestaurants();
    };

    return (
        <div className="search" style={{ paddingTop: "20px" }}>
            <header className="main-header">
                <h2>Search Restaurants</h2>
            </header>
            <div className="filter-search">
                <div className="filter-form">
                    <button className="clear-filters-btn" onClick={handleClearFilters}>
                        Clear Filters
                    </button>
                    <div className="cuisine-filter p-3">
                        <h6 className="filter-title">Filter by Cuisine</h6>
                        <select
                            value={selectedCuisine}
                            onChange={handleCuisineChange}
                            className="form-control"
                        >
                            <option value="">All Cuisines</option>
                            {uniqueCuisines.map((cuisine) => (
                                <option key={cuisine} value={cuisine}>
                                    {cuisine}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="price-range-filter p-2 mx-2 border-top">
                        <h6>Filter by Price Range</h6>
                        {["$", "$$", "$$$"].map((priceRange) => (
                            <div key={priceRange}>
                                <input
                                    type="checkbox"
                                    id={`price-range-${priceRange}`}
                                    checked={selectedPriceRange.includes(priceRange)}
                                    onChange={() => handlePriceRangeChange(priceRange)}
                                />
                                <label htmlFor={`price-range-${priceRange}`}>{priceRange}</label>
                            </div>
                        ))}
                    </div>
                    <div className="rating-filter p-2 mx-2 border-top">
                        <h6>Filter by Rating</h6>
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <div key={rating}>
                                <input
                                    type="checkbox"
                                    id={`rating-${rating}`}
                                    checked={selectedRatings.includes(rating)}
                                    onChange={() => handleRatingChange(rating)}
                                />
                                <label htmlFor={`rating-${rating}`}>{rating} Stars</label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="search-results-container">
                <div className="matched-restaurants">
                    {filteredRestaurants.length > 0 ? (
                        filteredRestaurants.map((restaurant) => (
                            <div key={restaurant.yelp_google_id} className="restaurant">
                                <h3>{restaurant.name}</h3>
                                <p>{restaurant.address}</p>
                                <p>{restaurant.cuisine}</p>
                                <p>{restaurant.price_range}</p>
                                <p>{restaurant.rating} Stars</p>
                            </div>
                        ))
                    ) : (
                        <div className="no-results-message">
                            <p>No results found.</p>
                            <p>Try adjusting filters or search term.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Explore;
