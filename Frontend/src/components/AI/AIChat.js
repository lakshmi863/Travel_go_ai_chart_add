import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    MdClose,
    MdSend,
    MdSmartToy,
    MdMic,
    MdStopCircle
} from 'react-icons/md';

import './AIChat.css';

// ======================================
// BACKEND URLS
// ======================================
const NODE_URL =
    process.env.REACT_APP_NODE_URL ||
    'http://localhost:5000';

const DJANGO_URL =
    process.env.REACT_APP_DJANGO_URL ||
    'http://127.0.0.1:8000';

const AIChat = () => {

    const navigate = useNavigate();

    // ======================================
    // STATES
    // ======================================
    const [isOpen, setIsOpen] = useState(false);

    const [messages, setMessages] = useState([]);

    const [input, setInput] = useState('');

    const [loading, setLoading] = useState(false);

    const [isListening, setIsListening] =
        useState(false);

    const chatBodyRef = useRef(null);

    // ======================================
    // SPEECH RECOGNITION
    // ======================================
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition = SpeechRecognition
        ? new SpeechRecognition()
        : null;

    const synth = window.speechSynthesis;

    // ======================================
    // INITIAL GREETING
    // ======================================
    const initialGreeting =
        'Hi! I am TravelGo AI. I can help with flights, hotels, bookings and travel planning!';

    useEffect(() => {

        if (isOpen && messages.length === 0) {

            setMessages([
                {
                    type: 'bot',
                    text: initialGreeting
                }
            ]);

        }

    }, [isOpen, messages.length]);

    // ======================================
    // AUTO SCROLL
    // ======================================
    useEffect(() => {

        if (chatBodyRef.current) {

            chatBodyRef.current.scrollTop =
                chatBodyRef.current.scrollHeight;

        }

    }, [messages, loading]);

    // ======================================
    // TEXT TO SPEECH
    // ======================================
    const speak = (text) => {

        if (synth.speaking) {
            synth.cancel();
        }

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.rate = 1;
        utterance.pitch = 1;

        synth.speak(utterance);
    };

    // ======================================
    // VOICE INPUT
    // ======================================
    const handleVoiceInput = () => {

        if (!recognition) {

            alert(
                'Speech recognition not supported.'
            );

            return;
        }

        if (isListening) {

            recognition.stop();

        } else {

            setIsListening(true);

            recognition.start();
        }
    };

    // ======================================
    // VOICE EVENTS
    // ======================================
    if (recognition) {

        recognition.onresult = (event) => {

            const transcript =
                event.results[0][0].transcript;

            setInput(transcript);

            setIsListening(false);

            handleSendWithText(transcript);
        };

        recognition.onerror = () => {

            setIsListening(false);

        };

        recognition.onend = () => {

            setIsListening(false);

        };
    }

    // ======================================
    // DETECT FLIGHT QUERY
    // ======================================
    const isFlightQuery = (text) => {

        const lower = text.toLowerCase();

        const flightKeywords = [
            'flight',
            'fly',
            'airport',
            'airline',
            'ticket',
            'boarding',
            'departure',
            'arrival'
        ];

        return flightKeywords.some((keyword) =>
            lower.includes(keyword)
        );
    };

    // ======================================
    // RENDER FLIGHT CARDS
    // ======================================
    const renderFlightCards = (flights) => {

        return (

            <div className="flight-card-container">

                {flights.map((flight, index) => (

                    <div
                        key={index}
                        className="flight-card"
                    >

                        <h3>
                            {flight.airline}
                        </h3>

                        <p>
                            ✈️ {flight.origin} →{' '}
                            {flight.destination}
                        </p>

                        <p>
                            💺 {flight.class_type ||
                                'Economy'}
                        </p>

                        <p>
                            💰 ₹{flight.price}
                        </p>

                        <button
                            className="book-btn"
                            onClick={() =>
                                navigate(
                                    '/flight-booking',
                                    {
                                        state: {
                                            flight
                                        }
                                    }
                                )
                            }
                        >
                            Book Flight
                        </button>

                    </div>

                ))}

            </div>

        );
    };

    // ======================================
    // RENDER HOTEL CARD
    // ======================================
    const renderHotelCard = (hotel) => {

        return (

            <div className="hotel-card">

                <h3>{hotel.name}</h3>

                <p>
                    📍 {hotel.location}
                </p>

                <p>
                    ⭐ {hotel.rating}
                </p>

                <p>
                    💰 ₹{hotel.price}
                </p>

                <p>
                    {hotel.description}
                </p>

                <button
                    className="book-btn"
                    onClick={() =>
                        navigate(
                            '/hotel-booking',
                            {
                                state: { hotel }
                            }
                        )
                    }
                >
                    Book Hotel
                </button>

            </div>

        );
    };

    // ======================================
    // MAIN SEND FUNCTION
    // ======================================
    const handleSendWithText = async (
        textToSubmit
    ) => {

        if (!textToSubmit.trim()) return;

        // ======================================
        // USER MESSAGE
        // ======================================
        const userMessage = {
            type: 'user',
            text: textToSubmit
        };

        // ======================================
        // REMOVE OLD CARDS
        // ======================================
        setMessages((prev) => [

            ...prev.filter(
                (msg) =>
                    msg.type !== 'flight_cards' &&
                    msg.type !== 'hotel_card'
            ),

            userMessage

        ]);

        setInput('');

        setLoading(true);

        try {

            const token =
                localStorage.getItem('token');

            // ======================================
            // FLIGHT REQUEST → DJANGO
            // ======================================
            if (isFlightQuery(textToSubmit)) {

                const response = await fetch(
                    `${DJANGO_URL}/api/chat/`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({
                            message:
                                textToSubmit
                        })
                    }
                );

                const data =
                    await response.json();

                console.log(
                    'Django Response:',
                    data
                );

                // ======================================
                // FIX JSON RESPONSE
                // ======================================
                let botReply =
                    data.reply ||
                    'No response received.';

                try {

                    const parsed =
                        JSON.parse(botReply);

                    if (parsed.reply) {

                        botReply =
                            parsed.reply;
                    }

                } catch (e) {}

                // ======================================
                // SHOW BOT MESSAGE
                // ======================================
                setMessages((prev) => [

                    ...prev,

                    {
                        type: 'bot',
                        text: botReply
                    }

                ]);

                speak(botReply);

                // ======================================
                // SHOW FLIGHT CARDS
                // ======================================
                if (
                    data.data_type ===
                        'flight_list' &&
                    data.data
                ) {

                    setMessages((prev) => [

                        ...prev,

                        {
                            type:
                                'flight_cards',

                            flights:
                                data.data
                        }

                    ]);
                }

            }

            // ======================================
            // HOTEL REQUEST → NODEJS
            // ======================================
            else {

                const response = await fetch(
                    `${NODE_URL}/api/ai/chat`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            userInput:
                                textToSubmit
                        })
                    }
                );

                const data =
                    await response.json();

                console.log(
                    'Node Response:',
                    data
                );

                let botReply =
                    data.reply ||
                    'No response received.';

                let parsedData = null;

                // ======================================
                // PARSE JSON RESPONSE
                // ======================================
                try {

                    parsedData =
                        JSON.parse(botReply);

                    if (
                        parsedData.reply
                    ) {

                        botReply =
                            parsedData.reply;
                    }

                } catch (e) {}

                // ======================================
                // SHOW BOT MESSAGE
                // ======================================
                setMessages((prev) => [

                    ...prev,

                    {
                        type: 'bot',
                        text: botReply
                    }

                ]);

                speak(botReply);

                // ======================================
                // SHOW HOTEL CARD
                // ======================================
                if (
    parsedData &&
    parsedData.recommendations &&
    parsedData.recommendations.length > 0
) {

    const hotel =
        parsedData
            .recommendations[0];

    setMessages((prev) => [

        ...prev,

        {
            type:
                'hotel_card',

            hotel: {
                name:
                    hotel.name,
                location:
                    hotel.location ||
                    'Hyderabad',
                rating:
                    hotel.rating ||
                    '4.5',
                price:
                    hotel.price ||
                    '5000',
                description:
                    hotel.reason ||
                    hotel.description ||
                    'Luxury hotel'
            }
        }

    ]);
}

            }

        } catch (error) {

            console.error(error);

            setMessages((prev) => [

                ...prev,

                {
                    type: 'bot',

                    text:
                        'Connection lost. Please try again.'
                }

            ]);

        } finally {

            setLoading(false);

        }
    };

    // ======================================
    // SEND BUTTON
    // ======================================
    const handleSend = () => {

        handleSendWithText(input);

    };

    // ======================================
    // UI
    // ======================================
    return (
        <>

            {!isOpen && (

                <div className="bot-container">

                    <span className="bot-tooltip">
                        Ask me about flights or hotels
                    </span>

                    <div
                        className="floating-bot-btn"
                        onClick={() =>
                            setIsOpen(true)
                        }
                    >
                        <MdSmartToy />
                    </div>

                </div>

            )}

            {isOpen && (

                <div className="chat-window">

                    {/* HEADER */}
                    <div className="chat-header">

                        <span>
                            <strong>
                                TravelGo
                            </strong>{' '}
                            AI Assistant
                        </span>

                        <MdClose
                            className="close-icon"
                            onClick={() =>
                                setIsOpen(false)
                            }
                        />

                    </div>

                    {/* CHAT BODY */}
                    <div
                        className="chat-body"
                        ref={chatBodyRef}
                    >

                        {messages.map(
                            (m, i) => (

                                <div key={i}>

                                    {m.type ===
                                    'flight_cards' ? (

                                        renderFlightCards(
                                            m.flights
                                        )

                                    ) : m.type ===
                                      'hotel_card' ? (

                                        renderHotelCard(
                                            m.hotel
                                        )

                                    ) : (

                                        <div
                                            className={`message ${m.type}`}
                                        >

                                            {m.text}

                                        </div>

                                    )}

                                </div>

                            )
                        )}

                        {loading && (

                            <div className="message bot typing">
                                AI is thinking...
                            </div>

                        )}

                        {isListening && (

                            <div className="message bot typing">
                                Listening... 🎤
                            </div>

                        )}

                    </div>

                    {/* FOOTER */}
                    <div className="chat-footer">

                        <button
                            className={`voice-btn ${
                                isListening
                                    ? 'listening'
                                    : ''
                            }`}
                            onClick={
                                handleVoiceInput
                            }
                            disabled={loading}
                        >

                            {isListening ? (
                                <MdStopCircle />
                            ) : (
                                <MdMic />
                            )}

                        </button>

                        <input
                            value={input}

                            onChange={(e) =>
                                setInput(
                                    e.target.value
                                )
                            }

                            placeholder="Ask me anything..."

                            disabled={loading}

                            onKeyPress={(e) => {

                                if (
                                    e.key ===
                                    'Enter'
                                ) {

                                    handleSend();

                                }

                            }}
                        />

                        <button
                            onClick={handleSend}

                            disabled={
                                loading ||
                                !input.trim()
                            }
                        >

                            <MdSend />

                        </button>

                    </div>

                </div>

            )}

        </>
    );
};

export default AIChat;