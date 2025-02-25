// pokemonPage.js
// By: Sam Schmitz

import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';

function PokemonPage({Pokedex}) {
	const id = useParams().id;
    const [pokemon, setPokemon] = useState(null);   //state to store Pokemon data
    const [evolutions, setEvolutions] = useState([]); //list of evolution chains

	useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                const data = await Pokedex.getPokemonByName(id);
                const speciesData = await Pokedex.getPokemonSpeciesByName(id);
                const evolutionChainId = speciesData.evolution_chain.url.split("/").slice(-2, -1)[0];
                const evolutionData = await Pokedex.getEvolutionChainById(evolutionChainId);
                const evolutionString = extractEvolutionNames(evolutionData.chain);
                console.log(evolutionString);
                setPokemon(data);   //update state with the fetched data

                //turn the chain in evolutionData to an array with the names of the evolutions
                /*
                const evoChain = [];
                for i in evoData:

                */
                setEvolutions(evolutionData);
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
                        <strong>Type(s):</strong> {pokemon.types.map((t) => t.type.name).join(", ")}
                </p>
            ) : (
                <p>Loading...</p>   //displayed while data is being fetched
            )}
                <p>
                    <strong>Evolution Chain:</strong>{" "}
                    {evolutions.length > 0 ? evolutions.join(", ") : "Loading..."}
                </p>
		</div>
		</>
	)
}

function extractEvolutionNames(chain, names = []) {
    names.push(chain.species.name);

    if (chain.evolves_to.length > 0) {
        extractEvolutionNames(chain.evolves_to[0], names);
    }

    return names
}

export default PokemonPage