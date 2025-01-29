//homepage.js
//By: Sam Schmitz

import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

function Homepage({Pokedex}) {
	const [pokemon, setPokemon] = useState(null);   //state to store Pokemon data

    useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                const data = await Pokedex.getPokemonByName("charizard");
                setPokemon(data);   //update state with the fetched data
            } catch (error) {
                console.error("Error fetching Pokemon Data:", error);
            }
        };

    fetchPokemonData();
    }, []);

	return (
		<>
		<div className="homepage">
			<h1>Pokedex</h1>
            <h4>Find a Pokemon:</h4>
            <SearchWidget />

            <h4>Pokemon of the Day:</h4>
			<Link to={`/Pokedex/pokemon/charizard`} className="DailyPokemon">
                <p>Charizard</p>
            </Link>
		</div>
		</>
	);
}

function SearchWidget() {
    const [filterText, setFilterText] = useState('');

    return (
        <div className="seachwidget">
        <SearchBar
            filterText={filterText}
            onFilterTextChange={setFilterText} />
        </div>
    );
}

function SearchBar({filterText, onFilterTextChange}) {
    return (
        <form className="searchbar">
            <input
                type="text"
                value={filterText} placeholders="Search..."
                onChange={(e) => onFilterTextChange(e.target.value)} />
        </form>
    );
}

export default Homepage;
