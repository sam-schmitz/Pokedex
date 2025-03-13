// widgets.js
// By: Sam Schmitz

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function GoHomeButton() {
    return (
        <>
            <Link to={`/Pokedex/`}>
                Home
            </Link>
        </>
    )
}

export function DisplayPokemon({ name, Pokedex }) {
    const [pokemon, setPokemon] = useState(null);   //state to store Pokemon data

    useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                const data = await Pokedex.getPokemonByName(name);
                setPokemon(data);
                console.log(data);
            } catch (error) {
                console.error("Error fetching Pokemon Data:", error);
            }
        };

        fetchPokemonData();
    }, []);

    return (
        <>
            {pokemon ? (
                <Link to={`/Pokedex/pokemon/${pokemon}`} >
                    <p>{capitalize(pokemon.name)}</p>
                </Link>
            ) : (
                    <p>Loading...</p>
                    )}
            
        </>
        )
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
