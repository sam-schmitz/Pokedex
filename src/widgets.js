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
                //const speciesData = await Pokedex.getPokemonSpeciesByName(name);
                console.log(data);

                const imageUrl = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;


                setPokemon({ ...data, imageUrl });
            } catch (error) {
                console.error("Error fetching Pokemon Data:", error);
            }
        };

        fetchPokemonData();
    }, []);

    return (
        <>
            {pokemon ? (
                <Link to={`/Pokedex/pokemon/${pokemon.name}`} >                    
                    <img src={pokemon.imageUrl} alt={pokemon.name} width="100" />
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
