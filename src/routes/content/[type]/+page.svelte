<script lang="ts">
    import { page } from '$app/stores';
    import {goto} from '$app/navigation'
    import { onMount } from 'svelte';
    import {capitalize_name, get_only_name} from '../../../helpers/helpers'
    import type {PokemonDisplay} from "../../../interfaces/allinterfaces"
    import all_types from '../../../all_types.json'
    import Loader from "../../Loader.svelte"

    let all_pokemons: PokemonDisplay[] = [];
    let offset = 0;
    let loadingMore = false;
    let limit = 905;
    let loading_screen = true;

    interface TypeData {
        generation: string
        id: number
        move_damage_class: string
    }

    let type_data: TypeData = {
        generation: "",
        id: 0,
        move_damage_class: ""
    }

    const type = $page.params.type;

    function get_gen_number(data: any){
        const url_split = data.generation.url.split('/')
        return url_split[url_split.length - 2]
    }

    async function get_type_data() {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        if (response.ok) {
            const data = await response.json();
            type_data.generation = "Gen" + " " + get_gen_number(data)
            type_data.id = data.id
            try {
                type_data.move_damage_class = capitalize_name(data.move_damage_class.name);
            }
            catch (error) {
                console.log("no")
            }
        }
        loading_screen = false;
    }

    async function fetch_all_pokemon() {
    if (all_pokemons.length == 900) { limit = 5; }
    if (all_pokemons.length == 905) return;
    if (loadingMore) return;
    loadingMore = true;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        if (response.ok) {
            const data = await response.json();
            const newPokemons = await Promise.all(data.results.map(async (pokemon) => {
                try {
                    let all_images = "";
                    let get_name = pokemon.name;

                    get_name = get_only_name(get_name);

                    const get_data_for_images = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
                    if (get_data_for_images.ok) {
                        const image_data = await get_data_for_images.json();
                        
                        // Check if the Pokémon has the specified type
                        const get_pokemon_with_type = image_data.types.some((typeInfo) => typeInfo.type.name === type);
                        if (!get_pokemon_with_type) {
                            return null;
                        }

                        // Check if the Pokémon's number is greater than 905
                        const number = parseInt(pokemon.url.split('/').slice(-2, -1)[0]);
                        if (number > 905) {
                            return null;
                        }

                        const get_all_images = image_data.sprites.other?.['official-artwork']?.front_default;
                        if (get_all_images) {
                            all_images = get_all_images;
                        }

                        return {
                            name: capitalize_name(get_name),
                            number: number,
                            artwork: all_images,
                            api_name: pokemon.name
                        };
                    } else {
                        return null;
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

  function handle_scroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      fetch_all_pokemon();
    }
  }

  function handle_click(name: string) {
    goto(`/pokemon/${name.toLowerCase()}`);
  }

  

    onMount(() => {
        fetch_all_pokemon();
        get_type_data();
        window.addEventListener('scroll', handle_scroll);
        return () => window.removeEventListener('scroll', handle_scroll); // Cleanup on destroy
    });


</script>

{#if loading_screen}
    <Loader loading/>
{:else}

<div class="info-table">
    <img src="../../../types/{type}.svg" alt={type}>
    <!-- <h1>{capitalize_name(type)}</h1> -->
    <table>
        <tr>
            <td>Generation Introduced:</td>
            <td>{type_data.generation}</td>
        </tr>
        <tr>
            <td>Type ID:</td>
            <td>{type_data.id}</td>
        </tr>
        <tr>
            <td>Primary Move Damage Class:</td>
            {#if type_data.move_damage_class}
                <td>{type_data.move_damage_class}</td>
            {:else}
                <td>None</td>
            {/if}
        </tr>
    </table>
</div>

<div class="row" style="margin-top: 50px;">
    <div class="column" style="gap: 20px">
        <h1 style="color: black">Defensive Properties of {capitalize_name(type)}</h1>
        <table>
            <tr>
                <td>Weak To (2x)</td>
                <td>
                    {#if all_types[type].defense.double.length > 0}
                        {#each all_types[type].defense.double as type}
                            <img src="../../../types/{type}.svg" alt={type}>
                        {/each}
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
            <tr>
                <td>Strong Against (1/2x):</td>
                <td>
                    {#if all_types[type].defense.half.length > 0}
                        {#each all_types[type].defense.half as type}
                            <img src="../../../types/{type}.svg" alt={type}>
                        {/each}
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
            <tr>
                <td>Normal To (1x):</td>
                <td>
                    {#if all_types[type].defense.normal.length > 0}
                        {#each all_types[type].defense.normal as type}
                            <img src="../../../types/{type}.svg" alt={type}>
                        {/each}
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
            <tr>
                <td>Immune To (0x):</td>
                <td>
                    {#if all_types[type].defense.zero.length > 0}
                        {#each all_types[type].defense.zero as type}
                            <img src="../../../types/{type}.svg" alt={type}>
                        {/each}
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
        </table>
    </div>
    <div class="column">
        <h1>Offensive Properties of {capitalize_name(type)}</h1>
        <table>
            <tr>
                <td>Super Effective Against (2x):</td>
                <td>
                    {#if all_types[type].attack.double.length > 0}
                        {#each all_types[type].attack.double as type}
                            <img src="../../../types/{type}.svg" alt={type}>
                        {/each}
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
            <tr>
                <td>Not Very Effective Against (1/2x):</td>
                <td>
                    {#if all_types[type].attack.half.length > 0}
                        {#each all_types[type].attack.half as type}
                            <img src="../../../types/{type}.svg" alt={type}>
                        {/each}
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
            <tr>
                <td>Normal to (1x):</td>
                <td>
                    {#if all_types[type].attack.normal.length > 0}
                        {#each all_types[type].attack.normal as type}
                            <img src="../../../types/{type}.svg" alt={type}>
                        {/each}
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
            <tr>
                <td>No Damage To (0x):</td>
                <td>
                    {#if all_types[type].attack.zero.length > 0}
                        {#each all_types[type].attack.zero as type}
                            <img src="../../../types/{type}.svg" alt={type}>
                        {/each}
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
        </table>
    </div> 
</div>

<h1 style="display: flex; color: black; justify-content:center; padding-bottom: 10px">All {capitalize_name(type)} Type Pokemon</h1>

<section class="allpokemon" id="homepage">  
    {#each all_pokemons as pokemon}
        {#if pokemon != null}
            <button id="allpokemons" on:click={() => handle_click(pokemon.api_name)}> 
                <img src={pokemon.artwork} alt="lol">
                <h1>{pokemon.name}</h1>
                <h1>Pokédex No: #{pokemon.number}</h1>
            </button>
        {/if}
    {/each}
</section>
{/if}


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


    .info-table td {
        background-color: white;
        color: black;
        
    }

    .info-table :nth-child(1){
    font-weight: bold;
    }

    .info-table img {
        height: 250px;
        padding-top: 25px;
        padding-bottom: 50px;
        display: flex;
        margin-left: auto;
        margin-right: auto;
    }

    .info-table h1 {
        color: black;
        display: flex;
        justify-content: center;
    }

    :global(body){
        background-color: white;
    }

    .row{
    margin-left:-5px;
    margin-right:-5px;
    }

    .row td{
        background-color: white;
        color: black
    }

    .column{
    float: left;
    width: 50%;
    padding: 30px;
    }

    /* Clearfix (clear floats) */
    .row::after{
    content: "";
    clear: both;
    display: table;
    }
    
    .row .column img {
        padding: 5px;
        
    }

    .column h1 {
    text-align: center;
    display: flex;
    color: black;
    padding-left: 40px;
    }

</style>