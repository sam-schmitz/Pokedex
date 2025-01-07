import logo from './logo.svg';
import './App.css';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Homepage from './homepage.js'

function App() {

    

  return (
      <>
      <div classname="App">
        <Router>
            <Routes>
                <Route path='/Pokedex' element={<Homepage />} />
                <Route path='/pokemon' element={<p>Pokemon</p>} />
            </Routes>
        </Router>
      </div></>
  );
}

export default App;
