// pokemonPage.js
// By: Sam Schmitz

import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';

function PokemonPage({Pokedex}) {
	const id = useParams().id;
    const [pokemon, setPokemon] = useState(null);   //state to store Pokemon data
    const [evolutions, setEvolutions] = useState(null); //list of evolution chains

	useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                const data = await Pokedex.getPokemonByName(id);
                const speciesData = await Pokedex.getPokemonSpeciesByName(id);

                //Get Pokemon Image URL
                const imageUrl = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;

                //Process Evolution Details
                const evolutionChainId = speciesData.evolution_chain.url.split("/").slice(-2, -1)[0];
                const evolutionData = await Pokedex.getEvolutionChainById(evolutionChainId);
                const evolutionString = extractEvolutionNames(evolutionData.chain);
                //console.log(evolutionString);

                //update state with the fetched data
                setPokemon({ ...data, imageUrl });
                setEvolutions(evolutionString);
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
                    <>
                        <img src={pokemon.imageUrl} alt={pokemon.name} width="200" />
                        <p>
                            <strong>Pokedex Number:</strong> {pokemon.id} <br />
                            <strong>Type(s):</strong> {pokemon.types.map((t) => t.type.name).join(", ")}
                        </p>
                    </>
                ) : (
                        <p>Loading...</p>   //displayed while data is being fetched
            )}
                {evolutions ? (<p>
                    <strong>Evolution Chain:</strong><br />
                    {evolutions} </p>
                ) : (<p>
                    "Loading..."
                </p>)}
		</div>
		</>
	)
}

function extractEvolutionNames(chain) {
    const names = [chain.species.name];

    if (chain.evolves_to.length > 0) {
        const evolutions = chain.evolves_to.map(extractEvolutionNames);
        names.push(`${evolutions.join(" / ")}`);
    }

    return names.join(" => ")
}

export default PokemonPage