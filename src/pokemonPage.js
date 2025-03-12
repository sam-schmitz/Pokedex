// pokemonPage.js
// By: Sam Schmitz

import React, {useState, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';

function PokemonPage({Pokedex}) {
	const id = useParams().id;
    const [pokemon, setPokemon] = useState(null);   //state to store Pokemon data
    const [evolutions, setEvolutions] = useState(null); //list of evolution chains
    const [moves, setMoves] = useState([]);

	useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                const data = await Pokedex.getPokemonByName(id);
                const speciesData = await Pokedex.getPokemonSpeciesByName(id);
                console.log(data);

                //Get Pokemon Image URL
                const imageUrl = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;

                //Process Evolution Details
                const evolutionChainId = speciesData.evolution_chain.url.split("/").slice(-2, -1)[0];
                const evolutionData = await Pokedex.getEvolutionChainById(evolutionChainId);
                const evolutionString = extractEvolutionNames(evolutionData.chain);
                console.log(evolutionString);

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
    }, []);

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
                {evolutions ? (<p>
                    <strong>Evolution Chain:</strong><br />
                    {evolutions} </p>
                ) : (<p>
                    "Loading..."
                </p>)}
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

function extractEvolutionNames(chain) {
    const names = [capitalize(chain.species.name)];

    if (chain.evolves_to.length > 0) {
        const evolutions = chain.evolves_to.map(extractEvolutionNames);
        names.push(`${evolutions.join(" / ")}`);
    }

    return names.join(" => ")
}

function capitalize(str) { 
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function removeHyphen(name) {
    return name.split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function GoHomeButton() {
    return (
        <>
            <Link to={`/Pokedex/`}>
                Home
            </Link>
        </>
        )
}

export default PokemonPage