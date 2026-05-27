import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    MdEventSeat, MdPerson, MdEmail, MdPhone, MdFormatQuote, 
    MdSecurity, MdFlight, MdCheckCircle, MdAutorenew, MdClose, MdInfo
} from 'react-icons/md';
// IMPORT THE CORRECT INSTANCE
import { djangoApi } from '../../api/axiosInstance'; 
import './Booking.css';

// Config: Airplane Layout
const ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];
const TAKEN_SEATS = ['1A', '2C', '4F', '7B', '9E', '10C', '5B']; 

const Booking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Safety check for state passed from Flights page
    const { flight, schedule } = location.state || {};

    const [selectedSeat, setSelectedSeat] = useState(null);
    const [locationInfo, setLocationInfo] = useState("Direct Connection");
    const [formData, setFormData] = useState({ 
        name: '', 
        email: localStorage.getItem('userEmail') || '', 
        phone: '' 
    });
    
    // Modal & Loading Configuration
    const [alertConfig, setAlertConfig] = useState({ 
        show: false, 
        type: '', 
        title: '', 
        message: '', 
        id: '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Track Device Fingerprint for security vault
        let devId = localStorage.getItem('travelgo_dev_id') || 'TG-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        localStorage.setItem('travelgo_dev_id', devId);

        // Detect Location safely
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => setLocationInfo(`${data.city || 'Remote'}, ${data.country_name || 'Terminal'}`))
            .catch(() => setLocationInfo("Cloud Gateway"));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * THE FIX: Using djangoApi instead of hardcoded fetch
     */
    const handleLocalBooking = async (e) => {
        e.preventDefault();
        
        if (!selectedSeat) {
            setAlertConfig({ 
                show: true, 
                type: 'error', 
                title: 'Seat Selection Required', 
                message: 'Please tap a preferred seat on the airplane cabin map.' 
            });
            return;
        }

        setIsSubmitting(true);
        
        // Step 1: Show Processing Card
        setAlertConfig({ 
            show: true, 
            type: 'process', 
            title: 'Finalising Square', 
            message: 'Generating unique Local Reference and syncing with SQLite vault...' 
        });

        const payload = {
            flight: flight?.id,
            passenger_name: formData.name,
            passenger_email: formData.email,
            passenger_phone: formData.phone,
            seat_number: selectedSeat,
            total_price: flight?.price,
            booking_location: locationInfo,
            flight_departure_datetime: new Date(Date.now() + 172800000).toISOString(), 
            device_id: localStorage.getItem('travelgo_dev_id')
        };

        try {
            // STEP 2: Use the djangoApi instance
            // This automatically uses http://localhost:8000 (from your .env)
            const response = await djangoApi.post('/api/bookings/', payload);
            
            // Axios puts the actual response data in .data
            const result = response.data;

            // SUCCESS: Update Card to show Success Shield
            setAlertConfig({ 
                show: true, 
                type: 'success', 
                title: 'Ticket Confirmed!', 
                message: `Success! Seat ${selectedSeat} is squared. A digital boarding pass has been generated.`, 
                id: result.transaction_id 
            });
            
            // Keep the card visible for 3 seconds before dashboard redirect
            setTimeout(() => navigate('/my-bookings'), 3000);

        } catch (error) {
            console.error("Booking Error:", error);

            // Axios errors store the server response in error.response
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
            
            setAlertConfig({ 
                show: true, 
                type: 'error', 
                title: 'System Exception', 
                message: errorMessage.includes('Failed to fetch') 
                    ? "Connection timed out. Ensure your Django server is running on localhost:8000." 
                    : errorMessage
            });
            setIsSubmitting(false);
        }
    };

    const SeatMap = useMemo(() => {
        return ROWS.map(row => (
            <div key={row} className="seat-row">
                <span className="row-number">{row}</span>
                {COLS.map((col) => {
                    const seatId = `${row}${col}`;
                    const isTaken = TAKEN_SEATS.includes(seatId);
                    const isSelected = selectedSeat === seatId;
                    return (
                        <div
                            key={col}
                            className={`seat ${isTaken ? 'taken' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => !isTaken && setSelectedSeat(seatId)}
                        >
                            <MdEventSeat />
                            <span className="seat-label">{seatId}</span>
                        </div>
                    );
                })}
            </div>
        ));
    }, [selectedSeat]);

    if (!flight) return (
        <div className="loader" style={{paddingTop: '200px', textAlign: 'center'}}>
            <MdInfo size={50} color="#003580" />
            <h2>Session Mismatch</h2>
            <p>Please select a flight from the results page first.</p>
            <button className="modify-btn" onClick={() => navigate('/flights')} style={{marginTop: '20px'}}>Back to Search</button>
        </div>
    );

    return (
        <div className="booking-page">
            <div className="container booking-grid">
                
                {/* PRODUCTION MODAL */}
                {alertConfig.show && (
                    <div className="custom-overlay">
                        <div className={`status-card ${alertConfig.type}`}>
                            <div className="card-icon-header">
                                {alertConfig.type === 'process' && <MdAutorenew className="ani-spin" />}
                                {alertConfig.type === 'success' && <MdCheckCircle />}
                                {alertConfig.type === 'error' && <MdClose />}
                            </div>
                            <h3>{alertConfig.title}</h3>
                            <p>{alertConfig.message}</p>
                            
                            {alertConfig.id && <div className="ref-tag">VAULT-REF: {alertConfig.id}</div>}
                            
                            {alertConfig.type === 'success' && (
                                <div className="auto-redirect-msg">Generating digital assets...</div>
                            )}

                            {alertConfig.type === 'error' && (
                                <button className="modal-dismiss-btn" onClick={() => setAlertConfig({ ...alertConfig, show: false })}>
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* LEFT SIDE: SEAT SELECTOR */}
                <div className="seat-selection-container">
                    <div className="flight-promo-banner" style={{backgroundImage: `url("https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800")`}}>
                        <div className="banner-overlay"></div>
                        <div className="quotation-box">
                            <MdFormatQuote className="quote-icon" size={32} />
                            <p>Adventure awaits in <span>{flight.destination}</span>. Your comfort is our priority.</p>
                        </div>
                    </div>
                    <div className="airplane-cabin"><div className="cockpit">COCKPIT</div><div className="cabin-rows">{SeatMap}</div></div>
                </div>

                {/* RIGHT SIDE: SUMMARY & TICKET FORM */}
                <div className="booking-form-container">
                    <div className="summary-box">
                        <div className="air-pill">{flight.airline} Official</div>
                        <p style={{fontSize: '13px', margin: '15px 0'}}>
                            <MdFlight /> Flight: <strong>{schedule?.code || "TG-702"}</strong> | {flight.origin} → {flight.destination}
                        </p>
                        <div className="sum-price">
                            <span>Final Bill:</span>
                            <strong>₹{Number(flight.price).toLocaleString('en-IN')}</strong>
                        </div>
                        <div className={`seat-badge ${selectedSeat ? 'active' : ''}`}>
                            {selectedSeat ? `CONFIRMED SEAT: ${selectedSeat}` : "PLEASE CLICK A SEAT"}
                        </div>
                    </div>

                    <form className="passenger-form" onSubmit={handleLocalBooking}>
                        <h3>Traveller Information</h3>
                        <div className="form-group">
                            <label><MdPerson /> Full Name (As per Govt ID)</label>
                            <input type="text" name="name" onChange={handleInputChange} placeholder="Passenger Name" required />
                        </div>
                        <div className="form-group">
                            <label><MdEmail /> Contact Email</label>
                            <input type="email" name="email" value={formData.email} readOnly style={{backgroundColor: '#f8fafc', color: '#94a3b8'}} />
                        </div>
                        <div className="form-group">
                            <label><MdPhone /> Phone Number</label>
                            <input type="tel" name="phone" onChange={handleInputChange} placeholder="10 Digits" required />
                        </div>
                        
                        <div className="security-notice" style={{marginBottom: '20px', fontSize: '11px', color: '#64748b'}}>
                            <MdSecurity /> Request squared at {locationInfo}. 256-bit SSL protection active.
                        </div>

                        <button type="submit" disabled={isSubmitting || !selectedSeat} className="payment-btn">
                            {isSubmitting ? "SQUARING DATA..." : `Confirm Seat & Book`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Booking;