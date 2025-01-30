//homepage.js
//By: Sam Schmitz

import React, {useState, useEffect, useRef} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Fuse from "fuse.js";

function Homepage({Pokedex}) {
	const [pokemon, setPokemon] = useState(null);   //state to store Pokemon data

    useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                const data = await Pokedex.getPokemonByName("charizard");
                setPokemon(data);   //update state with the fetched data
            } catch (error) {
                console.error("Error fetching Pokemon Data:", error);
            }
        };

    fetchPokemonData();
    }, []);

	return (
		<>
		<div className="homepage">
			<h1>Pokedex</h1>
            <h4>Find a Pokemon:</h4>
            <SearchWidget />

            <h4>Pokemon of the Day:</h4>
			<Link to={`/Pokedex/pokemon/charizard`} className="DailyPokemon">
                <p>Charizard</p>
            </Link>
		</div>
		</>
	);
}

function SearchWidget() {
    const [filterText, setFilterText] = useState('');

    return (
        <div className="seachwidget">
        <SearchBar
            query={filterText}
            setQuery={setFilterText} />
        </div>
    );
}

function SearchBar({query, setQuery}) {
    const pmon = ["Charizard", "Venusaur", "Blastoise", "Pikachu"];
    const pages = [
        {name: "Home", path: "/Pokedex"},
        ...pmon.map((name) => ({
            name,
            path: `\pokemon/${name.toLowerCase()}`,
        }))
    ]

    const fuse = new Fuse(pages, {keys:["name"], threshold: 0.3});
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const navigate = useNavigate();
    const inputRef = useRef(null);

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
    /*
    const handleSearch = (e) => {
        e.preventDefault();
        const match = pages.find((page) =>
            page.name.toLowerCase().includes(query.toLowerCase())
        );
        if (match) {
            navigate(match.path);
            setQuery("");
        }
    };  
    
    return (
        <form className="searchbar"
        onSubmit={handleSearch} >
            <input
                type="text"
                value={query} placeholder="Search..."
                onChange={(e) => setQuery(e.target.value)}
                list="search-options" />
            <datalist  id="search-options">
                {pages.map((page) => (
                    <option key={page.path} value={page.name} />
                ))}
            </datalist>
            <button type="submit">Go</button>
        </form>
    ); */
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

export default Homepage;
