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
                console.log(data.types[0].type.name);
            } catch (error) {
                console.error("Error fetching Pokemon Data:", error);
            }
        };

    fetchPokemonData();
    }, []);

	return (
		<>
        <h1>{id}</h1>
		<div className="PokemonPage">
			{pokemon ? (
                <p>
                    <strong>Pokedex Number:</strong> {pokemon.id} <br />
                    <strong>Type(s):</strong> {pokemon.types[0].type.name}, {pokemon.types[1].type.name}
                </p>
            ) : (
                <p>Loading...</p>   //displayed while data is being fetched
            )}
		</div>
		</>
	)
}

export default PokemonPage