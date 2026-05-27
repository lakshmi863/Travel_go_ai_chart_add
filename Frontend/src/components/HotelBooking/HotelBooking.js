import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdPerson, MdEmail, MdPhone, MdCreditCard, MdCheckCircle, MdError, MdArrowBack } from 'react-icons/md';
import './HotelBooking.css';

const HotelBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Receive hotel data from the previous page
    const hotel = location.state?.hotel;

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    const [status, setStatus] = useState('idle'); // idle | processing | success | error
    const [errorMsg, setErrorMsg] = useState('');

    // If no hotel was passed via state, redirect back to hotels list
    useEffect(() => {
        if (!hotel) {
            navigate('/hotels');
        }
    }, [hotel, navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('processing');

        // Simulating a real API call to your Backend
        setTimeout(() => {
            // For demonstration, we assume it's always successful
            // In production, you would use fetch('YOUR_API/api/hotel-booking', ...)
            setStatus('success');
        }, 2500);
    };

    if (!hotel) return null;

    return (
        <div className="hotel-booking-page">
            <div className="booking-container">
                
                {/* --- BACK BUTTON --- */}
                <button className="back-to-list" onClick={() => navigate('/hotels')}>
                    <MdArrowBack /> Back to Hotels
                </button>

                <div className="booking-grid">
                    
                    {/* --- LEFT SIDE: HOTEL SUMMARY --- */}
                    <div className="hotel-summary-card">
                        <div className="summary-header">
                            <h2>Booking Summary</h2>
                            <p>Please review your details</p>
                        </div>

                        <div className="hotel-info-box">
                            <img src={hotel.images?.[0] || 'https://via.placeholder.com/400x250'} alt={hotel.hotelName} />
                            <div className="info-text">
                                <h3>{hotel.hotelName}</h3>
                                <p>📍 {hotel.city}</p>
                            </div>
                        </div>

                        <div className="price-breakdown">
                            <div className="price-row">
                                <span>Base Price</span>
                                <span>₹{Number(hotel.pricePerNight).toLocaleString()}</span>
                            </div>
                            <div className="price-row">
                                <span>Taxes & Fees</span>
                                <span>₹{Math.floor(hotel.pricePerNight * 0.12)}</span>
                            </div>
                            <hr />
                            <div className="price-row total">
                                <span>Total Amount</span>
                                <span>₹{(Number(hotel.pricePerNight) * 1.12).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="booking-perks">
                            <div className="perk"><MdCheckCircle /> Free Cancellation</div>
                            <div className="perk"><MdCheckCircle /> Instant Confirmation</div>
                        </div>
                    </div>

                    {/* --- RIGHT SIDE: FORMS --- */}
                    <div className="booking-form-section">
                        
                        {status === 'idle' && (
                            <form className="main-form" onSubmit={handleSubmit}>
                                {/* Guest Details */}
                                <div className="form-group-card">
                                    <h4><MdPerson /> Guest Information</h4>
                                    <div className="input-grid">
                                        <div className="input-field">
                                            <label>Full Name</label>
                                            <input type="text" name="fullName" required onChange={handleInputChange} placeholder="John Doe" />
                                        </div>
                                        <div className="input-field">
                                            <label>Email Address</label>
                                            <input type="email" name="email" required onChange={handleInputChange} placeholder="john@example.com" />
                                        </div>
                                        <div className="input-field">
                                            <label>Phone Number</label>
                                            <input type="tel" name="phone" required onChange={handleInputChange} placeholder="+91 98765 43210" />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="form-group-card">
                                    <h4><MdCreditCard /> Payment Details</h4>
                                    <div className="input-field">
                                        <label>Name on Card</label>
                                        <input type="text" name="cardName" required onChange={handleInputChange} />
                                    </div>
                                    <div className="input-field">
                                        <label>Card Number</label>
                                        <input type="text" name="cardNumber" required onChange={handleInputChange} placeholder="xxxx xxxx xxxx xxxx" />
                                    </div>
                                    <div className="input-row">
                                        <div className="input-field">
                                            <label>Expiry (MM/YY)</label>
                                            <input type="text" name="expiry" required onChange={handleInputChange} placeholder="12/28" />
                                        </div>
                                        <div className="input-field">
                                            <label>CVV</label>
                                            <input type="password" name="cvv" required onChange={handleInputChange} placeholder="***" />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="submit-booking-btn">
                                    {status === 'processing' ? 'Processing...' : 'Confirm & Pay Now'}
                                </button>
                            </form>
                        )}

                        {/* Status Overlays */}
                        {status === 'processing' && (
                            <div className="status-overlay">
                                <div className="spinner"></div>
                                <p>Securing your reservation...</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="status-card success">
                                <MdCheckCircle size={60} />
                                <h2>Booking Confirmed!</h2>
                                <p>Your stay at <strong>{hotel.hotelName}</strong> is secured. A confirmation email has been sent to {formData.email}.</p>
                                <button className="btn-secondary" onClick={() => navigate('/my-bookings')}>Go to My Bookings</button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="status-card error">
                                <MdError size={60} />
                                <h2>Payment Failed</h2>
                                <p>{errorMsg}</p>
                                <button className="btn-secondary" onClick={() => setStatus('idle')}>Try Again</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelBooking;