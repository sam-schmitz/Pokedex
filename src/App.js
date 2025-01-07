import './App.css';
import React, {useState, useEffect } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Homepage from './homepage.js'
import PokemonPage from './pokemonPage.js'

const Pokedex = require("pokeapi-js-wrapper");

function App() {
    const P = new Pokedex.Pokedex();

  return (
      <>
      <div className="App">
        <Router>
            <Routes>
                <Route path='/Pokedex' element={
                    <Homepage 
                    Pokedex={P}
                />} />
                <Route path='/Pokedex/pokemon/:id' element={
                    <PokemonPage 
                    Pokedex={P}
                />} />
            </Routes>
        </Router>
      </div></>
  );
}

export default App;
