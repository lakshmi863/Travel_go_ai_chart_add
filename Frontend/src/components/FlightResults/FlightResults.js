import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MdArrowForward, 
  MdSearchOff,
  MdWbSunny, 
  MdNightlightRound, 
  MdWbTwilight,
  MdNavigateBefore,
  MdNavigateNext,
  MdFlight
} from 'react-icons/md';
import './FlightResults.css';
// IMPORTANT: Using the dual-instance axios helper we created
import { djangoApi } from '../../api/axiosInstance';

const FlightResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Airline logos mapping
  const airlineLogos = {
    "Air India": "https://akm-img-a-in.tosshub.com/sites/dailyo//resources/202308/blob110823105252.png",
    "AirAsia": "https://upload.wikimedia.org/wikipedia/commons/f/f5/AirAsia_New_Logo.svg",
    "Malaysia Airlines": "https://logowik.com/content/uploads/images/malaysia-airlines4644.jpg",
    "IndiGO": "https://inflightfeed.com/wp-content/uploads/2012/03/6E_IndiGo_India_Dec2022_v3.png",
    "Air India Express": "https://dmlib.airindia.com/adobe/assets/urn:aaid:aem:e2e57ae2-cdea-46af-9a1f-2fc1649b504f/as/AirIndiaExpress.png",
    "Emirates": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/1200px-Emirates_logo.svg.png",
    "flydubai": "https://economymiddleeast.com/wp-content/uploads/2023/11/flydubai-1.jpeg",
    "SpiceJet": "https://s28477.pcdn.co/wp-content/uploads/2020/07/Spicejet_2.jpg",
    "Akasa Air": "https://a.storyblok.com/f/159922/3000x1688/fd58f43a36/rp_image.webp",
    "Etihad Airways": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Etihad_Airways_Logo.svg/2560px-Etihad_Airways_Logo.svg.png"
  };

  const searchParams = useMemo(() => location.state || {}, [location.state]);
  const [allFlights, setAllFlights] = useState([]); 
  const [filteredFlights, setFilteredFlights] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [maxPrice, setMaxPrice] = useState(100000); 
  const [selectedAirlines, setSelectedAirlines] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // 1. FETCH DATA FROM LOCAL DJANGO
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);

    // Use the djangoApi instance (handles baseURL and JWT automatically)
    djangoApi.get('/api/flights/')
      .then((res) => {
        // DRF usually returns data in res.data
        const data = res.data;
        console.log("Local API Data Received:", data); 

        setAllFlights(data); 

        // Handle initial filtering from the Search Bar (Hero.js)
        const sFrom = (searchParams.from || "").toLowerCase().trim();
        const sTo = (searchParams.to || "").toLowerCase().trim();

        if (!sFrom && !sTo) {
          setFilteredFlights(data);
        } else {
          const initialResults = data.filter((f) => 
            (f.origin || "").toLowerCase().includes(sFrom) &&
            (f.destination || "").toLowerCase().includes(sTo)
          );
          setFilteredFlights(initialResults);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message || "Could not connect to Django backend. Is it running?");
        setLoading(false);
      });
  }, [searchParams]);

  // 2. CLIENT-SIDE FILTERING LOGIC
  useEffect(() => {
    if (allFlights.length === 0) return;

    let results = [...allFlights];

    // Search Filter
    const fromQuery = (searchParams?.from || "").trim().toLowerCase();
    const toQuery = (searchParams?.to || "").trim().toLowerCase();

    if (fromQuery) {
        results = results.filter(f => (f.origin || "").toLowerCase().includes(fromQuery));
    }
    if (toQuery) {
        results = results.filter(f => (f.destination || "").toLowerCase().includes(toQuery));
    }

    // Price Filter
    results = results.filter(f => parseFloat(f.price) <= maxPrice);

    // Airline Filter
    if (selectedAirlines.length > 0) {
      results = results.filter(f => selectedAirlines.includes(f.airline));
    }

    setFilteredFlights(results);
    setCurrentPage(1); // Reset to page 1 on new filter
  }, [allFlights, searchParams, maxPrice, selectedAirlines]);

  // 3. PAGINATION CALCULATIONS
  const totalPages = Math.ceil(filteredFlights.length / itemsPerPage);
  const indexOfLastFlight = currentPage * itemsPerPage;
  const indexOfFirstFlight = indexOfLastFlight - itemsPerPage;
  const currentFlights = filteredFlights.slice(indexOfFirstFlight, indexOfLastFlight);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. MOCK SCHEDULE GENERATOR
  const getFlightSchedule = (id) => {
    const schedules = [
      { dep: "06:15", arr: "08:00", dur: "01 h 45 m", stops: "Non stop", code: "6E-201" },
      { dep: "09:40", arr: "11:30", dur: "01 h 50 m", stops: "Non stop", code: "AI-504" },
      { dep: "12:00", arr: "14:15", dur: "02 h 15 m", stops: "1 Stop", code: "SG-821" },
      { dep: "16:00", arr: "17:45", dur: "01 h 45 m", stops: "Non stop", code: "9I-518" },
      { dep: "19:20", arr: "21:10", dur: "01 h 50 m", stops: "Non stop", code: "UK-981" },
      { dep: "22:45", arr: "00:30", dur: "01 h 45 m", stops: "Non stop", code: "QP-112" },
    ];
    // Use the ID to consistently return the same mock schedule for the same flight
    const index = Math.abs(id) % schedules.length;
    return schedules[index];
  };

  // 5. SIDEBAR AIRLINE STATISTICS
  const airlineStats = useMemo(() => {
    const counts = {};
    allFlights.forEach(f => {
      counts[f.airline] = (counts[f.airline] || 0) + 1;
    });
    return Object.keys(counts);
  }, [allFlights]);

  const toggleAirline = (airline) => {
    setSelectedAirlines(prev => 
      prev.includes(airline) ? prev.filter(a => a !== airline) : [...prev, airline]
    );
  };

  return (
    <div className="results-page-wrapper">
      <div className="container main-layout">
        
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3>Max Price: ₹ {Number(maxPrice).toLocaleString('en-IN')}</h3>
            <input 
                type="range" min="1000" max="100000" step="500"
                value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                className="price-slider"
            />
            <div className="price-range-labels">
              <span>₹ 1k</span>
              <span>₹ 1L</span>
            </div>
          </div>

          <div className="filter-section">
            <h3>Departure Time</h3>
            <div className="time-slots">
              <div className="time-box"><MdWbTwilight size={18}/><span>Morning</span></div>
              <div className="time-box"><MdWbSunny size={18}/><span>Afternoon</span></div>
              <div className="time-box"><MdNightlightRound size={18}/><span>Evening</span></div>
            </div>
          </div>

          <div className="filter-section">
            <h3>Airlines</h3>
            {airlineStats.map(airline => (
              <div className="filter-item" key={airline}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={selectedAirlines.includes(airline)}
                    onChange={() => toggleAirline(airline)} 
                  /> 
                   <img src={airlineLogos[airline]} alt="" style={{width: '18px', height: '18px', objectFit: 'contain', marginLeft: '5px'}} />
                  {airline}
                </label>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT: FLIGHT LIST */}
        <main className="results-main-content">
          
          {/* ERROR STATE */}
          {error && (
            <div className="no-data">
              <MdSearchOff size={60} />
              <p>{error}</p>
              <button className="modify-btn" onClick={() => window.location.reload()}>Retry Connection</button>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="loader">
              <div className="spinner"></div>
              <p>Searching for the best flights...</p>
            </div>
          )}

          {/* RESULTS CONTENT */}
          {!loading && !error && (
            <>
              <div className="results-top-bar">
                <h2>
                  {searchParams.from || "Anywhere"} 
                  <MdArrowForward style={{margin: '0 10px'}} /> 
                  {searchParams.to || "Anywhere"}
                </h2>
                <p style={{fontSize:'12px', color: '#666'}}>{filteredFlights.length} Flights Found</p>
                <button onClick={() => navigate('/')} className="modify-btn">Modify Search</button>
              </div>

              <div className="flight-list">
                {currentFlights.map(flight => { 
                  const schedule = getFlightSchedule(flight.id);
                  return (
                    <div key={flight.id} className="flight-card">
                      {/* Col 1: Airline */}
                      <div className="airline-col">
                        <div className="logo-container">
                            <img 
                                src={airlineLogos[flight.airline] || "https://vaabrowse.virginatlantic.com/content/dam/flying-club/tailfins/INDIGO_700x600.jpg"} 
                                alt={flight.airline} 
                                className="air-logo" 
                            />
                        </div>
                        <div className="air-info">
                          <h3 className="air-name">{flight.airline}</h3>
                          <span className="air-code">{schedule.code}</span>
                        </div>
                      </div>

                      {/* Col 2: Departure */}
                      <div className="time-col">
                        <div className="time-bold">{schedule.dep}</div>
                        <div className="city-name">{flight.origin}</div>
                      </div>

                      {/* Col 3: Duration & Path */}
                      <div className="duration-col">
                        <span className="duration-label">{schedule.dur}</span>
                        <div className="path-container">
                            <div className="teal-indicator"></div>
                        </div>
                        <span className="stops-label">{schedule.stops}</span>
                      </div>

                      {/* Col 4: Arrival */}
                      <div className="time-col">
                        <div className="time-bold">{schedule.arr}</div>
                        <div className="city-name">{flight.destination}</div>
                      </div>

                      {/* Col 5: Price & Action */}
                      <div className="price-col">
                        <div className="price-box">
                          <span className="currency-symbol">₹</span>
                          <span className="price-val">{Number(flight.price).toLocaleString('en-IN')}</span>
                        </div>
                        <span className="per-adult">/adult</span>
                        
                        <button 
                          className="book-now-btn" 
                          onClick={() => navigate('/booking', { state: { flight, schedule } })}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* EMPTY RESULTS STATE */}
                {!loading && filteredFlights.length === 0 && (
                    <div className="no-data">
                        <MdSearchOff size={60} />
                        <p>No flights found matching your criteria.</p>
                        <button className="modify-btn" onClick={() => {setMaxPrice(100000); setSelectedAirlines([])}}>Clear All Filters</button>
                    </div>
                )}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="page-nav-btn"
                  >
                    <MdNavigateBefore size={24} />
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`page-num-btn ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="page-nav-btn"
                  >
                    <MdNavigateNext size={24} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default FlightResults;