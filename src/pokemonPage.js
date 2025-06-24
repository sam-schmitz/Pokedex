// pokemonPage.js
// By: Sam Schmitz

import { Pokedex } from 'pokeapi-js-wrapper';
import React, {useState, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoHomeButton, DisplayPokemon, capitalize, removeHyphen } from "./widgets.js";

function PokemonPage({Pokedex}) {
    const { id } = useParams();
    const [pokemon, setPokemon] = useState(null);   //state to store Pokemon data
    const [evolutions, setEvolutions] = useState([]); //list of evolution chains
    const [moves, setMoves] = useState([]);
    const [weakneses, setWeaknesses] = useState([]);
    const [resistances, setResistances] = useState([]);
    const [immunites, setImmunities] = useState([]);
    const [legendary, setLegendary] = useState(null);

	useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                //reset state before fetching new data
                setPokemon(null);
                setEvolutions([]);
                setMoves([]);
                setWeaknesses([]);
                setResistances([]);
                setImmunities([]);
                setLegendary(null);

                const data = await Pokedex.getPokemonByName(id);
                const speciesData = await Pokedex.getPokemonSpeciesByName(id);
                console.log(speciesData);

                //Get Pokemon Image URL
                const imageUrl = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;

                //Process Evolution Details
                const evolutionChainId = speciesData.evolution_chain.url.split("/").slice(-2, -1)[0];
                const evolutionData = await Pokedex.getEvolutionChainById(evolutionChainId);
                const evolutionString = extractEvolutionNames(evolutionData.chain);
                const legendarity = legend(speciesData);
                //console.log(evolutionString);

                //extract move names
                //console.log(data.moves);
                //data.moves.map((m) => m.move.name)
                //console.log(data.moves.map((m) => [m.move.name, m.version_group_details[0].level_learned_at]));
                let moves = data.moves.map((m) => [m.move.name,
                    learnedBy(m)]);
                //console.log(moves);
                moves = sortMoves(moves);

                const typeNames = data.types.map((t) => t.type.name);
                fetchTypeAdvantages(typeNames);

                //update state with the fetched data
                setPokemon({ ...data, imageUrl });
                setEvolutions(evolutionString);
                setMoves(moves);
                setLegendary(legendarity);
            } catch (error) {
                console.error("Error fetching Pokemon Data:", error);
            }
        };

    fetchPokemonData();
    }, [id, Pokedex]);

    const fetchTypeAdvantages = async (typeNames) => {
        try {
            let weakSet = new Set();
            let resistSet = new Set();
            let immuneSet = new Set();

            for (const type of typeNames) {
                const typeData = await Pokedex.getTypeByName(type);

                typeData.damage_relations.double_damage_from.forEach(t => weakSet.add(t.name));
                typeData.damage_relations.half_damage_from.forEach(t => resistSet.add(t.name));
                typeData.damage_relations.no_damage_from.forEach(t => immuneSet.add(t.name));
            }

            //remove resistances from weaknesses (if both exist it's neutral damage)
            weakSet = new Set([...weakSet].filter(t => !resistSet.has(t)));

            setWeaknesses([...weakSet]);
            setResistances([...resistSet]);
            setImmunities([...immuneSet]);
        } catch (error) {
            console.error("Error fetching type data:", error);
        }
    };

	return (
		<>
        <h1>{removeHyphen(id)}</h1>
            {legendary && (
                <h4>{legendary}</h4>
            )}
            <div className="PokemonPage">
                <div className="container mt-3">
                    <div className="row">
                        <div className="col-sm-6 col-md-4 justify-content-center">
                            {pokemon ? (
                                <>
                                    <img src={pokemon.imageUrl} alt={pokemon.name} width="200" />
                                </>
                            ) : (
                                    <p>Loading Image...</p>
                            )}
                        </div>
                        <div className="col-sm-6 col-md-4 justify-content-center">
                            {pokemon ? (
                                <>                                
                                    <p>
                                        <strong>Pokedex Number:</strong> {pokemon.id} <br />
                                        <strong>Type(s):</strong> {pokemon.types.map((t) => capitalize(t.type.name)).join(", ")} <br />
                                        <strong>Weaknesses:</strong> {weakneses.map((t) => capitalize(t)).join(", ")} <br />
                                        <strong>Resistances:</strong> {resistances.map((t) => capitalize(t)).join(", ")} <br />
                                        {immunites.length > 0 && (
                                            <p><strong>Immunities:</strong> {immunites.map((t) => capitalize(t)).join(", ")} <br /></p>
                                        )}
                                        
                                        <strong>Base Stats: </strong><br />
                                        <strong>HP:</strong> {pokemon.stats[0].base_stat} <strong>Attack: </strong>{pokemon.stats[1].base_stat} <br />
                                        <strong>Defense:</strong> {pokemon.stats[2].base_stat} <strong>Special Attack: </strong>{pokemon.stats[3].base_stat} <br />
                                        <strong>Special Defense:</strong> {pokemon.stats[4].base_stat} <strong>Speed: </strong>{pokemon.stats[5].base_stat}
                                    </p>
                                </>
                            ) : (
                                <p>Loading...</p>   //displayed while data is being fetched
                            )}
                        </div>
                        <div className="col-md-4">
                            <strong>Evolution Chain: </strong>
                            <div className="row row-cols-3 g-3 justify-content-center">
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
                            <th style={{ textAlign: "left", padding: "8px" }}>Learned By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {moves.length > 0 ? moves.map((move, index) => (
                            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                                <td style={{ padding: "8px" }}>
                                    <Link to={`/Pokedex/move/${move[0]}`}>
                                        {removeHyphen(move[0])}
                                    </Link>
                                </td>
                                <td style={{ padding: "8px" }}>
                                    {move[1]}
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

function learnedBy(move) {
    if (move.version_group_details[0].move_learn_method.name === 'level-up') {
        return move.version_group_details[0].level_learned_at
    } else {
        return capitalize(move.version_group_details[0].move_learn_method.name)
    }
}

function sortMoves(moves) {
    return moves.sort((a, b) => {
        const methodA = a[1];
        const methodB = b[1];

        if (typeof methodA === "number" && typeof methodB === "number") {
            return methodA - methodB;
        }
        if (typeof methodA === "number") {
            return -1;
        }
        if (typeof methodB === "number") {
            return 1
        }
        return String(methodA).localeCompare(String(methodB));
    })
}

function extractEvolutionNames(chain, names = []) {
    names.push(capitalize(chain.species.name));

    if (chain.evolves_to.length > 0) {
        chain.evolves_to.forEach(evo => extractEvolutionNames(evo, names));
    }

    return names;
}

function legend(speciesData) {
    if (speciesData.is_legendary === true) {
        return "Legendary";
    } else if (speciesData.is_mythical === true) {
        return "Mythical";
    } else {
        return null;
    }
}

export default PokemonPage