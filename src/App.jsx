import StartPage from './StartPage';
import { useEffect } from 'react';
import { LanguageProvider } from './LanguageContext';

function App() {
  useEffect(() => {
    // Extract category from URL path
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(segment => segment);
    
    // Get the first segment as category (hotels, flights, etc.)
    const category = pathSegments[0];
    
    if (category) {
      // Capitalize first letter
      const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      document.title = `${capitalizedCategory} - Registration`;
    } else {
      document.title = 'Registration';
    }
  }, []);

  return (
    <div className="App">
      <LanguageProvider>
        <StartPage />
      </LanguageProvider>
    </div>
  );
}

export default App;