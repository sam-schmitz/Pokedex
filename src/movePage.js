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
                <h1>{id}</h1>
                {move ? (
                    <>
                        <p>
                            <strong>Power:</strong> {move.power} <br />
                            <strong>Accuracy:</strong> {move.accuracy} <br />
                            <strong>Type:</strong> {move.type.name}
                        </p>
                    </>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </>
        )
}

export default MovePage
