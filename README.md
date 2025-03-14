<h1>Pokedex</h1>
<p><b>Description: </b>A pokedex expressed via a react app. Api provided via PokeAPI and pokeapi-js-wrapper. Currently shows has a page for each pokemon which contains their type, evolutions, and moveset. </p>

<h2>Project Elements: </h2>
<ul>
  <li>
    <h4>Homepage</h4>
    <p><b>Description: </b>The landing page for the website. Contains a search bar with a custom fuzzy search for any pokemon in the pokedex. Also shows a random pokemon. </p>
    <p><b>Location: </b>src/homepage.js</p>
  </li>
  <li>
    <h4>Pokemon Page</h4>
    <p><b>Description: </b>Displays information about a pokemon. Currently shows the pokemon's type, evolution tree, moveset and an image of them. </p>
    <p><b>Location: </b>src/pokemonpage.js</p>
  </li>
  <li>
    <h4>App</h4>
    <p><b>Description: </b>A router for the app. Has endpoints for Homepage and Pokemon Page</p>
    <p><b>Location: </b>src/app.js</p>
  </li>
  <li>
    <h4>Display Pokemon</h4>
    <p><b>Description: </b>A button that links to a pokemon's page while displaying their name and image</p>
    <p><b>Location: </b>src/widgets.js</p>
  </li>
  <li>
    <h4>Go Home Button</h4>
    <p><b>Description: </b>A button that links back to the home page. Used within PokemonPage and MovePage. </p>
    <p><b>Location: </b>src/widgets.js</p>
  </li>
  <li>
    <h4>Scrollable Moves Table</h4>
    <p><b>Description: </b>Displays the moves a pokemon can use with a custom widget. Is scrollable and each row contains a link to the cooresponding move page. </p>
    <p><b>Location: </b>src/pokemonPage.js</p>
  </li>
</ul>
