// movePage.js
// By: Sam Schmitz

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoHomeButton, capitalize, removeHyphen } from "./widgets.js";

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
                <GoHomeButton />
            </div>
        </>
        )
}

export default MovePage
