import React, { useState, useEffect } from 'react';
import BaseballBuddy from './components/BaseballBuddy';
import LandingPage from './components/LandingPage';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Firebase config
const firebaseConfig = {
  // Add your Firebase config here from your Firebase project settings
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// console.log('Firebase Config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Effect running');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user); 
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img 
            src={user.photoURL} 
            alt={user.displayName} 
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm text-gray-700">{user.displayName}</span>
        </div>
        <button 
          onClick={() => auth.signOut()}
          className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
        >
          Sign Out
        </button>
      </div>

      <BaseballBuddy user={user} />
    </div>
  );
}

export default App;