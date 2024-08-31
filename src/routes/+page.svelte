<script lang="ts">
  import { onMount } from 'svelte';
  import { capitalize_name, fetch_all_pokemon_names, get_only_name, filter_pokemon} from '../helpers/helpers';
  import type { PokemonDisplay } from '../interfaces/allinterfaces';
  import { goto } from '$app/navigation';
  
  let artwork = "https://img.pokemondb.net/artwork/large/"
  let searchQuery = "";
  let all_pokemons: PokemonDisplay[] = [];
  let pokemonList: string[] = [];
  let results: string[] = [];
  let offset = 0;
  let loadingMore = false;
  let limit = 30;

  //Loads 905 Pokemon and some information
  async function fetch_all_pokemon() {
    if (all_pokemons.length == 900) { limit = 5; }
    if (all_pokemons.length == 905) return;
    if (loadingMore) return;
    loadingMore = true;

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    try {
        if (response.ok) {
            const data = await response.json();
            const newPokemons = await Promise.all(data.results.map(async (pokemon: any) => {

                try {
                    let all_images: string | undefined = "";
                    let get_name = pokemon.name;

                    get_name = get_only_name(get_name);

                    const get_data_for_images = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
                    if (get_data_for_images.ok) {
                        const image_data = await get_data_for_images.json();
                        const get_all_images = image_data.sprites.other?.['official-artwork']?.front_default;
                        if (get_all_images) {
                            all_images = get_all_images;
                        }
                    }

                    return {
                        name: capitalize_name(get_name),
                        number: pokemon.url.split('/').slice(-2, -1)[0],
                        artwork: all_images,
                        api_name: pokemon.name
                    }
                } catch (error) {
                    console.log(`Error fetching data for ${pokemon.name}:`, error);
                    return null;
                }
            }));

            // Filter out null values (which represent skipped Pokémon)
            all_pokemons = [...all_pokemons, ...newPokemons.filter(pokemon => pokemon !== null)];
            offset += limit;
            loadingMore = false;
            console.log(all_pokemons);
        }
    } catch (error) {
        console.log("Error with loading new Pokémon:", error);
    }
}

  function handle_click(name: string) {
    searchQuery = name.toLowerCase();
    goto(`/pokemon/${searchQuery}`);
  }

  function handle_scroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      fetch_all_pokemon();
    }
  }

  onMount(() => {
    (async () => {
      pokemonList = await fetch_all_pokemon_names();
    })();
    fetch_all_pokemon()
    window.addEventListener('scroll', handle_scroll);
    return () => window.removeEventListener('scroll', handle_scroll); // Cleanup on destroy
  });

</script>

<svelte:head>
  <title>Home</title>
</svelte:head>


<section class="Title">
  <h1>PokeSearch</h1>
  <h3 style="color: grey">Search for a Pokemon and its data!</h3>
</section>

<section class="searchbutton">
  <div class = "row">
  <input id="pokemon-search" type="text" bind:value={searchQuery} on:input={(event) => {
      // @ts-ignore
      const value = event.target.value;
      results = filter_pokemon(value, pokemonList);
    }
  }
  placeholder="Search for a Pokemon..." autocomplete = "off"> 
  </div>

  <div class = "result-box">
    {#if results.length > 0}
      <ul>
      {#each results as pokemon}
        <button on:click={() => handle_click(pokemon)}>
          <img src={artwork + pokemon + ".jpg"} alt={capitalize_name(get_only_name(pokemon)) + " artwork"}>
          <div class = "text">{capitalize_name(get_only_name(pokemon))}</div>
          <div class = "number">#{pokemonList.indexOf(pokemon)+1}</div>
        </button>
      {/each}
      </ul>
    {/if}
  </div>


</section>



<section class="allpokemon" id="homepage">
  {#each all_pokemons as pokemon}
    <button id="allpokemons" on:click={() => handle_click(pokemon.api_name)}>
      <img src={pokemon.artwork} alt="lol">
      <h1>{pokemon.name}</h1>
      <h1>Pokédex No: #{pokemon.number}</h1>
    </button>
  {/each}
</section>

<style>



  .allpokemon {
    gap: 30px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .allpokemon button {
    justify-content: center;
    background-color: white;
    width: 362px;
    gap: 20px;
    padding: 10px;
    border: 2px solid #000;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .allpokemon button:hover {
    transform: scale(1.05);
  }

  .allpokemon button img {
    max-width: 100%;
    max-height: 150px;
    margin-bottom: 10px;
  }

  .allpokemon h1 {
    color: black;
  }

  .Title h1 {
    color: black;
  }

  :global(body) {
    background-color: white;
    background-image: url("https://i.pinimg.com/736x/ab/58/cc/ab58cc75dcb2e42555cf7e614216350a.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
  }

  .Title {
    text-align: center;
  }

  .searchbutton {
    text-align: center;
  }

  .row {
  display:flex;
  align-items: center;
  padding: 10px 20px;

}




.result-box ul {
  border-top: 1px;
  padding: 15px 10px;
  border-color: black;
  border: white;
  width: 55%;
  margin-left: auto;
  margin-right: auto;
  border-radius: 25px;  
}

.result-box ul button {
  list-style: none;
  border-radius: 3px;
  padding: 15px 10px;
  cursor: pointer;
  color: black;
  border-color: black;
  height: 75%;
  width: 100%;
  background-color: white;
  display: flex;
  align-items: center;
}

.result-box ul button img {
  max-width: 100px;
  max-height: 100px;
  margin-left: 35px;
}

.result-box ul button .text {
  flex-grow: 1; 
  text-align: center; 
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-size: 40px;
}

.result-box ul button .number {
  margin-right: 80px;
  font-size: 20px
}

.result-box ul button:hover {
   background: rgb(218, 218, 244);
}


.searchbutton input {
  font-size: 30px;
  height: 50px;
  background: transparent;
  border: 0;
  outline: 0;
  color: #333;
  border: 1px solid black;
  text-align: center;
  width: 55%;
  margin-left: auto;
  margin-right: auto;
  height: 80px;
  
}

  
</style>



