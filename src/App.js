import './App.css';
import React, {useState, useEffect } from 'react';
import {BrowserRouter as Router, Route, Routes, useLocation} from 'react-router-dom';
import Homepage from './homepage.js'
import PokemonPage from './pokemonPage.js'
import MovePage from './movePage.js';

const Pokedex = require("pokeapi-js-wrapper");

function App() {
    const P = new Pokedex.Pokedex();

  return (
      <>
          <Router>
              <PageTitleUpdater />
              <div className="App">
                  <Routes>
                      <Route path='/Pokedex' element={
                          <Homepage
                              Pokedex={P}
                          />} />
                      <Route path='/Pokedex/pokemon/:id' element={
                          <PokemonPage
                              Pokedex={P}
                          />} />
                      <Route path='/Pokedex/move/:id' element={
                          <MovePage
                              Pokedex={P}
                          />} />
                  </Routes>
              </div>
          </Router>
      </>
  );
}

function PageTitleUpdater() {   //component to update tab title and favicon based on route
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === "/Pokedex") {
            document.title = "Pokedex - Home";
            updateFavicon("/favicon.ico");
        } else if (location.pathname.startsWith("/Pokedex/pokemon/")) {
            const pokemonName = location.pathname.split("/").pop();
            document.title = `${capitalize(pokemonName)} - Pokedex`;
        } else if (location.pathname.startsWith("/Pokedex/move/")) {
            const moveName = location.pathname.split("/").pop();
            document.title = `${removeHyphen(moveName)} - Pokedex`;
        }
    }, [location]);

    return null;    //This component only performs side effects
}

function updateFavicon(url) {   //helper function to update the favicon dynamically
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
        favicon.href = url;
    }
}


function capitalize(str) {  //Helper function used to capitalize pokemon and move names
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function removeHyphen(name) {
    return name.split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default App;
