import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
    MdStar, MdLocationOn, MdWifi, MdPool, 
    MdFitnessCenter, MdRestaurant, MdFilterList, MdSearch, 
    MdArrowBack, MdMap, MdInfo, MdCheckCircle, MdPayment, 
    MdPerson, MdCancel, MdEmail, MdChevronLeft, MdChevronRight
} from 'react-icons/md';
import './Hotels.css';

// Replace this with your actual production backend URL
const API_BASE_URL = process.env.REACT_APP_NODE_URL || 'http://localhost:5000';

const Hotels = () => {
    const navigate = useNavigate(); 

    // --- 1. STATE MANAGEMENT ---
    const [viewStep, setViewStep] = useState('list'); // 'list' | 'details'
    const [viewingHotel, setViewingHotel] = useState(null);
    const [activeImgIndex, setActiveImgIndex] = useState(0);

    // Real Data States
    const [hotels, setHotels] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState(50000);

    // --- 2. FETCH DATA FROM BACKEND ---
    useEffect(() => {
        const fetchHotels = async () => {
    try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/hotels`);
        
        // 3. SPECIFIC CHECK FOR 503
        if (response.status === 503) {
            throw new Error("The server is currently waking up from sleep. Please wait 60 seconds and click 'Try Again'.");
        }

        if (!response.ok) {
            throw new Error(`Server responded with error: ${response.status}`);
        }

        const data = await response.json();
        setHotels(data.hotels || data);
        setLoading(false);
    } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message); // This will now show the "waking up" message
        setLoading(false);
    }
};

        fetchHotels();
    }, []);

    // --- 3. FILTERING LOGIC (Optimized with useMemo) ---
    const filteredHotels = useMemo(() => {
        return hotels.filter(hotel => {
            const matchesSearch = 
                hotel.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                hotel.city?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Important: Using pricePerNight to match your Backend Schema
            const matchesPrice = hotel.pricePerNight <= priceRange;
            
            return matchesSearch && matchesPrice;
        });
    }, [hotels, searchTerm, priceRange]);

    // --- 4. EVENT HANDLERS ---
    const handleViewDetails = (hotel) => {
        setViewingHotel(hotel);
        setActiveImgIndex(0);
        setViewStep('details');
        window.scrollTo(0, 0);
    };

    const handleBookNowClick = (hotel) => {
        // Navigates to the Booking page passing the hotel object via state
        navigate('/hotel-booking', { state: { hotel: hotel } });
    };

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        // Triggering a re-run of the useEffect logic
        window.location.reload(); 
    };

    // --- 5. RENDER: LOADING & ERROR STATES ---
    if (loading) {
        return (
            <div className="loader-container" style={{ textAlign: 'center', padding: '100px' }}>
                <div className="spinner"></div>
                <p>Fetching the best stays for you...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container" style={{ textAlign: 'center', padding: '100px' }}>
                <h2 style={{ color: '#ef4444' }}>Oops! Something went wrong.</h2>
                <p>{error}</p>
                <button onClick={handleRetry} className="modify-btn" style={{ marginTop: '20px' }}>
                    Try Again
                </button>
            </div>
        );
    }

    // --- 6. RENDER: LIST VIEW ---
    if (viewStep === 'list') return (
        <div className="hotels-page">
            <div className="container hotels-layout">
                {/* SIDEBAR FILTERS */}
                <aside className="hotels-filter-sidebar">
                    <div className="filter-header"><MdFilterList /> <h3>Refine Search</h3></div>
                    
                    <div className="filter-group">
                        <label>Search Hotel or City</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text" 
                                placeholder="e.g. Mumbai or Taj..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Max Price: ₹{priceRange.toLocaleString()}</label>
                        <input 
                            type="range" 
                            min="5000" 
                            max="50000" 
                            step="1000" 
                            value={priceRange} 
                            onChange={(e) => setPriceRange(Number(e.target.value))} 
                        />
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="hotels-display">
                    <div className="display-header">
                        <h2>Discover Stays</h2>
                        <p>{filteredHotels.length} Properties found</p>
                    </div>

                    <div className="hotel-grid">
                        {filteredHotels.map(hotel => (
                            <div key={hotel._id} className="hotel-card">
                                {/* Check if images exist, otherwise use placeholder */}
                                <img 
                                    src={hotel.images && hotel.images.length > 0 ? hotel.images[0] : 'https://via.placeholder.com/400x300?text=No+Image+Available'} 
                                    alt={hotel.hotelName} 
                                />
                                <div className="hotel-info">
                                    <div className="hotel-title-row">
                                        <h3>{hotel.hotelName}</h3>
                                        <span className="h-rating">{hotel.rating}★</span>
                                    </div>
                                    <p className="h-loc"><MdLocationOn /> {hotel.city}</p>
                                    <div className="h-price-row">
                                        <div className="h-price"><strong>₹{hotel.pricePerNight.toLocaleString()}</strong></div>
                                        <button className="h-book-btn" onClick={() => handleViewDetails(hotel)}>View Details</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredHotels.length === 0 && (
                        <div className="no-data" style={{ textAlign: 'center', padding: '50px' }}>
                            <MdSearch size={50} />
                            <p>No hotels found matching your filters. Try a higher price or different city.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );

    // --- 7. RENDER: DETAIL VIEW ---
    if (viewStep === 'details') return (
        <div className="hotel-detail-page container">
            <button className="back-btn" onClick={() => setViewStep('list')}><MdArrowBack /> Back to Results</button>
            
            <div className="detail-grid">
                {/* LEFT SIDE: GALLERY & INFO */}
                <div className="detail-main">
                    {/* IMAGE GALLERY */}
                    <div className="gallery-container">
                        <div className="main-img-wrapper">
                            <img 
                                src={viewingHotel.images && viewingHotel.images.length > 0 ? viewingHotel.images[activeImgIndex] : 'https://via.placeholder.com/800x450?text=No+Image'} 
                                alt="Hotel" 
                                className="detail-img-large" 
                            />
                            {/* Prev Button */}
                            <div className="gallery-nav left" onClick={() => setActiveImgIndex(prev => prev === 0 ? viewingHotel.images.length - 1 : prev - 1)}>
                                <MdChevronLeft size={30} />
                            </div>
                            {/* Next Button */}
                            <div className="gallery-nav right" onClick={() => setActiveImgIndex(prev => prev === viewingHotel.images.length - 1 ? 0 : prev + 1)}>
                                <MdChevronRight size={30} />
                            </div>
                        </div>
                        
                        {/* Thumbnails */}
                        {viewingHotel.images && viewingHotel.images.length > 1 && (
                            <div className="thumbnail-bar">
                                {viewingHotel.images.map((img, idx) => (
                                    <img 
                                        key={idx} 
                                        src={img} 
                                        className={`thumb ${activeImgIndex === idx ? 'active' : ''}`} 
                                        onClick={() => setActiveImgIndex(idx)} 
                                        alt={`thumb-${idx}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* TEXT DETAILS */}
                    <div className="detail-info-card">
                        <div className="info-header">
                            <h1>{viewingHotel.hotelName}</h1>
                            <span className="h-rating">{viewingHotel.rating} ★</span>
                        </div>
                        <p className="detail-address"><MdLocationOn /> {viewingHotel.fullAddress}, {viewingHotel.city}</p>
                        
                        <h3>About this property</h3>
                        <p className="detail-desc">{viewingHotel.description || "A beautiful property located in the heart of the city, offering world-class amenities and comfort."}</p>

                        <div className="amenities-list">
                            {viewingHotel.amenities && viewingHotel.amenities.map((a, index) => (
                                <span key={index} className="amenity-tag">{a}</span>
                            ))}
                        </div>
                    </div>

                    {/* GOOGLE MAP INTEGRATION */}
                    <div className="detail-map-card">
                        <h3><MdMap /> Location Map</h3>
                        <div className="map-container">
                            <iframe
                                title="hotel-map"
                                width="100%"
                                height="350"
                                frameBorder="0"
                                style={{ borderRadius: '12px', border: 'none' }}
                                src={`https://www.google.com/maps?q=${encodeURIComponent(viewingHotel.hotelName + " " + viewingHotel.fullAddress)}&output=embed`}
                            ></iframe>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: BOOKING WIDGET */}
                <div className="detail-sidebar">
                    <div className="booking-widget">
                        <div className="widget-price">
                            <h2>₹{viewingHotel.pricePerNight.toLocaleString()}</h2>
                            <span>per night</span>
                        </div>
                        <hr />
                        <ul className="widget-perks">
                            <li><MdCheckCircle /> Free Cancellation</li>
                            <li><MdCheckCircle /> Secure Payment</li>
                            <li><MdCheckCircle /> Instant Confirmation</li>
                        </ul>
                        
                        <button 
                            className="confirm-btn" 
                            onClick={() => handleBookNowClick(viewingHotel)}
                        >
                            Book This Stay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return null;
};

export default Hotels;