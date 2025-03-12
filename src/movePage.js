// movePage.js
// By: Sam Schmitz

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function MovePage({ Pokedex }) {
    const id = useParams().id;
    const [move, setMove] = useState(null);

    useEffect(() => {
        const fetchMove = async () => {
            try {
                const data = await Pokedex.getMoveByName(id);
                setMove(data);
            } catch (error) {
                console.error("Error fetching Move Data:", error);
            }
        };

        fetchMove();
    }, []);

    return (
        <>
            <div className="Move Page" >
                <h1>{removeHyphen(id)}</h1>
                {move ? (
                    <>
                        <p>
                            <strong>Power:</strong> {move.power} <br />
                            <strong>Accuracy:</strong> {move.accuracy} <br />
                            <strong>Type:</strong> {capitalize(move.type.name)} <br />
                            <strong>Effect:</strong> {move.effect_entries[0].short_effect} <br />
                            <strong>Target:</strong> {removeHyphen(move.target.name)}
                        </p>
                    </>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </>
        )
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function removeHyphen(name) {
    return name.split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default MovePage
