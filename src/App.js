import React from 'react';
import BaseballBuddy from './components/BaseballBuddy';
import BaseballBuddyV2 from './components/BaseballBuddyV2';
import { useState } from 'react';

function App() {
  // return (
  //   <div className="App">
  //     <BaseballBuddy />
  //   </div>
  // );
  const [viewVersion, setViewVersion] = useState('v1');

  return (
    <div>
      <button 
        onClick={() => setViewVersion(viewVersion === 'v1' ? 'v2' : 'v1')}
        className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Switch to {viewVersion === 'v1' ? 'V2' : 'V1'}
      </button>

      {viewVersion === 'v1' ? <BaseballBuddy /> : <BaseballBuddyV2 />}
    </div>
  );
}

export default App;