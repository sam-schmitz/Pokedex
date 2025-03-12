// widgets.js
// By: Sam Schmitz

import { Link } from 'react-router-dom';

export function GoHomeButton() {
    return (
        <>
            <Link to={`/Pokedex/`}>
                Home
            </Link>
        </>
    )
}
