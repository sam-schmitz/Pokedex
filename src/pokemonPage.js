// pokemonPage.js
// By: Sam Schmitz

import React, {useState, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoHomeButton, DisplayPokemon, capitalize, removeHyphen, normalizeToPokeAPIName } from "./widgets.js";
import { Dropdown } from 'react-bootstrap';

// Hard codes the generation's number to a string containing the games in it
const generations = {   
    1: 'red-blue-yellow',
    2: 'gold-silver-crystal',
    3: 'ruby-sapphire-emerald-firered-leafgreen',
    4: 'diamond-pearl-platinum-heartgold-soulsilver',
    5: 'black-white-black-2-white-2',
    6: 'x-y-omega-ruby-alpha-sapphire',
    7: 'sun-moon-ultra-sun-ultra-moon',
    8: 'brilliant-diamond-and-shining-pearl',
    9: 'scarlet-violet'
};
function PokemonPage({Pokedex}) {
    const { id } = useParams(); // The name of the pokemon (retrieved from the url)
    const [pokemon, setPokemon] = useState(null);   //state to store Pokemon data
    const [species, setSpecies] = useState(null);   //contains more pokemon data        
    const [legendary, setLegendary] = useState(null);
    const [flavorText, setFlavorText] = useState(null);    
    const [generation, setGeneration] = useState('scarlet-violet')

	useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                // reset state before fetching new data
                setPokemon(null);                                                                              
                setLegendary(null);                

                // Fetch pokemon data from the api
                const data = await Pokedex.getPokemonByName(id);                

                // fetch species data (whole pokemon's family including evolutions)
                let speciesData;                
                try {
                    speciesData = await Pokedex.getPokemonSpeciesByName(id);
                } catch (error) {
                    if (error?.response.status === 404) {                        
                        // handle error caused when a variant's species data is looked for
                        // instead find the base pokemon's species
                        const { base, suffix } = splitFormSuffix(id);
                        speciesData = await Pokedex.getPokemonSpeciesByName(base);
                    } else {
                        console.error("Error fetching species: ", error);
                    }
                }                

                //Get Pokemon Image URL
                const imageUrl = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;

                //Process Evolution Details
                const evolutionArray = await generateEvolutionString(speciesData, data.name);                

                //extract data from species
                const legendarity = legend(speciesData);
                const englishFlavorText = extractFlavorText(speciesData.flavor_text_entries);                

                //extract move names                
                let movesByGen = sortGenerationMoves(data.moves)               

                // use the pokemon's type to find it's advantages and weaknesses
                const typeNames = data.types.map((t) => t.type.name);                
                const { weaknesses, resistances, immunities } = await fetchTypeAdvantages(typeNames);                

                // find the locations a pokemon could be encountered in
                //currently unused
                let encounters = [];
                /*await Pokedex.resource([
                    data.location_area_encounters
                ]).then(function (response) {
                    encounters = response
                })                   
                console.log(encounters[0]);*/


                // Update Species with the pokemon data
                const variety = speciesData.varieties.find(
                    (v) => v.pokemon.name === id
                );
                variety.pokemon = { ...data, imageUrl, evolutionArray, weaknesses, resistances, immunities, movesByGen, encounters };

                //update state with the fetched data                
                setPokemon({ ...data, imageUrl, evolutionArray, weaknesses, resistances, immunities, movesByGen, encounters });
                setSpecies(speciesData);                                
                setLegendary(legendarity);
                setFlavorText(englishFlavorText);
            } catch (error) {
                console.error("Error fetching Pokemon Data:", error);
            }
        };

    fetchPokemonData();
    }, [id]);
    async function generateEvolutionString(speciesData, currentFormName) {
        // Creates an array contiaining a pokemon's evolutionary line
        function formSuffix(formName) {
            // Returns the region of the regional variant if there is one
            const match = formName.match(/-(alola|galar|hisui|paldea)/i);
            return match ? match[1].toLowerCase() : null;
        }

        function collectSpeciesNames(chain, names = []) {
            // Creates an array of the names of each pokemon from the evolution chain retrieved from the api
            names.push(chain.species.name);
            for (const evo of chain.evolves_to) {
                collectSpeciesNames(evo, names);
            }
            return names;
        }

        const suffix = formSuffix(currentFormName);

        // Finds the evolution chain of the pokemon and converts it to an array
        const evolutionChainId = speciesData.evolution_chain.url.split("/").slice(-2, -1)[0];
        const evolutionData = await Pokedex.getEvolutionChainById(evolutionChainId);
        const speciesNames = collectSpeciesNames(evolutionData.chain);

        // Finds all of the evolutions of a pokemon based on it's regional variant (if one exists)
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
    function sortGenerationMoves(moves) {   
        // Finds the moves the pokemon can learn in a generation of games
        
        let m = []; // Array to contain the filtered moves
        for (let i = 0; i < moves.length; i++) {          // i -> a move 
            
            for (let j = 0; j < moves[i].version_group_details.length; j++) {   // j -> the version details within a move

                if (generation.includes(moves[i].version_group_details[j].version_group.name)) {    // if the version is in the generation

                    // build an array to store the data we want about the move
                    let moveData = [moves[i].move.name];

                    // Find the method in which the pokemon learns the move
                    if (moves[i].version_group_details[j].move_learn_method.name !== "level-up") {
                        moveData.push(capitalize(moves[i].version_group_details[j].move_learn_method.name));
                    } else {
                        moveData.push(moves[i].version_group_details[j].level_learned_at);
                    }

                    moveData.push(moves[i].version_group_details[j].version_group.name);                    

                    m.push(moveData);   

                    continue;   //there are multiple games in a generation, we don't want to count the moves twice
                }             
            }
        }
        
        return m.sort((a, b) => {   // sorts the moves in the order (level up moves, other methods)
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

    const fetchTypeAdvantages = async (typeNames) => {
        try {
            // typeNames = the names of the types of the pokemon

            let weakSet = new Set();
            let resistSet = new Set();
            let immuneSet = new Set();

            for (const type of typeNames) {
                // pull data about the type from the api
                const typeData = await Pokedex.getTypeByName(type);

                // add the weaknesses, resistances, and immunities to their propper sets
                typeData.damage_relations.double_damage_from.forEach(t => weakSet.add(t.name));
                typeData.damage_relations.half_damage_from.forEach(t => resistSet.add(t.name));
                typeData.damage_relations.no_damage_from.forEach(t => immuneSet.add(t.name));
            }

            // remove resistances from weaknesses (if both exist it's neutral damage)
            weakSet = new Set([...weakSet].filter(t => !resistSet.has(t)));            

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
        // handles clicks on a pokemon's variations

        if (species.varieties[index].pokemon.abilities) {

            // variety already has data stored
            setPokemon(species.varieties[index].pokemon);           
            
        } else {

            setPokemon(null);
            const id = species.varieties[index].pokemon.name;
            const data = await Pokedex.getPokemonByName(id);

            const imageUrl = data.sprites.other["official-artwork"].front_default || data.sprites.front_default;

            // Generate new evolution string
            const evolutionArray = await generateEvolutionString(species, data.name);   

            // Find new type matchups
            const typeNames = data.types.map((t) => t.type.name);
            const { weaknesses, resistances, immunities } = await fetchTypeAdvantages(typeNames);

            // Find the correct moves by generation
            let movesByGen = sortGenerationMoves(data.moves)               

            // currently unused encounter locations data
            let encounters = []
            /*let encounters;
            await Pokedex.resource([
                data.location_area_encounters
            ]).then(function (response) {
                encounters = response
            })*/

            // Update the pokemon state
            setPokemon({ ...data, imageUrl, evolutionArray, weaknesses, resistances, immunities, movesByGen, encounters });               

            // Update Species using a copy of species
            const updatedSpecies = { ...species };            
            updatedSpecies.varieties[index].pokemon = { ...data, imageUrl, evolutionArray, weaknesses, resistances, immunities, movesByGen, encounters };

            // use the updated species to update the species state
            setSpecies(updatedSpecies);
        }

    }

    useEffect(() => {
        // activates when the generation is updated
        if (generation !== null && pokemon !== null) {            
            // ensure that pokemon has been found before trying to update using that data

            let moves = sortGenerationMoves(pokemon.moves);

            // Create and use a copy to update the pokemon state
            const updatedPokemon = { ...pokemon };
            updatedPokemon.movesByGen = moves;
            setPokemon(updatedPokemon);
        }
    }, [generation]);

	return (
        <>
            { pokemon ? (
                <h1>{removeHyphen(normalizeToPokeAPIName(pokemon.name))}</h1>
            ) : (
                <h1>{removeHyphen(normalizeToPokeAPIName(id)) }</h1>
            )}        
            {legendary && (
                <h4>{legendary}</h4>
            )}
            {species?.genera?.[7] && (
                <h4>The {species.genera[7].genus}</h4>
            )}
            {(species?.varieties.length > 1) && (
                <>
                    <h5 className="mt-3">Forms: </h5>
                    <div className="d-flex justify-content-center flex-wrap gap-2 mt-2">
                        {species.varieties.map((variety, index) => (
                            <button
                                key={index }
                                onClick={() => handleClick(index)}
                                className="btn btn-outline-primary"
                            >
                                {removeHyphen(normalizeToPokeAPIName(variety.pokemon.name))}
                            </button>
                        ))}
                    </div>
                </>
            ) }
            <div className="PokemonPage">
                <div className="container mt-3">
                    <div className="row">
                        <div className="col-sm-6 col-md-4 justify-content-center">
                            <PokemonImage
                                pokemon={pokemon}
                                flavorText={flavorText }
                            />                           
                        </div>
                        <div className="col-sm-6 col-md-4 justify-content-center">
                            <PokemonStats
                                pokemon={pokemon }
                            />                            
                        </div>
                        <div className="col-md-4">
                            <EvolutionCards
                                pokemon={pokemon}
                                Pokedex={Pokedex }
                            />                            
                        </div>
                    </div>
                    <div className="row py-0">
                        <GenerationSelector
                            generation={generation}
                            setGeneration={setGeneration }
                        />
                        
                    </div>
                    <div className="row py-0" >
                        <div >
                            <strong>Moves:</strong>
                            {pokemon ? (
                                <ScrollableMovesTable moves={pokemon.movesByGen} />
                            ) : (
                                <p>Loading moves...</p>
                            )}
                        </div>                     
                    </div>
                </div>                                                
                
                <GoHomeButton />
		    </div>
		</>
	)
}

function PokemonImage({ pokemon, flavorText }) {
    // Displays an image of the Pokemon and some flavor text

    return (
        <>
            {pokemon ? (
                <>
                    <img src={pokemon.imageUrl} alt={pokemon.name} width="200" />
                    <p><strong>Description:</strong> {removeArrow(flavorText)}</p>
                </>
            ) : (
                <p>Loading Image...</p>
            )}
        </>
    )
}
function PokemonStats({ pokemon }) {
    // Displays the stats of the pokemon

    return (
        <>
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
        </>
    )
}
function EvolutionCards({ pokemon, Pokedex }) {
    // Displays the evolutions of the pokemon
    return (
        <>
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
        </>
    )
}
function GenerationSelector({ generation, setGeneration}) {
    // Allows the user to change the generation being displayed

    const handleSelect = (value, label) => {
        // Handles the selection made in the select generations drop down
        setGeneration(value);
    }

    return (
        <>
            <div className="d-flex py-0">
                <div className="ms-auto py-0">
                    <div className="d-flex align-items-center py-0">
                        <strong className="me-2 py-0">Select Generation:</strong>
                        <Dropdown className="my-3 py-0" >
                            <Dropdown.Toggle
                                id="generation-dropdown"
                                className="p-1 px-2 border-0"
                            >
                                {Object.entries(generations).find(
                                    ([_, value]) => value === generation
                                )?.[0]}
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="py-0">
                                {Object.entries(generations).map(([genNumber, versionString]) => {
                                    const label = `Gen ${genNumber}`;
                                    return (
                                        <Dropdown.Item
                                            key={genNumber}
                                            onClick={() => handleSelect(versionString, label)}
                                        >
                                            {label}
                                        </Dropdown.Item>
                                    );
                                })}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </>
    )
}

function ScrollableMovesTable({ moves }) {
    // scrollable table that displays data about each move

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
function LocationTable({ encounters }) {
    // currently not implemented
    // Displays data about each location a pokemon could spawn in

    return (
        <>
            <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid black" }}>
                            <th style={{ textAlign: "left", padding: "8px" }}>Area Name</th>
                            <th style={{ textAlign: "left", padding: "8px" }}>Version(s)</th>
                        </tr>                    
                    </thead>
                    <tbody>
                        {encounters.length > 0 ? encounters[0].map((entry, index) => (
                            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                                <td style={{ padding: "8px" }}>
                                    {removeHyphen(entry.location_area.name)}
                                </td>
                                <td style={{ padding: "8px" }}>
                                    {entry.version_details.map((entry, index) => (
                                    removeHyphen(entry.version.name) + " "
                                    ))}
                                </td>
                            </tr>
                        )) : (
                            <tr><td>Loading encounters</td></tr>

                        ) }
                    </tbody>
                </table>
            </div>
        </>
    )
}

function legend(speciesData) {
    // Finds if a pokemon is legendary or mythical

    if (speciesData.is_legendary === true) {
        return "Legendary";
    } else if (speciesData.is_mythical === true) {
        return "Mythical";
    } else {
        return null;
    }
}

function extractFlavorText(entries) {    
    // pulls the engilsh flavor text

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
    // seperates a pokemon's name from it's variant suffix
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