import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path to your firebase config

// Helper function to check if two dates are the same (ignoring time)
const isSameDate = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const EventCelebration = ({ events }) => {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    // Check if any event matches today's date
    const today = new Date();
    const foundEvent = events.find(event => {
      const eventDate = event.date.toDate(); // Convert Firestore timestamp to Date
      return isSameDate(eventDate, today);
    });
    
    if (foundEvent) {
      setCurrentEvent(foundEvent);
      
      // Reset confetti after 10 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000);
      
      return () => clearTimeout(confettiTimer);
    } else {
      setCurrentEvent(null);
    }
  }, [events]);

  useEffect(() => {
    // Handle window resize for confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If no event today, don't show anything
  if (!currentEvent) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
      {/* Confetti animation */}
      {showConfetti && currentEvent.animation === 'confetti' && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
          style={{ position: 'fixed', top: 0, left: 0 }}
        />
      )}
      
      {/* Main celebration card */}
      <div className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 pointer-events-auto transform transition-all duration-500 scale-100 opacity-100 ${currentEvent.animation === 'hearts' ? 'animate-pulse' : ''}`}>
        {/* Close button */}
        <button 
          onClick={() => setCurrentEvent(null)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Event icon */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl ${currentEvent.color} text-white`}>
          {currentEvent.icon}
        </div>
        
        {/* Event message */}
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
          {currentEvent.message}
        </h2>
        
        {/* Event name */}
        <p className="text-center text-gray-600 mb-6">
          Celebrating {currentEvent.name}
        </p>
        
        {/* Additional animations based on event type */}
        {currentEvent.animation === 'hearts' && (
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i}
                className="text-red-500 text-2xl animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                ❤️
              </span>
            ))}
          </div>
        )}
        
        {currentEvent.animation === 'stars' && (
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i}
                className="text-yellow-400 text-2xl animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                ⭐
              </span>
            ))}
          </div>
        )}
        
        {currentEvent.animation === 'fireworks' && (
          <div className="flex justify-center space-x-2 mt-4">
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🎆</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎇</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>✨</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Admin component to manage events
const EventAdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    message: '',
    animation: 'confetti',
    icon: '🎂',
    color: 'bg-pink-500'
  });
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch events from Firebase
  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const eventsData = [];
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events: ', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      const dateString = selectedEvent.date.toDate().toISOString().split('T')[0];
      setFormData({
        ...selectedEvent,
        date: dateString
      });
    }
  }, [selectedEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedEvent) {
        // Update existing event
        const eventRef = doc(db, 'events', selectedEvent.id);
        await updateDoc(eventRef, {
          ...formData,
          date: new Date(formData.date)
        });
      } else {
        // Add new event
        await addDoc(collection(db, 'events'), {
          ...formData,
          date: new Date(formData.date)
        });
      }
      
      // Refresh events list
      fetchEvents();
      
      // Reset form
      setSelectedEvent(null);
      setFormData({
        name: '',
        date: '',
        message: '',
        animation: 'confetti',
        icon: '🎂',
        color: 'bg-pink-500'
      });
    } catch (error) {
      console.error('Error saving event: ', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      fetchEvents(); // Refresh events list
    } catch (error) {
      console.error('Error deleting event: ', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading events...</div>;
  }

  return (
    <div className="relative">
      {/* Add Event Button */}
      {!showPanel && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowPanel(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="ml-2">Add Event</span>
          </button>
        </div>
      )}
      
      {/* Admin Panel */}
      {showPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Event Celebration Manager</h1>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Event Form */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    {selectedEvent ? 'Edit Event' : 'Add New Event'}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Event Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Message</label>
                      <input
                        type="text"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Animation</label>
                      <select
                        value={formData.animation}
                        onChange={(e) => setFormData({...formData, animation: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      >
                        <option value="confetti">Confetti</option>
                        <option value="hearts">Hearts</option>
                        <option value="stars">Stars</option>
                        <option value="fireworks">Fireworks</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Icon</label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData({...formData, icon: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      >
                        <option value="🎂">Birthday Cake</option>
                        <option value="🌙">Crescent Moon</option>
                        <option value="🕌">Mosque</option>
                        <option value="💝">Heart</option>
                        <option value="🌟">Star</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Color</label>
                      <select
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      >
                        <option value="bg-pink-500">Pink</option>
                        <option value="bg-green-500">Green</option>
                        <option value="bg-yellow-500">Yellow</option>
                        <option value="bg-red-500">Red</option>
                        <option value="bg-purple-500">Purple</option>
                        <option value="bg-blue-500">Blue</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        {selectedEvent ? 'Update Event' : 'Add Event'}
                      </button>
                      
                      {selectedEvent && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEvent(null);
                            setFormData({
                              name: '',
                              date: '',
                              message: '',
                              animation: 'confetti',
                              icon: '🎂',
                              color: 'bg-pink-500'
                            });
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
                
                {/* Event List */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Saved Events</h2>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {events.map(event => (
                      <div key={event.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{event.icon}</span>
                            <h3 className="font-medium">{event.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            {event.date.toDate().toLocaleDateString()} - {event.message}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Display the celebration if today is an event day */}
      <EventCelebration events={events} />
    </div>
  );
};

export default EventAdminPanel;