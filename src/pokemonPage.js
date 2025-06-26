// pokemonPage.js
// By: Sam Schmitz

import { Pokedex } from 'pokeapi-js-wrapper';
import React, {useState, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoHomeButton, DisplayPokemon, capitalize, removeHyphen } from "./widgets.js";

function PokemonPage({Pokedex}) {
    const { id } = useParams();
    const [pokemon, setPokemon] = useState(null);   //state to store Pokemon data
    const [species, setSpecies] = useState(null);   //contains more pokemon data    
    const [moves, setMoves] = useState([]);
    const [weakneses, setWeaknesses] = useState([]);
    const [resistances, setResistances] = useState([]);
    const [immunites, setImmunities] = useState([]);
    const [legendary, setLegendary] = useState(null);
    const [flavorText, setFlavorText] = useState(null);
    const [variety, setVariety] = useState(0);

	useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                //reset state before fetching new data
                setPokemon(null);                
                setMoves([]);
                setWeaknesses([]);
                setResistances([]);
                setImmunities([]);
                setLegendary(null);
                setVariety(0);

                const data = await Pokedex.getPokemonByName(id);
                let speciesData;                
                try {
                    speciesData = await Pokedex.getPokemonSpeciesByName(id);
                } catch (error) {
                    if (error?.response.status === 404) {                        
                        const { base, suffix } = splitFormSuffix(id);
                        speciesData = await Pokedex.getPokemonSpeciesByName(base);
                    } else {
                        console.error("Error fetching species: ", error);
                    }
                }
                
                console.log(speciesData);

                //Get Pokemon Image URL
                const imageUrl = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;

                //Process Evolution Details
                const evolutionArray = await generateEvolutionString(speciesData, data.name);                

                //extract data from species
                const legendarity = legend(speciesData);
                const englishFlavorText = extractFlavorText(speciesData.flavor_text_entries);
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
                const { weaknesses, resistances, immunities } = await fetchTypeAdvantages(typeNames);                

                // Update Species with the pokemon data
                const variety = speciesData.varieties.find(
                    (v) => v.pokemon.name === id
                );
                variety.pokemon = { ...data, imageUrl, evolutionArray, weaknesses, resistances, immunities, moves };

                //update state with the fetched data                
                setPokemon({ ...data, imageUrl, evolutionArray, weaknesses, resistances, immunities, moves });
                setSpecies(speciesData);                
                setMoves(moves);
                setLegendary(legendarity);
                setFlavorText(englishFlavorText);
            } catch (error) {
                console.error("Error fetching Pokemon Data:", error);
            }
        };

    fetchPokemonData();
    }, [id, Pokedex]);
    async function generateEvolutionString(speciesData, currentFormName) {
        function formSuffix(formName) {
            const match = formName.match(/-(alola|galar|hisui|paldea)/i);
            return match ? match[1].toLowerCase() : null;
        }

        function collectSpeciesNames(chain, names = []) {
            names.push(chain.species.name);
            for (const evo of chain.evolves_to) {
                collectSpeciesNames(evo, names);
            }
            return names;
        }

        const suffix = formSuffix(currentFormName);

        const evolutionChainId = speciesData.evolution_chain.url.split("/").slice(-2, -1)[0];
        const evolutionData = await Pokedex.getEvolutionChainById(evolutionChainId);
        const speciesNames = collectSpeciesNames(evolutionData.chain);

        const result = [];

        for (const speciesName of speciesNames) {
            const species = await Pokedex.getPokemonSpeciesByName(speciesName);

            const match = species.varieties.find((v) =>
                suffix
                    ? v.pokemon.name.toLowerCase().includes(suffix)
                    : v.is_default
            );

            result.push(match?.pokemon.name || speciesName);
        }

        return result;
    }

    function normalizeToPokeAPIName(formName) {
        return formName
            .replace("-alola", "")
            .replace("-galar", "")
            .replace("-hisuian", "")
            .replace(/^(.*)$/, (_, name) => {
                if (formName.includes("-alola")) return `alolan-${name}`;
                if (formName.includes("-galar")) return `galarian-${name}`;
                if (formName.includes("-hisui")) return `hisuian-${name}`;
                return name;
            });
    }

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

            console.log({
                weaknesses: [...weakSet],
                resistances: [...resistSet],
                immunities: [...immuneSet]
            });
            return {
                weaknesses: [...weakSet],
                resistances: [...resistSet],
                immunities: [...immuneSet]
            };
        } catch (error) {
            console.error("Error fetching type data:", error);
        }
    };    

    const handleClick = async (index) => {
        if (species.varieties[index].pokemon.abilities) {
            // variety already has data stored
            setPokemon(species.varieties[index].pokemon);            
        } else {
            setPokemon(null);
            const id = species.varieties[index].pokemon.name;
            const data = await Pokedex.getPokemonByName(id);

            const imageUrl = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;

            // Update evolutions                        
            const evolutionArray = await generateEvolutionString(species, data.name);   

            const typeNames = data.types.map((t) => t.type.name);
            const { weaknesses, resistances, immunities } = await fetchTypeAdvantages(typeNames);

            let moves = data.moves.map((m) => [m.move.name,
            learnedBy(m)]);
            //console.log(moves);
            moves = sortMoves(moves);
            
            setPokemon({ ...data, imageUrl, evolutionArray, weaknesses, resistances, immunities, moves });               

            // Update Species
            const updatedSpecies = { ...species };
            //updatedSpecies.varieties = [...species.varieties];
            updatedSpecies.varieties[index].pokemon = { ...data, imageUrl, evolutionArray, weaknesses, resistances, immunities, moves };
            setSpecies(updatedSpecies);
        }

    }

	return (
        <>
            { pokemon ? (
                <h1>{removeHyphen(pokemon.name)}</h1>
            ) : (
                <h1>{ removeHyphen(id) }</h1>
            )}        
            {legendary && (
                <h4>{legendary}</h4>
            )}
            {species?.genera?.[7] && (
                <h4>The {species.genera[7].genus}</h4>
            )}
            {(species?.varieties.length > 1) && (
                <>
                    {species.varieties.map((variety, index) => (
                        <button
                            key={index }
                            onClick={() => handleClick(index)}
                        >
                            {variety.pokemon.name}
                        </button>
                    )) }
                </>
            ) }
            <div className="PokemonPage">
                <div className="container mt-3">
                    <div className="row">
                        <div className="col-sm-6 col-md-4 justify-content-center">
                            {pokemon ? (
                                <>
                                    <img src={pokemon.imageUrl} alt={pokemon.name} width="200" />
                                    <p><strong>Description:</strong> {removeArrow(flavorText)}</p>
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
                                        <strong>Weaknesses:</strong> {pokemon.weaknesses.map((t) => capitalize(t)).join(", ")} <br />
                                        <strong>Resistances:</strong> {pokemon.resistances.map((t) => capitalize(t)).join(", ")} <br />
                                        {pokemon.immunities.length > 0 && (
                                            <><strong>Immunities:</strong> {pokemon.immunities.map((t) => capitalize(t)).join(", ")} <br /></>
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
                                {pokemon ? (
                                    pokemon.evolutionArray.map((name, index) => (
                                        <div className="col text-center" key={name} >
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
                {pokemon ? (    
                    <ScrollableMovesTable moves={pokemon.moves} />
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

function legend(speciesData) {
    if (speciesData.is_legendary === true) {
        return "Legendary";
    } else if (speciesData.is_mythical === true) {
        return "Mythical";
    } else {
        return null;
    }
}

function extractFlavorText(entries) {    
    for (let entry of entries) {        
        if (entry.language.name === 'en') {
            return entry.flavor_text;
        }
    }
    return null;
}

function removeArrow(text) {
    return text.replace(/\f/g, " ");
}
function splitFormSuffix(name) {
    const match = name.match(/^(.*?)(-(alola|galar|hisui|paldea|mega|gigantamax))$/i);
    if (match) {
        return {
            base: match[1],     // e.g. "vulpix"
            suffix: match[2]    // e.g. "-alola"
        };
    }
    return {
        base: name,           // if no suffix
        suffix: null
    };
}

export default PokemonPage