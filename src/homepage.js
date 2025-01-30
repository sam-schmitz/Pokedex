//homepage.js
//By: Sam Schmitz

import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';

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
    const pages = [
        {name: "Home", path: "/Pokedex"},
        {name: "charizard", path: "/Pokedex/pokemon/charizard"}
    ]

    const navigate = useNavigate();
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
    );
}

export default Homepage;
