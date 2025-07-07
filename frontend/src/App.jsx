import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    useEffect(() => {
        fetch('/api/hello')
            .then(response => response.text())
            .then(data => console.log(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);
    
    return <div>Check console for API response</div>
}

export default App
