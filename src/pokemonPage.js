// pokemonPage.js
// By: Sam Schmitz

import { Pokedex } from 'pokeapi-js-wrapper';
import React, {useState, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoHomeButton, DisplayPokemon } from "./widgets.js";

function PokemonPage({Pokedex}) {
    const { id } = useParams();
    const [pokemon, setPokemon] = useState(null);   //state to store Pokemon data
    const [evolutions, setEvolutions] = useState([]); //list of evolution chains
    const [moves, setMoves] = useState([]);

	useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                //reset state before fetching new data
                setPokemon(null);
                setEvolutions([]);
                setMoves([]);

                const data = await Pokedex.getPokemonByName(id);
                const speciesData = await Pokedex.getPokemonSpeciesByName(id);

                //Get Pokemon Image URL
                const imageUrl = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;

                //Process Evolution Details
                const evolutionChainId = speciesData.evolution_chain.url.split("/").slice(-2, -1)[0];
                const evolutionData = await Pokedex.getEvolutionChainById(evolutionChainId);
                const evolutionString = extractEvolutionNames(evolutionData.chain);
                //console.log(evolutionString);

                //extract move names
                const moveNames = data.moves.map((m) => m.move.name);

                //update state with the fetched data
                setPokemon({ ...data, imageUrl });
                setEvolutions(evolutionString);
                setMoves(moveNames);
            } catch (error) {
                console.error("Error fetching Pokemon Data:", error);
            }
        };

    fetchPokemonData();
    }, [id, Pokedex]);

	return (
		<>
        <h1>{capitalize(id)}</h1>
		<div className="PokemonPage">
                {pokemon ? (
                    <>
                        <img src={pokemon.imageUrl} alt={pokemon.name} width="200" />
                        <p>
                            <strong>Pokedex Number:</strong> {pokemon.id} <br />
                            <strong>Type(s):</strong> {pokemon.types.map((t) => capitalize(t.type.name)).join(", ")} <br />
                            <strong>Base Stats: </strong><br />
                            <strong>HP:</strong> {pokemon.stats[0].base_stat} <strong>Attack: </strong>{pokemon.stats[1].base_stat} <br />
                            <strong>Defense:</strong> {pokemon.stats[2].base_stat} <strong>Special Attack: </strong>{pokemon.stats[3].base_stat} <br />
                            <strong>Special Defense:</strong> {pokemon.stats[4].base_stat} <strong>Speed: </strong>{pokemon.stats[5].base_stat}
                        </p>
                    </>
                ) : (
                        <p>Loading...</p>   //displayed while data is being fetched
                )}
                <strong>Evolution Chain: </strong>
                <div className="container mt-3">
                    <div className="row row-cols-2 row-cols-md-4 g-3 justify-content-center">
                        {evolutions.length > 0 ? (
                            evolutions.map((name, index) => (
                                <div className="col text-center" key={index} >
                                    <DisplayPokemon name={name} Pokedex={Pokedex} />
                                </div>
                                ))
                        ) : (
                                <p>Loading...</p>
                        )}
                    </div>
                </div>
                <strong>Moves:</strong>
                {moves ? (    
                    <ScrollableMovesTable moves={moves} />
                ) : (
                    <p>Loading moves...</p>
                )}
                <GoHomeButton />
		</div>
		</>
	)
}

function ScrollableMovesTable({ moves }) {
    return (
        <>
            <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid black" }}>
                            <th style={{ textAlign: "left", padding: "8px" }}>Move Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {moves.length > 0 ? moves.map((move, index) => (
                            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                                <td style={{ padding: "8px" }}>
                                    <Link to={`/Pokedex/move/${move}`}>
                                        {removeHyphen(move)}
                                    </Link>
                                </td>
                            </tr>
                        )) : (
                            <tr><td>Loading moves...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
        )
}

function extractEvolutionNames(chain, names = []) {
    names.push(capitalize(chain.species.name));

    if (chain.evolves_to.length > 0) {
        chain.evolves_to.forEach(evo => extractEvolutionNames(evo, names));
    }

    return names;
}

function capitalize(str) { 
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function removeHyphen(name) {
    return name.split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default PokemonPage