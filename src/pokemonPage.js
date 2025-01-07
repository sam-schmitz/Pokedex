// pokemon.js
// By: Sam Schmitz

import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';

function PokemonPage({Pokedex}) {
	const id = useParams().id;
    const [pokemon, setPokemon] = useState(null);   //state to store Pokemon data

	useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                const data = await Pokedex.getPokemonByName(id);
                setPokemon(data);   //update state with the fetched data
            } catch (error) {
                console.error("Error fetching Pokemon Data:", error);
            }
        };

    fetchPokemonData();
    }, []);

	return (
		<>
		<div className="PokemonPage">
			{pokemon ? (
                <p>
                    {pokemon.name}
                </p>
            ) : (
                <p>Loading...</p>   //displayed while data is being fetched
            )}
		</div>
		</>
	)
}

export default PokemonPage