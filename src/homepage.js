//homepage.js
//By: Sam Schmitz

import React, {useState, useEffect, useRef} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Fuse from "fuse.js";
import { DisplayPokemon } from "./widgets.js";

function Homepage({ Pokedex }) {
    const randomPokemon = Math.floor(Math.random() * 1025) + 1;

	return (
		<>
            <div className="homepage">
                <h1>Pokedex</h1>
                <h4>Find a Pokemon:</h4>
                <SearchWidget
                    Pokedex={Pokedex} />

                <h4>Random Pokemon:</h4>
                <DisplayPokemon
                    name={randomPokemon}
                    Pokedex={Pokedex}
                />
            </div>
		</>
	);
}

/* 
 * Old implementation for random pokemon
 {pokemon ? (
			    <Link to={`/Pokedex/pokemon/${pokemon}`} className="DailyPokemon">
                <p>{capitalize(pokemon)}</p>
                </Link>
            ) : (
                <p>Loading...</p>)}
 */

function SearchWidget({Pokedex}) {
    const [filterText, setFilterText] = useState('');
    

    return (
        <div className="seachwidget">
        <SearchBar Pokedex={Pokedex}/>
        </div>
    );
}

function SearchBar({Pokedex}) {
    const [query, setQuery] = useState('');
    const [pokemonList, setPokemonList] = useState([]);
    const [pages, setPages] = useState([{name: "Home", path: "/Pokedex"}]);

    const fuse = new Fuse(pages, {keys:["name"], threshold: 0.3});
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    useEffect(() => {
        const fetchPokemonList = async () => {
            try {
                const data = await Pokedex.getPokemonsList();
                setPokemonList(data.results);
            } catch (error) {
                console.error("Error fetching Pokemon List:", error);
            }
        }

    fetchPokemonList();
    }, [Pokedex]);

    useEffect(() => {
        if (pokemonList.length > 0) {
            setPages([
                {name: "Home", path: "/Pokedex"},
                ...pokemonList.map((pokemon) => ({
                    name: removeHyphen(pokemon.name), 
                    path: `\pokemon/${pokemon.name.toLowerCase()}`,
                }))
            ])
        }
    }, [pokemonList]);

    useEffect(() => {
        if (query) {
            setSuggestions(fuse.search(query).map((result) => result.item));
        } else {
            setSuggestions([]);
        }
        setSelectedIndex(-1);
    }, [query]);

    const handleSelect = (path) => {
        navigate(path);
        setQuery("")
        setSuggestions([]);
    }

    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 :prev));
        } else if (e.key === "ArrowUp") {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            handleSelect(suggestions[selectedIndex].path);
        } else if (e.key === "Escape") {
            setSuggestions([]);
        }
    };

    return (
        <div className="searchbar-container" style={{ position: "relative"}}>
            <input 
                ref={inputRef}
                type="text"
                value={query}
                placeholder="Search..."
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{width: "200px", padding: "8px" }}
            />
            {suggestions.length > 0 && (
                <ul className="dropdown" style={{
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    width: "100%",
                    background: "white",
                    border: "1px solid #ccc",
                    listStyle: "none",
                    padding: "0",
                    margin: "0",
                    zIndex: "1000"
                }}>
                    {suggestions.map((page, index) => (
                        <li
                            key={page.path}
                            onClick={() => handleSelect(page.path)}
                            style={{
                                padding: "8px",
                                cursor: "pointer",
                                background: index === selectedIndex ? "#ddd" : "white"
                            }}
                        >
                            {page.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function removeHyphen(name) {
    return name.split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default Homepage;
