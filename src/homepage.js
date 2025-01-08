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

            <h4>Pokemon of the Day:</h4>
			<Link to={`/Pokedex/pokemon/charizard`} className="DailyPokemon">
                <p>Charizard</p>
            </Link>
		</div>
		</>
	);
}

export default Homepage;
