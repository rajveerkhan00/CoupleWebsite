import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PaperAirplaneIcon, PencilIcon, HeartIcon, PhotoIcon, MusicalNoteIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';
import { uploadImageToCloudinary } from '../cloudinary';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import Event from '../components/Events';

const App = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentSender, setCurrentSender] = useState('zain');
  const messagesEndRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [activeMemoryTab, setActiveMemoryTab] = useState('photos');
  const [websiteData, setWebsiteData] = useState({
    hero: {
      title: "Kinza & Zain",
      subtitle: "A Love Story Written in the Stars, Animated in 3D"
    },
    about: {
      kinza: {
        name: "Kinza",
        bio: "A dreamer with a heart full of love and eyes that see beauty in every moment. Her laughter lights up the darkest rooms and her kindness knows no bounds. Kinza brings creativity and passion to everything she touches, making the world a more beautiful place.",
        traits: ["Artist", "Dreamer", "Romantic"]
      },
      zain: {
        name: "Zain",
        bio: "A soul with unwavering strength and a gentle touch. His devotion runs deeper than oceans and his love stands taller than mountains. Zain is the anchor in any storm, providing stability and security with his calm presence and thoughtful nature.",
        traits: ["Protector", "Adventurer", "Loyal"]
      },
      story: "Kinza and Zain's love story began with a chance encounter that felt like destiny. From their first conversation, they knew there was something special between them. Their journey has been filled with laughter, adventures, and unwavering support for each other's dreams. Together, they've created a bond that grows stronger with each passing day, building a foundation of trust, respect, and deep affection that will last a lifetime."
    },
    timeline: [
      {
        title: "First Meeting",
        date: "January 15, 2020",
        description: "Two souls crossed paths, and the universe conspired to write their story."
      },
      {
        title: "First Date",
        date: "February 14, 2020",
        description: "A magical evening under the stars, where time stood still."
      },
      {
        title: "The Promise",
        date: "December 31, 2020",
        description: "A promise of forever, sealed with love and trust."
      }
    ],
    gallery: [],
    messages: [],
    memories: {
      photos: [],
      songs: [],
      places: [],
      dates: []
    },
    loveNotes: [],
    futurePlans: []
  });

  // Prevent scrolling to bottom on page load
  useEffect(() => {
    // Remove any hash from the URL that might cause scrolling
    if (window.location.hash) {
      window.history.replaceState(null, null, ' ');
    }
    
    // Scroll to top on initial load
    window.scrollTo(0, 0);
  }, []);

  // Gallery images data - initial placeholder
  const initialGalleryImages = [
    "romantic%20couple%20sunset%20silhouette",
    "couple%20walking%20beach%20holding%20hands",
    "romantic%20dinner%20candlelight%20couple",
    "couple%20dancing%20under%20stars",
    "couple%20laughing%20together%20park",
    "romantic%20couple%20mountain%20view",
    "couple%20embracing%20rainy%20day",
    "couple%20stargazing%20night",
    "couple%20coffee%20morning",
    "couple%20anniversary%20celebration",
    "couple%20travel%20adventure",
    "couple%20wedding%20proposal",
    "couple%20cooking%20together",
    "couple%20reading%20books",
    "couple%20winter%20snuggling",
    "couple%20summer%20picnic"
  ];

  // Initial memory data
  const initialMemories = {
    photos: [
      { id: 1, url: "couple%20beach%20sunset", caption: "Our first beach trip together" },
      { id: 2, url: "couple%20mountain%20hike", caption: "Hiking adventure in the mountains" }
    ],
    songs: [
      { id: 1, title: "Perfect", artist: "Ed Sheeran", caption: "Our first dance song" },
      { id: 2, title: "Can't Help Falling in Love", artist: "Elvis Presley", caption: "The song he sang to me" }
    ],
    places: [
      { id: 1, name: "Sunset Point", description: "Where we had our first kiss" },
      { id: 2, name: "The Coffee Shop", description: "Our Saturday morning tradition" }
    ],
    dates: [
      { id: 1, title: "Anniversary", date: "June 15", description: "The day we officially became a couple" },
      { id: 2, title: "First Trip", date: "August 22", description: "Our first vacation together" }
    ]
  };

  // Initial love notes
  const initialLoveNotes = [
    { id: 1, content: "I love the way you laugh at my jokes, even the bad ones.", date: "February 14, 2021" },
    { id: 2, content: "Every day with you is a new adventure. I can't wait to see what tomorrow brings.", date: "May 20, 2021" }
  ];

  // Initial future plans
  const initialFuturePlans = [
    { id: 1, title: "Travel the World", description: "Visit at least 10 countries together" },
    { id: 2, title: "Build a Home", description: "Create our perfect space filled with love and memories" }
  ];

  // Fetch data from Firestore on component mount
  useEffect(() => {
    fetchWebsiteData();
    fetchMessages(); // Load messages from Firebase
  }, []);

  const fetchWebsiteData = async () => {
    try {
      const docRef = doc(db, "website", "content");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Ensure all sections exist in the fetched data
        const completeData = {
          ...websiteData,
          ...data,
          memories: data.memories || websiteData.memories,
          loveNotes: data.loveNotes || websiteData.loveNotes,
          futurePlans: data.futurePlans || websiteData.futurePlans
        };
        setWebsiteData(completeData);
      } else {
        // Initialize with default data if no document exists
        await setDoc(doc(db, "website", "content"), websiteData);
        toast.info("Website initialized with default content");
      }
    } catch (error) {
      console.error("Error fetching website data:", error);
      toast.error("Failed to load website data");
    }
  };

  // Fetch messages from Firebase
  const fetchMessages = async () => {
    try {
      const messagesRef = collection(db, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesData = [];
        querySnapshot.forEach((doc) => {
          messagesData.push({ id: doc.id, ...doc.data() });
        });
        
        // Update website data with messages from Firebase
        setWebsiteData(prevData => ({
          ...prevData,
          messages: messagesData
        }));
      });
      
      return unsubscribe; // Return the unsubscribe function for cleanup
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  // Save data to Firestore
  const saveWebsiteData = async () => {
    try {
      await setDoc(doc(db, "website", "content"), websiteData);
      toast.success("Website content saved successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error saving website data:", error);
      toast.error("Failed to save website content");
    }
  };

  // Handle image upload
  const handleImageUpload = async (e, section, index = null, subSection = null) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      toast.info("Uploading image...");
      const imageUrl = await uploadImageToCloudinary(file);
      
      if (section === "gallery") {
        const updatedGallery = [...websiteData.gallery];
        if (index !== null) {
          updatedGallery[index] = imageUrl;
        } else {
          updatedGallery.push(imageUrl);
        }
        setWebsiteData({
          ...websiteData,
          gallery: updatedGallery
        });
      } else if (section === "hero") {
        // For hero background or other specific images
        setWebsiteData({
          ...websiteData,
          [section]: {
            ...websiteData[section],
            image: imageUrl
          }
        });
      } else if (section === "memories" && subSection === "photos") {
        // For memory photos
        const updatedPhotos = [...websiteData.memories.photos];
        if (index !== null) {
          updatedPhotos[index] = { ...updatedPhotos[index], url: imageUrl };
        } else {
          updatedPhotos.push({ id: Date.now(), url: imageUrl, caption: "New memory" });
        }
        setWebsiteData({
          ...websiteData,
          memories: {
            ...websiteData.memories,
            photos: updatedPhotos
          }
        });
      }
      
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  // Handle text changes
  const handleTextChange = (section, field, value, index = null, subSection = null) => {
    if (index !== null && subSection) {
      // For array fields within objects like memories.photos
      const updatedSubSection = [...websiteData[section][subSection]];
      updatedSubSection[index][field] = value;
      setWebsiteData({
        ...websiteData,
        [section]: {
          ...websiteData[section],
          [subSection]: updatedSubSection
        }
      });
    } else if (index !== null) {
      // For array fields like timeline
      const updatedArray = [...websiteData[section]];
      updatedArray[index][field] = value;
      setWebsiteData({
        ...websiteData,
        [section]: updatedArray
      });
    } else if (section.includes('.')) {
      // For nested fields like about.kinza.name
      const [parent, child] = section.split('.');
      setWebsiteData({
        ...websiteData,
        [parent]: {
          ...websiteData[parent],
          [child]: {
            ...websiteData[parent][child],
            [field]: value
          }
        }
      });
    } else {
      // For simple fields
      setWebsiteData({
        ...websiteData,
        [section]: {
          ...websiteData[section],
          [field]: value
        }
      });
    }
  };

  // Add new item to a section
  const addNewItem = (section, subSection = null) => {
    if (subSection) {
      // For subsections like memories.photos
      const newItem = { id: Date.now() };
      if (subSection === "photos") newItem.url = "";
      if (subSection === "photos") newItem.caption = "New memory";
      if (subSection === "songs") newItem.title = "New song";
      if (subSection === "songs") newItem.artist = "Artist";
      if (subSection === "songs") newItem.caption = "Special meaning";
      if (subSection === "places") newItem.name = "New place";
      if (subSection === "places") newItem.description = "Special memory";
      if (subSection === "dates") newItem.title = "New date";
      if (subSection === "dates") newItem.date = "Date";
      if (subSection === "dates") newItem.description = "Why it's special";
      
      setWebsiteData({
        ...websiteData,
        [section]: {
          ...websiteData[section],
          [subSection]: [...websiteData[section][subSection], newItem]
        }
      });
    } else {
      // For main sections like loveNotes
      const newItem = { id: Date.now() };
      if (section === "loveNotes") newItem.content = "New note";
      if (section === "loveNotes") newItem.date = new Date().toLocaleDateString();
      if (section === "futurePlans") newItem.title = "New plan";
      if (section === "futurePlans") newItem.description = "Description";
      
      setWebsiteData({
        ...websiteData,
        [section]: [...websiteData[section], newItem]
      });
    }
  };

  // Remove item from a section
  const removeItem = (section, index, subSection = null) => {
    if (subSection) {
      const updatedSubSection = [...websiteData[section][subSection]];
      updatedSubSection.splice(index, 1);
      setWebsiteData({
        ...websiteData,
        [section]: {
          ...websiteData[section],
          [subSection]: updatedSubSection
        }
      });
    } else {
      const updatedArray = [...websiteData[section]];
      updatedArray.splice(index, 1);
      setWebsiteData({
        ...websiteData,
        [section]: updatedArray
      });
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [websiteData.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Slider navigation functions
  const nextSlide = () => {
    const slidesCount = Math.ceil((websiteData.gallery.length || initialGalleryImages.length) / 8);
    setCurrentSlide((prev) => (prev + 1) % slidesCount);
  };

  const prevSlide = () => {
    const slidesCount = Math.ceil((websiteData.gallery.length || initialGalleryImages.length) / 8);
    setCurrentSlide((prev) => (prev - 1 + slidesCount) % slidesCount);
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      // Add message to Firebase
      const messagesRef = collection(db, "messages");
      await addDoc(messagesRef, {
        sender: currentSender,
        text: newMessage,
        timestamp: serverTimestamp()
      });

      setNewMessage('');
      // Switch sender for the next message
      setCurrentSender(currentSender === 'zain' ? 'kinza' : 'zain');
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Get gallery images - use stored ones or fallback to initial
  const galleryImages = websiteData.gallery.length > 0 
    ? websiteData.gallery 
    : initialGalleryImages;

  // Get memories - use stored ones or fallback to initial
  const memories = {
    photos: websiteData.memories?.photos?.length > 0 ? websiteData.memories.photos : initialMemories.photos,
    songs: websiteData.memories?.songs?.length > 0 ? websiteData.memories.songs : initialMemories.songs,
    places: websiteData.memories?.places?.length > 0 ? websiteData.memories.places : initialMemories.places,
    dates: websiteData.memories?.dates?.length > 0 ? websiteData.memories.dates : initialMemories.dates
  };

  // Get love notes - use stored ones or fallback to initial
  const loveNotes = websiteData.loveNotes?.length > 0 ? websiteData.loveNotes : initialLoveNotes;

  // Get future plans - use stored ones or fallback to initial
  const futurePlans = websiteData.futurePlans?.length > 0 ? websiteData.futurePlans : initialFuturePlans;

  return (
    <div className="font-sans text-gray-800">
      <ToastContainer position="bottom-right" autoClose={3000} />
      

      {/* Floating Hearts Animation */}
      <div className="floating-hearts">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="floating-heart"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      {/* Floating Messages Animation */}
      <div className="floating-messages">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="floating-message"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 7}s`,
              animationDuration: `${8 + Math.random() * 12}s`
            }}
          >
            {["I love you", "Forever", "Always", "My heart", "Together"][i % 5]}
          </div>
        ))}
      </div>
      
      {/* Edit Mode Toggle */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
            editMode ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white floating-button`}
        >
          <PencilIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="main-navigation">
        <div className="navigation-container flex flex-wrap items-center justify-between py-5 px-4 md:px-8 bg-white/90 backdrop-blur-sm shadow-md">
          <div className="logo text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent animate-pulse floating-logo">K&Z</div>
          <div className="navigation-links flex flex-wrap justify-center space-x-4 md:space-x-8 mt-4 md:mt-0">
            <a href="/kinza/login" className="gjs-t-link kinza-login-link hover:text-rose-600 transition-all duration-300 font-medium floating-nav-item text-sm md:text-base">Kinza Login</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section relative min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 overflow-hidden">
        {/* Animated Particles */}
        <div className="particle-background absolute inset-0" id="i9lmh">
          <div
            className="particle-1 absolute w-32 h-32 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse floating-particle"
            id="il318"
            style={{ top: '20%', left: '10%' }}
          ></div>
          <div
            className="particle-2 absolute w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-bounce floating-particle"
            id="iiizh"
            style={{ top: '70%', left: '20%' }}
          ></div>
          <div
            className="particle-3 absolute w-36 h-36 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse floating-particle"
            id="ikzts"
            style={{ top: '30%', right: '10%' }}
          ></div>
          <div
            className="particle-4 absolute w-44 h-44 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-bounce floating-particle"
            id="irms7"
            style={{ bottom: '20%', right: '20%' }}
          ></div>
        </div>

        {/* Hero Content */}
        <div className="hero-content text-center z-10 px-4 md:px-6">
          <div className="3d-hearts-container mb-8">
            <div className="heart-animation animate-pulse floating-heart-main">
              <svg width="150" height="150" viewBox="0 0 100 100" className="heart-svg mx-auto">
                <path
                  d="M50,25 C30,0 0,15 0,40 C0,55 50,90 50,90 C50,90 100,55 100,40 C100,15 70,0 50,25 Z"
                  fill="#e11d48"
                  opacity="0.8"
                ></path>
              </svg>
            </div>
          </div>
          
          {editMode ? (
            <>
              <input
                type="text"
                value={websiteData.hero.title}
                onChange={(e) => handleTextChange('hero', 'title', e.target.value)}
                className="text-4xl md:text-5xl lg:text-7xl font-bold bg-transparent text-center mb-4 border-2 border-dashed border-rose-500 p-2 rounded floating-input w-full max-w-2xl mx-auto"
              />
              <textarea
                value={websiteData.hero.subtitle}
                onChange={(e) => handleTextChange('hero', 'subtitle', e.target.value)}
                className="text-lg md:text-xl lg:text-2xl bg-transparent text-center mb-10 border-2 border-dashed border-rose-300 p-2 rounded w-full max-w-2xl mx-auto floating-input"
                rows="2"
              />
            </>
          ) : (
            <>
              <h1 className="gjs-t-h1 hero-title text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-rose-700 to-purple-700 bg-clip-text text-transparent mb-4 animate-fade-in floating-title">
                {websiteData.hero.title}
              </h1>
              <p className="hero-subtitle text-lg md:text-xl lg:text-2xl text-gray-600 mb-10 animate-fade-in-delay floating-subtitle">
                {websiteData.hero.subtitle}
              </p>
            </>
          )}
          
          <div className="hero-cta-container space-y-4 sm:space-y-0 sm:space-x-6 flex flex-col sm:flex-row justify-center animate-fade-in-delay-2">
            <a
              href="#about"
              className="gjs-t-button explore-cta px-6 py-3 md:px-8 md:py-3 bg-gradient-to-r from-rose-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 floating-button text-center"
            >
              Explore Our Story
            </a>
            <a
              href="#messages"
              className="message-cta px-6 py-3 md:px-8 md:py-3 bg-white text-rose-600 font-semibold rounded-full shadow-md hover:bg-gray-50 border-2 border-rose-200 hover:border-rose-300 transition-all duration-300 floating-button text-center"
            >
              Leave a Message
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section py-16 md:py-20 bg-white overflow-hidden">
        <div className="about-container max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="gjs-t-h1 about-title text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-rose-700 to-purple-700 bg-clip-text text-transparent mb-12 md:mb-16 animate-fade-in floating-title">
            About Kinza & Zain
          </h2>
          
          <div className="about-grid grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Kinza Card */}
            <div className="kinza-card p-6 md:p-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-500 border border-rose-100 animate-slide-in-left floating-card">
              <div className="kinza-content">
                <div className="kinza-avatar-container mb-6 flex justify-center">
                  <div className="kinza-avatar w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-rose-500 to-pink-500 text-white text-2xl md:text-3xl font-bold rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 floating-avatar">
                    K
                  </div>
                </div>
                
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={websiteData.about.kinza.name}
                      onChange={(e) => handleTextChange('about.kinza', 'name', e.target.value)}
                      className="text-xl md:text-2xl font-semibold text-center text-rose-800 mb-2 border-2 border-dashed border-rose-500 p-1 rounded w-full floating-input"
                    />
                    <textarea
                      value={websiteData.about.kinza.bio}
                      onChange={(e) => handleTextChange('about.kinza', 'bio', e.target.value)}
                      className="text-gray-700 mt-4 text-center leading-relaxed border-2 border-dashed border-rose-300 p-2 rounded w-full floating-input text-sm md:text-base"
                      rows="4"
                    />
                    <div className="kinza-traits mt-6 flex flex-wrap justify-center gap-2">
                      {websiteData.about.kinza.traits.map((trait, index) => (
                        <input
                          key={index}
                          type="text"
                          value={trait}
                          onChange={(e) => {
                            const newTraits = [...websiteData.about.kinza.traits];
                            newTraits[index] = e.target.value;
                            handleTextChange('about.kinza', 'traits', newTraits);
                          }}
                          className="px-3 py-1 bg-rose-200 text-rose-800 rounded-full text-xs md:text-sm font-medium w-24 text-center border border-dashed border-rose-400 floating-input"
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="gjs-t-h2 kinza-name text-xl md:text-2xl font-semibold text-center text-rose-800 mb-2 floating-text">
                      {websiteData.about.kinza.name}
                    </h3>
                    <div className="heart-divider flex justify-center mb-4">
                      <svg width="30" height="30" viewBox="0 0 100 100" className="text-rose-400 floating-icon">
                        <path d="M50,25 C30,0 0,15 0,40 C0,55 50,90 50,90 C50,90 100,55 100,40 C100,15 70,0 50,25 Z" fill="currentColor"></path>
                      </svg>
                    </div>
                    <p className="kinza-bio text-gray-700 mt-4 text-center leading-relaxed floating-text text-sm md:text-base">
                      {websiteData.about.kinza.bio}
                    </p>
                    <div className="kinza-traits mt-6 flex flex-wrap justify-center gap-2">
                      {websiteData.about.kinza.traits.map((trait, index) => (
                        <span key={index} className="trait-artist px-3 py-1 bg-rose-200 text-rose-800 rounded-full text-xs md:text-sm font-medium transform hover:scale-105 transition-all duration-300 floating-tag">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Zain Card */}
            <div className="zain-card p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-500 border border-indigo-100 animate-slide-in-right floating-card">
              <div className="zain-content">
                <div className="zain-avatar-container mb-6 flex justify-center">
                  <div className="zain-avatar w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 to-blue-500 text-white text-2xl md:text-3xl font-bold rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 floating-avatar">
                    Z
                  </div>
                </div>
                
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={websiteData.about.zain.name}
                      onChange={(e) => handleTextChange('about.zain', 'name', e.target.value)}
                      className="text-xl md:text-2xl font-semibold text-center text-indigo-800 mb-2 border-2 border-dashed border-indigo-500 p-1 rounded w-full floating-input"
                    />
                    <textarea
                      value={websiteData.about.zain.bio}
                      onChange={(e) => handleTextChange('about.zain', 'bio', e.target.value)}
                      className="text-gray-700 mt-4 text-center leading-relaxed border-2 border-dashed border-indigo-300 p-2 rounded w-full floating-input text-sm md:text-base"
                      rows="4"
                    />
                    <div className="zain-traits mt-6 flex flex-wrap justify-center gap-2">
                      {websiteData.about.zain.traits.map((trait, index) => (
                        <input
                          key={index}
                          type="text"
                          value={trait}
                          onChange={(e) => {
                            const newTraits = [...websiteData.about.zain.traits];
                            newTraits[index] = e.target.value;
                            handleTextChange('about.zain', 'traits', newTraits);
                          }}
                          className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-xs md:text-sm font-medium w-24 text-center border border-dashed border-indigo-400 floating-input"
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="gjs-t-h2 zain-name text-xl md:text-2xl font-semibold text-center text-indigo-800 mb-2 floating-text">
                      {websiteData.about.zain.name}
                    </h3>
                    <div className="heart-divider flex justify-center mb-4">
                      <svg width="30" height="30" viewBox="0 0 100 100" className="text-indigo-400 floating-icon">
                        <path d="M50,25 C30,0 0,15 0,40 C0,55 50,90 50,90 C50,90 100,55 100,40 C100,15 70,0 50,25 Z" fill="currentColor"></path>
                      </svg>
                    </div>
                    <p className="zain-bio text-gray-700 mt-4 text-center leading-relaxed floating-text text-sm md:text-base">
                      {websiteData.about.zain.bio}
                    </p>
                    <div className="zain-traits mt-6 flex flex-wrap justify-center gap-2">
                      {websiteData.about.zain.traits.map((trait, index) => (
                        <span key={index} className="trait-protector px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-xs md:text-sm font-medium transform hover:scale-105 transition-all duration-300 floating-tag">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Their Story Section */}
          <div className="their-story mt-16 md:mt-20 p-6 md:p-8 bg-gradient-to-r from-rose-50/50 to-purple-50/50 rounded-2xl shadow-lg border border-rose-100/50 animate-fade-in-delay floating-card">
            <h3 className="text-2xl md:text-3xl font-semibold text-center text-rose-800 mb-6 floating-title">Their Story</h3>
            
            {editMode ? (
              <textarea
                value={websiteData.about.story}
                onChange={(e) => handleTextChange('about', 'story', e.target.value)}
                className="text-gray-700 text-center leading-relaxed max-w-3xl mx-auto w-full border-2 border-dashed border-rose-300 p-4 rounded floating-input text-sm md:text-base"
                rows="5"
              />
            ) : (
              <p className="text-gray-700 text-center leading-relaxed max-w-3xl mx-auto floating-text text-sm md:text-base">
                {websiteData.about.story}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="timeline-section py-16 md:py-20 bg-gradient-to-br from-rose-50/30 to-indigo-50/30">
        <div className="timeline-container max-w-4xl mx-auto px-4 md:px-6">
          <h2 className="gjs-t-h1 timeline-title text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-rose-700 to-purple-700 bg-clip-text text-transparent mb-12 md:mb-16 floating-title">
            Our Love Journey
          </h2>
          
          {editMode && (
            <div className="flex justify-center mb-6">
              <button 
                onClick={() => addNewItem('timeline')}
                className="px-4 py-2 bg-rose-500 text-white rounded-full flex items-center floating-button"
              >
                <span>Add New Event</span>
              </button>
            </div>
          )}
          
          <div className="timeline-wrapper relative">
            {/* Vertical Line */}
            <div className="timeline-line absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-rose-400 to-indigo-400"></div>

            {websiteData.timeline.map((event, index) => (
              <div key={index} className={`timeline-item flex ${index % 2 === 0 ? '' : 'flex-row-reverse'} mb-12 md:mb-16 relative floating-card`}>
                <div className={`timeline-content w-full md:w-1/2 ${index % 2 === 0 ? 'pr-0 md:pr-8 text-left md:text-right' : 'pl-0 md:pl-8'}`}>
                  <div className="timeline-card p-4 md:p-6 bg-white rounded-xl shadow-md border-l-4 border-rose-500 hover:shadow-lg transition-all duration-300">
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          value={event.title}
                          onChange={(e) => handleTextChange('timeline', 'title', e.target.value, index)}
                          className="text-lg md:text-xl font-semibold text-gray-800 w-full border-b border-dashed border-rose-300 mb-2 floating-input"
                        />
                        <input
                          type="text"
                          value={event.date}
                          onChange={(e) => handleTextChange('timeline', 'date', e.target.value, index)}
                          className="text-sm text-rose-600 font-medium w-full border-b border-dashed border-rose-200 mb-2 floating-input"
                        />
                        <textarea
                          value={event.description}
                          onChange={(e) => handleTextChange('timeline', 'description', e.target.value, index)}
                          className="text-gray-700 mt-2 w-full border border-dashed border-rose-200 p-2 rounded floating-input text-sm"
                          rows="3"
                        />
                        <button 
                          onClick={() => removeItem('timeline', index)}
                          className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded floating-button"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="gjs-t-h2 timeline-event-title text-lg md:text-xl font-semibold text-gray-800 floating-text">
                          {event.title}
                        </h3>
                        <p className="timeline-event-date text-sm text-rose-600 font-medium floating-text">
                          {event.date}
                        </p>
                        <p className="timeline-event-description text-gray-700 mt-2 floating-text text-sm md:text-base">
                          {event.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="timeline-dot absolute left-1/2 transform -translate-x-1/2 w-4 h-4 md:w-6 md:h-6 bg-rose-500 rounded-full border-4 border-white shadow floating-dot">
                  <div className="timeline-dot-inner w-full h-full bg-white rounded-full"></div>
                </div>
                <div className="timeline-spacer hidden md:block w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="gallery-section py-16 md:py-20 bg-white overflow-hidden" ref={sliderRef}>
        <div className="gallery-container max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="gjs-t-h1 gallery-title text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-rose-700 to-purple-700 bg-clip-text text-transparent mb-10 md:mb-12 floating-title">
            Our Moments
          </h2>
          
          {editMode && (
            <div className="flex justify-center mb-6">
              <label className="px-4 py-2 bg-blue-500 text-white rounded-full cursor-pointer floating-button">
                Upload New Image
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "gallery")}
                  accept="image/*"
                />
              </label>
            </div>
          )}
          
          {/* Slider Controls */}
          <div className="slider-controls flex justify-center mb-6 md:mb-8 space-x-4">
            <button 
              onClick={prevSlide}
              className="p-2 md:p-3 bg-rose-100 text-rose-700 rounded-full hover:bg-rose-200 transition-all duration-300 shadow-md floating-button"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="slide-indicators flex items-center space-x-2">
              {Array.from({ length: Math.ceil(galleryImages.length / 8) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-rose-600 scale-125' : 'bg-rose-300'
                  } floating-dot`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
            <button 
              onClick={nextSlide}
              className="p-2 md:p-3 bg-rose-100 text-rose-700 rounded-full hover:bg-rose-200 transition-all duration-300 shadow-md floating-button"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          
          {/* Slider Container */}
          <div className="slider-wrapper overflow-hidden relative">
            <div 
              className="gallery-slider flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(galleryImages.length / 8) }).map((_, slideIndex) => (
                <div key={slideIndex} className="gallery-slide min-w-full">
                  <div className="gallery-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-1 md:px-2">
                    {galleryImages.slice(slideIndex * 8, (slideIndex + 1) * 8).map((image, index) => (
                      <div key={index} className="gallery-item overflow-hidden rounded-xl md:rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-500 group relative floating-card">
                        <div className="relative overflow-hidden h-32 md:h-48">
                          <img
                            src={typeof image === 'string' && image.includes('http') ? image : `https://app.grapesjs.com/api/assets/random-image?query=${image}&w=400&h=300`}
                            alt={`Gallery image ${slideIndex * 8 + index + 1}`}
                            loading="lazy"
                            className="gallery-image w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-3 md:p-4">
                            <p className="text-white font-medium text-xs md:text-sm">
                              {typeof image === 'string' && image.includes('http') 
                                ? `Image ${slideIndex * 8 + index + 1}` 
                                : image.replace(/%20/g, ' ')}
                            </p>
                          </div>
                          
                          {editMode && (
                            <>
                              <div className="absolute top-2 right-2">
                                <label className="bg-blue-500 text-white p-1 rounded text-xs cursor-pointer floating-button">
                                  Replace
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, "gallery", slideIndex * 8 + index)}
                                    accept="image/*"
                                  />
                                </label>
                              </div>
                              <div className="absolute top-2 left-2">
                                <button
                                  onClick={() => {
                                    const newGallery = [...galleryImages];
                                    newGallery.splice(slideIndex * 8 + index, 1);
                                    handleTextChange('gallery', '', newGallery);
                                  }}
                                  className="bg-red-500 text-white p-1 rounded text-xs floating-button"
                                >
                                  Remove
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Memories Section */}
      <section id="memories" className="memories-section py-16 md:py-20 bg-gradient-to-br from-rose-50/30 to-indigo-50/30">
        <div className="memories-container max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="gjs-t-h1 memories-title text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-rose-700 to-purple-700 bg-clip-text text-transparent mb-10 md:mb-12 floating-title">
            Our Special Memories
          </h2>
          
          {/* Memory Tabs */}
          <div className="memory-tabs flex justify-center mb-8 md:mb-10">
            <div className="flex flex-wrap justify-center gap-1 bg-rose-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveMemoryTab('photos')}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 flex items-center ${activeMemoryTab === 'photos' ? 'bg-rose-500 text-white' : 'text-rose-700'}`}
              >
                <PhotoIcon className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Photos
              </button>
              <button
                onClick={() => setActiveMemoryTab('songs')}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 flex items-center ${activeMemoryTab === 'songs' ? 'bg-rose-500 text-white' : 'text-rose-700'}`}
              >
                <MusicalNoteIcon className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Songs
              </button>
              <button
                onClick={() => setActiveMemoryTab('places')}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 flex items-center ${activeMemoryTab === 'places' ? 'bg-rose-500 text-white' : 'text-rose-700'}`}
              >
                <MapPinIcon className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Places
              </button>
              <button
                onClick={() => setActiveMemoryTab('dates')}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 flex items-center ${activeMemoryTab === 'dates' ? 'bg-rose-500 text-white' : 'text-rose-700'}`}
              >
                <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Dates
              </button>
            </div>
          </div>
          
          {editMode && (
            <div className="flex justify-center mb-6">
              <button 
                onClick={() => addNewItem('memories', activeMemoryTab)}
                className="px-4 py-2 bg-rose-500 text-white rounded-full flex items-center floating-button text-sm md:text-base"
              >
                <span>Add New {activeMemoryTab.slice(0, -1)}</span>
              </button>
            </div>
          )}
          
          {/* Memory Content */}
          <div className="memory-content">
            {activeMemoryTab === 'photos' && (
              <div className="memory-photos grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {memories.photos.map((photo, index) => (
                  <div key={photo.id} className="memory-photo-card bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden floating-card">
                    <div className="relative h-40 md:h-48 overflow-hidden">
                      <img
                        src={typeof photo.url === 'string' && photo.url.includes('http') ? photo.url : `https://app.grapesjs.com/api/assets/random-image?query=${photo.url}&w=400&h=300`}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                      {editMode && (
                        <>
                          <div className="absolute top-2 right-2">
                            <label className="bg-blue-500 text-white p-1 rounded text-xs cursor-pointer floating-button">
                              Replace
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, "memories", index, "photos")}
                                accept="image/*"
                              />
                            </label>
                          </div>
                          <div className="absolute top-2 left-2">
                            <button
                              onClick={() => removeItem('memories', index, 'photos')}
                              className="bg-red-500 text-white p-1 rounded text-xs floating-button"
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="p-3 md:p-4">
                      {editMode ? (
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) => handleTextChange('memories', 'caption', e.target.value, index, 'photos')}
                          className="w-full border-b border-dashed border-rose-300 floating-input text-sm md:text-base"
                          placeholder="Caption"
                        />
                      ) : (
                        <p className="text-gray-700 font-medium text-sm md:text-base">{photo.caption}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeMemoryTab === 'songs' && (
              <div className="memory-songs grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {memories.songs.map((song, index) => (
                  <div key={song.id} className="memory-song-card bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 floating-card">
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          value={song.title}
                          onChange={(e) => handleTextChange('memories', 'title', e.target.value, index, 'songs')}
                          className="text-lg md:text-xl font-semibold text-rose-800 mb-2 w-full border-b border-dashed border-rose-300 floating-input"
                          placeholder="Song title"
                        />
                        <input
                          type="text"
                          value={song.artist}
                          onChange={(e) => handleTextChange('memories', 'artist', e.target.value, index, 'songs')}
                          className="text-gray-600 mb-3 w-full border-b border-dashed border-rose-200 floating-input text-sm md:text-base"
                          placeholder="Artist"
                        />
                        <textarea
                          value={song.caption}
                          onChange={(e) => handleTextChange('memories', 'caption', e.target.value, index, 'songs')}
                          className="text-gray-700 w-full border border-dashed border-rose-200 p-2 rounded floating-input text-sm"
                          rows="2"
                          placeholder="Why this song is special"
                        />
                        <button 
                          onClick={() => removeItem('memories', index, 'songs')}
                          className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded floating-button"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg md:text-xl font-semibold text-rose-800 mb-2 floating-text">{song.title}</h3>
                        <p className="text-gray-600 mb-3 floating-text text-sm md:text-base">{song.artist}</p>
                        <p className="text-gray-700 floating-text text-sm md:text-base">{song.caption}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {activeMemoryTab === 'places' && (
              <div className="memory-places grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {memories.places.map((place, index) => (
                  <div key={place.id} className="memory-place-card bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 floating-card">
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          value={place.name}
                          onChange={(e) => handleTextChange('memories', 'name', e.target.value, index, 'places')}
                          className="text-lg md:text-xl font-semibold text-rose-800 mb-2 w-full border-b border-dashed border-rose-300 floating-input"
                          placeholder="Place name"
                        />
                        <textarea
                          value={place.description}
                          onChange={(e) => handleTextChange('memories', 'description', e.target.value, index, 'places')}
                          className="text-gray-700 w-full border border-dashed border-rose-200 p-2 rounded floating-input text-sm"
                          rows="2"
                          placeholder="Why this place is special"
                        />
                        <button 
                          onClick={() => removeItem('memories', index, 'places')}
                          className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded floating-button"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg md:text-xl font-semibold text-rose-800 mb-2 floating-text">{place.name}</h3>
                        <p className="text-gray-700 floating-text text-sm md:text-base">{place.description}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {activeMemoryTab === 'dates' && (
              <div className="memory-dates grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {memories.dates.map((date, index) => (
                  <div key={date.id} className="memory-date-card bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 floating-card">
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          value={date.title}
                          onChange={(e) => handleTextChange('memories', 'title', e.target.value, index, 'dates')}
                          className="text-lg md:text-xl font-semibold text-rose-800 mb-2 w-full border-b border-dashed border-rose-300 floating-input"
                          placeholder="Date title"
                        />
                        <input
                          type="text"
                          value={date.date}
                          onChange={(e) => handleTextChange('memories', 'date', e.target.value, index, 'dates')}
                          className="text-gray-600 mb-3 w-full border-b border-dashed border-rose-200 floating-input text-sm md:text-base"
                          placeholder="Date"
                        />
                        <textarea
                          value={date.description}
                          onChange={(e) => handleTextChange('memories', 'description', e.target.value, index, 'dates')}
                          className="text-gray-700 w-full border border-dashed border-rose-200 p-2 rounded floating-input text-sm"
                          rows="2"
                          placeholder="Why this date is special"
                        />
                        <button 
                          onClick={() => removeItem('memories', index, 'dates')}
                          className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded floating-button"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg md:text-xl font-semibold text-rose-800 mb-2 floating-text">{date.title}</h3>
                        <p className="text-gray-600 mb-3 floating-text text-sm md:text-base">{date.date}</p>
                        <p className="text-gray-700 floating-text text-sm md:text-base">{date.description}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Love Notes Section */}
      <section id="love-notes" className="love-notes-section py-16 md:py-20 bg-white">
        <div className="love-notes-container max-w-4xl mx-auto px-4 md:px-6">
          <h2 className="gjs-t-h1 love-notes-title text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-rose-700 to-purple-700 bg-clip-text text-transparent mb-10 md:mb-12 floating-title">
            Love Notes
          </h2>
          
          {editMode && (
            <div className="flex justify-center mb-6">
              <button 
                onClick={() => addNewItem('loveNotes')}
                className="px-4 py-2 bg-rose-500 text-white rounded-full flex items-center floating-button"
              >
                <span>Add New Note</span>
              </button>
            </div>
          )}
          
          <div className="love-notes-grid grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {loveNotes.map((note, index) => (
              <div key={note.id} className="love-note-card bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 relative overflow-hidden floating-card">
                <div className="absolute top-4 right-4 text-rose-300 text-3xl md:text-4xl opacity-50">
                  ❤️
                </div>
                
                {editMode ? (
                  <>
                    <textarea
                      value={note.content}
                      onChange={(e) => handleTextChange('loveNotes', 'content', e.target.value, index)}
                      className="text-gray-700 mb-4 w-full bg-transparent border-b border-dashed border-rose-300 floating-input text-sm md:text-base"
                      rows="3"
                      placeholder="Your love note"
                    />
                    <input
                      type="text"
                      value={note.date}
                      onChange={(e) => handleTextChange('loveNotes', 'date', e.target.value, index)}
                      className="text-sm text-rose-600 w-full bg-transparent border-b border-dashed border-rose-200 floating-input"
                      placeholder="Date"
                    />
                    <button 
                      onClick={() => removeItem('loveNotes', index)}
                      className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded floating-button"
                    >
                      Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-700 mb-4 italic floating-text text-sm md:text-base">"{note.content}"</p>
                        <p className="text-sm text-rose-600 floating-text">{note.date}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Future Plans Section */}
          <section id="future-plans" className="future-plans-section py-16 md:py-20 bg-gradient-to-br from-rose-50/30 to-indigo-50/30">
            <div className="future-plans-container max-w-4xl mx-auto px-4 md:px-6">
              <h2 className="gjs-t-h1 future-plans-title text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-rose-700 to-purple-700 bg-clip-text text-transparent mb-10 md:mb-12 floating-title">
                Our Future Together
              </h2>
              
              {editMode && (
                <div className="flex justify-center mb-6">
                  <button 
                    onClick={() => addNewItem('futurePlans')}
                    className="px-4 py-2 bg-rose-500 text-white rounded-full flex items-center floating-button"
                  >
                    <span>Add New Plan</span>
                  </button>
                </div>
              )}
              
              <div className="future-plans-grid grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {futurePlans.map((plan, index) => (
                  <div key={plan.id} className="future-plan-card bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 floating-card">
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          value={plan.title}
                          onChange={(e) => handleTextChange('futurePlans', 'title', e.target.value, index)}
                          className="text-lg md:text-xl font-semibold text-rose-800 mb-2 w-full border-b border-dashed border-rose-300 floating-input"
                          placeholder="Plan title"
                        />
                        <textarea
                          value={plan.description}
                          onChange={(e) => handleTextChange('futurePlans', 'description', e.target.value, index)}
                          className="text-gray-700 w-full border border-dashed border-rose-200 p-2 rounded floating-input text-sm"
                          rows="2"
                          placeholder="Plan description"
                        />
                        <button 
                          onClick={() => removeItem('futurePlans', index)}
                          className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded floating-button"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg md:text-xl font-semibold text-rose-800 mb-2 floating-text">{plan.title}</h3>
                        <p className="text-gray-700 floating-text text-sm md:text-base">{plan.description}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Messages Section */}
          <section id="messages" className="messages-section py-16 md:py-20 bg-gradient-to-br from-rose-50/30 to-indigo-50/30">
            <div className="messages-container max-w-4xl mx-auto px-4 md:px-6">
              <h2 className="gjs-t-h1 messages-title text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-rose-700 to-purple-700 bg-clip-text text-transparent mb-8 md:mb-10 floating-title">
                Messages Between Kinza & Zain
              </h2>
              
              <div className="chat-container bg-white rounded-xl md:rounded-2xl shadow-lg border border-rose-100 overflow-hidden floating-card">
                {/* Chat Header */}
                <div className="chat-header bg-gradient-to-r from-rose-600 to-purple-600 p-3 md:p-4 text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-lg md:text-xl mr-2 md:mr-3 floating-avatar">
                        K
                      </div>
                      <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-green-400 border-2 border-white absolute bottom-0 right-0 md:right-2"></div>
                    </div>
                    <div className="relative ml-1 md:ml-2">
                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg md:text-xl floating-avatar">
                        Z
                      </div>
                      <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-green-400 border-2 border-white absolute bottom-0 right-0 md:right-2"></div>
                    </div>
                    <div className="ml-2 md:ml-4">
                      <h3 className="font-semibold text-sm md:text-base">Kinza & Zain</h3>
                      <p className="text-rose-100 text-xs md:text-sm">Online now</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 md:space-x-2">
                    <button className="p-1 md:p-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 transition-all duration-300 floating-button">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                    <button className="p-1 md:p-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 transition-all duration-300 floating-button">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Messages Area */}
                <div className="messages-area p-3 md:p-4 h-80 md:h-96 overflow-y-auto bg-rose-50/30">
                  {websiteData.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message flex mb-3 md:mb-4 ${message.sender === 'zain' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'kinza' && (
                        <div className="sender-avatar w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm md:text-base mr-2 flex-shrink-0 floating-avatar">
                          K
                        </div>
                      )}
                      
                      <div className={`message-content max-w-xs ${message.sender === 'zain' ? 'bg-indigo-100' : 'bg-rose-100'} rounded-xl md:rounded-2xl p-2 md:p-3 ${message.sender === 'zain' ? 'rounded-tr-none' : 'rounded-tl-none'} floating-message`}>
                        {editMode ? (
                          <input
                            type="text"
                            value={message.text}
                            onChange={(e) => {
                              const newMessages = websiteData.messages.map(m => 
                                m.id === message.id ? {...m, text: e.target.value} : m
                              );
                              handleTextChange('messages', '', newMessages);
                            }}
                            className="w-full bg-transparent border-b border-dashed border-gray-400 floating-input text-sm md:text-base"
                          />
                        ) : (
                          <p className="text-gray-800 text-sm md:text-base">{message.text}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {message.timestamp?.toDate ? message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : message.timestamp}
                        </p>
                      </div>
                      
                      {message.sender === 'zain' && (
                        <div className="sender-avatar w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm md:text-base ml-2 flex-shrink-0 floating-avatar">
                          Z
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input */}
                <div className="message-input-container p-3 md:p-4 border-t border-rose-100 bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <div className="sender-toggle flex bg-rose-50 rounded-lg p-1 mr-2 md:mr-3">
                      <button
                        type="button"
                        className={`p-1 md:p-2 rounded-md text-xs md:text-sm font-medium ${currentSender === 'zain' ? 'bg-indigo-500 text-white' : 'text-indigo-500'} floating-button`}
                        onClick={() => setCurrentSender('zain')}
                      >
                        Zain
                      </button>
                      <button
                        type="button"
                        className={`p-1 md:p-2 rounded-md text-xs md:text-sm font-medium ${currentSender === 'kinza' ? 'bg-rose-500 text-white' : 'text-rose-500'} floating-button`}
                        onClick={() => setCurrentSender('kinza')}
                      >
                        Kinza
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-full py-1 md:py-2 px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent floating-input text-sm md:text-base"
                    />
                    
                    <button
                      type="submit"
                      className="ml-2 md:ml-3 p-2 md:p-3 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 floating-button"
                    >
                      <PaperAirplaneIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          {/* <footer className="footer bg-gradient-to-r from-rose-900 to-purple-900 text-white py-10 md:py-12">
            <div className="footer-container max-w-4xl mx-auto px-4 md:px-6 text-center">
              <div className="footer-hearts mb-4 md:mb-6 flex justify-center">
                <svg width="40" height="40" md:width="50" md:height="50" viewBox="0 0 100 100" className="footer-heart animate-pulse floating-icon">
                  <path
                    d="M50,25 C30,0 0,15 0,40 C0,55 50,90 50,90 C50,90 100,55 100,40 C100,15 70,0 50,25 Z"
                    fill="#fff"
                    opacity="0.8"
                  ></path>
                </svg>
              </div>
              <p className="footer-copyright text-base md:text-lg opacity-90 floating-text">
                © 2024 Kinza & Zain. Made with Love.
              </p>
              <div className="footer-links mt-4 md:mt-6 space-x-4 md:space-x-6">
                <a href="#" className="instagram-link hover:text-rose-300 transition-all duration-300 floating-text text-sm md:text-base">Instagram</a>
                <a href="#" className="facebook-link hover:text-rose-300 transition-all duration-300 floating-text text-sm md:text-base">Facebook</a>
                <a href="#" className="twitter-link hover:text-rose-300 transition-all duration-300 floating-text text-sm md:text-base">Twitter</a>
              </div>
            </div>
          </footer> */}

          {/* Save Button in Edit Mode */}
          {editMode && (
            <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50">
              <button
                onClick={saveWebsiteData}
                className="px-4 py-2 md:px-6 md:py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 flex items-center floating-button text-sm md:text-base"
              >
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      );
    };

    export default App;