

<script lang="ts">

    import {page} from '$app/stores'
    import {onMount} from 'svelte'
    import { goto } from '$app/navigation';

    import {capitalize_name,  get_form, calculate_max, calculate_min, organize_name, get_only_name, get_sprites, get_next_and_previous_pokemons, get_species_name, fetch_all_pokemon_names, filter_pokemon} from '../../../helpers/helpers'
    import {determine_multipliers, assign_multipliers} from '../../../interfaces/types'
    import {get_moves, get_move_types} from "../../../helpers/getting_moves"
    import {breeding_information} from "../../../helpers/breeding"
    import {get_evolution_chain} from "../../../helpers/evolution_group"
    
    import type {Pokemon, AssignedMultipliers, Sprites,next_and_prev, EvolutionGroup} from '../../../interfaces/allinterfaces'
    import type {MoveInfo, LearningType} from "../../../helpers/getting_moves"
    import type {Breeding} from "../../../helpers/breeding"
    import Loader from '../../Loader.svelte';

    let artwork = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/"
    let artwork_jpg = "https://img.pokemondb.net/artwork/large/"

    
    let pokemonList: string[] = [];
    let results: string[] = [];
    let pokemon_name = $page.params.pokemon_name
    let searchQuery = ""
    let loading = true
    let movesetLoaded = false;

    let ability_url = `https://pokeapi.co/api/v2/ability/`
    let general_pokemon_api = "https://pokeapi.co/api/v2/pokemon/"

    let pokemon_species_url: string;
    let pokemon_api: string;
    let species_name: string;


    let evolution_group: EvolutionGroup = {
        first: [],
        second: [],
        third: []
    };


    let type_multipliers = { 
        defense: {}
    }

    let assigned_multipliers: AssignedMultipliers = {
        double: [],
        quadruple: [],
        half: [],
        immune: [],
        one_fourth: [],
        normal: []

    }

    let pokemon: Pokemon = {name: "", bio: "", artwork: "", cry: "", types: [],
    pokedex_entry: {number: 0, generation: 0, height: "", weight: "", shape: "", catch_rate: "", color: "",abilities: []},
    training: {base_experience: "", base_happiness: "", base_friendship: "", EV_yield: [], catch_rate: "", held_items: []},
    breeding: {habitat: "", gender_rate: "", growth_rate: "", egg_cycles: "", egg_groups: ""},
    statistics: []
    }

    
    interface PokemonForm {
        is_default: boolean
        pokemon: {
            name: string;
            url: string
        }
    };


    let varieties: PokemonForm[] = [
        {   
            is_default: true,
            pokemon: {
                name: "",
                url: ""
            }}
    ];

    let moveset: LearningType = {
        levelup: [],
        egg: [],
        tutor: [],
        machine: [],
    }
    
    let moveinfo: MoveInfo[] = [
        {
        type: "",
        category: "",
        power: 0,
        accuracy: 0,
        pp: 0 
        }  
    ]

    let breeding_info: Breeding = {
        growth_rate: "",
        habitat: "",
        gender_rate: {
            male: 0,
            female: 0
        },
        hatch_counter: 0,
        egg_groups: []
    }

    let sprites: Sprites = {
        front: "",
        back: "",
        shiny_front: "",
        shiny_back: "",

        anifront: "",
        aniback: "",
        anishinyf: "",
        anishinyb: ""
    }

    let next_and_prev:  next_and_prev = {
        next: {
            name: "",
            api_name: '',
            number: 0,
            image: ""
        },
        previous: {
            name: "",
            api_name: '',
            number: 0,
            image: ""
        }
    }


    function handle_click(name: string){
        goto(`/pokemon/${name}`);
        setTimeout(() => {
            window.location.reload();
        }, 1);
    }
    

    async function search_for_pokemon() { 
        pokemon_api = `https://pokeapi.co/api/v2/pokemon/${pokemon_name}`
        const response = await fetch(pokemon_api);
        // console.log(response)
        
      
        try {
            if (response.ok){
                const poke_data = await response.json();
                // console.log(poke_data)
                
        
                pokemon.name = capitalize_name(get_only_name((pokemon_name)));
                pokemon.bio = await get_description_and_generationnumber(poke_data);
                pokemon_species_url = `https://pokeapi.co/api/v2/pokemon-species/${pokemon_name}`;
                
                pokemon.training.base_experience = poke_data.base_experience
                pokemon.statistics = poke_data.stats
                pokemon.artwork = poke_data.sprites.other?.['official-artwork']?.front_default;
                pokemon.cry = poke_data.cries.latest;

                
                get_types(poke_data)
                await getPokemonMoveset(pokemon_name);
                type_multipliers = determine_multipliers(pokemon.types)
                assigned_multipliers = assign_multipliers(type_multipliers.defense)

                species_name = get_species_name(pokemon_name.toLowerCase());
                
                get_pokedex_entry(poke_data);
                get_abilities(poke_data);
                get_ev_yields(poke_data);

                sprites = get_sprites(poke_data, sprites, pokemon.pokedex_entry.generation)
                breeding_info = await breeding_information(species_name, breeding_info)
                evolution_group = await get_evolution_chain(species_name, evolution_group)
                next_and_prev = await get_next_and_previous_pokemons(pokemon.pokedex_entry.number, general_pokemon_api, next_and_prev)
                await get_training();
            }
        }
        catch (error)  {
            console.log(`Error with loading ${pokemon_name}`)
        }


        
    }

    async function all_move_info() {
    const movePromises = moveset.levelup.map((move, index) => get_move_types({...moveset}, move.name, index));
    const updatedMoveInfos = await Promise.all(movePromises);

    updatedMoveInfos.forEach(info => {
        info.levelup.forEach((move, index) => {
            moveset.levelup[index] = move;
        });
    });

    moveinfo.shift();
    movesetLoaded = true;
}

    async function getPokemonMoveset(pokemon_name:any) {
    try {
        moveset = await get_moves(pokemon_name.toLowerCase());
        all_move_info() ;
    } catch (error) {
        console.error('Error fetching moveset:', error);
    }
    }
    
    function get_types(api: any){
        const types = api.types;
        types.forEach((type:any)=> {
            // @ts-ignore
            pokemon.types.push(type.type.name)
        });
       
        
    }

    function get_pokedex_entry(poke_data: any){        
        pokemon.pokedex_entry.number = poke_data.id
        pokemon.pokedex_entry.height = `${poke_data.height/10}`
        pokemon.pokedex_entry.weight = `${poke_data.weight/10}`

    }

    async function get_description_and_generationnumber(data: any){
    const response = await fetch(data.species.url);
    if (response.ok) {
        
        const species_data = await response.json();

        const url_split = species_data.generation.url.split('/')

        pokemon.pokedex_entry.generation = url_split[url_split.length - 2]
        pokemon.pokedex_entry.color = capitalize_name(species_data.color.name)

        
        try {
            pokemon.pokedex_entry.shape = capitalize_name(species_data.shape.name);
        } catch (error) {
            console.error('Error setting the shape:', error);
        }
        varieties = species_data.varieties.map((variety: any) => ({
                is_default: variety.is_default,
                pokemon: {
                    name: get_form(variety.pokemon.name),
                    url: variety.pokemon.url
                }
        }));
        

        const bio = species_data.flavor_text_entries.find((entry:any) => {
        return entry.language.name === "en";
        });
        return bio.flavor_text;
    }
    }

    async function get_abilities(api: any){
        pokemon.pokedex_entry.abilities = await Promise.all (api.abilities.map(async (pokemon_ability: any) => {
        let abil_name = capitalize_name(pokemon_ability.ability.name);
        let abil_desc: string | undefined = ''
        if (pokemon_ability.is_hidden === true){
        abil_name = abil_name + " (Hidden Ability)";
        }

        const response = await fetch(ability_url+pokemon_ability.ability.name);
        if (response.ok) {
        const data = await response.json();
        const get_effect = data.effect_entries.find((entry: any) => {
            return entry.language.name === "en";
        });
        if (get_effect){
            abil_desc = get_effect.short_effect
        }
        
        }
        return {
            name: abil_name,
            description: abil_desc
        };
    })
    );
}

    async function get_training(){
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${species_name}`);
        if (response.ok){
            const data = await response.json();

            if (data.base_happiness == null) {pokemon.training.base_happiness = "0"}
            else {pokemon.training.base_happiness = data.base_happiness;}
            pokemon.training.catch_rate = data.capture_rate;
        }
    }

    function get_ev_yields(api: any){    
        pokemon.training.EV_yield = api.stats.filter((ev: any) =>{
            return ev.effort > 0;
        });        

        pokemon.training.held_items = api.held_items
        pokemon.training.EV_yield = api.stats
        pokemon.statistics.forEach(element => {
            element.min = calculate_min(element.base_stat,element.stat.name)
            element.max = calculate_max(element.base_stat, element.stat.name)
        });
    
    }

    onMount(async () => {
        pokemonList = await fetch_all_pokemon_names()
        await search_for_pokemon();
        loading = false;

    });


</script>


    <!-- {#if loading || !movesetLoaded}
        <Loader loading/>
    {:else} --> 

    {#if loading}
        <Loader loading/>
    {:else}

    <section class="PokeDisplay" id="display"> 

        <div class = "next-and-prev "style= "display:inline-flex; gap: 300px; margin-bottom: 50px;">
            {#if next_and_prev.previous.name != ""}
            <button class = "left-button" on:click={() => handle_click(next_and_prev.previous.api_name.toLowerCase())}>
                <img src = {next_and_prev.previous.image} alt = "lol">
                <h3 style = "color: black">#{next_and_prev.previous.number}: {next_and_prev.previous.name}</h3>
            </button>
            {:else}
            <button class = "left-button">
                <h3 style = "color: black">No Previous Pokemon.</h3>
            </button>
            {/if}
            
            {#if next_and_prev.next.name != ""}
                <button class = "right-button" on:click={() => handle_click(next_and_prev.next.api_name.toLowerCase())}>
                    <h3 style = "color: black">#{next_and_prev.next.number}: {next_and_prev.next.name}</h3>
                    <img src = {next_and_prev.next.image} alt = "lol">
                </button>
            {:else}
                <button class = "right-button">
                    <h3 style = "color: black">No Pokemon Next.</h3>
                </button>
            {/if}
        </div>

    <div class = "search-button">
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
              <img src={artwork_jpg + pokemon + ".jpg"} alt={capitalize_name(get_only_name(pokemon)) + " artwork"}>
              <div class = "text">{capitalize_name(get_only_name(pokemon))}</div>
              <div class = "number">#{pokemonList.indexOf(pokemon)+1}</div>
            </button>
          {/each}
          </ul>
        {/if}
      </div>
   
    <img src= {pokemon.artwork} alt="Lol;" id ="PokeSprite" class = "pokesprite">
    <h1 style = "display:block">{pokemon.name} <audio style = "display:inline" controls id="cry"> <source src= {pokemon.cry} type="audio/ogg"></audio></h1>
    
    <div class = "test">
    {#each pokemon.types as type}
        <img src = "../../../types/{type}.svg" alt = {type}>
    {/each}
    </div>
    <p>{pokemon.bio}</p>
    <h1 style="display: block">Pokedex Entry</h1>
    
    <table id="InfoTable">
        <tr>
            <td>Pokedex Number:</td>
            <td>{pokemon.pokedex_entry.number}</td>
        </tr>
        <tr>
            <td>Generation Introduced:</td>
            <td>Gen {pokemon.pokedex_entry.generation}</td>
        </tr>
        <tr>
            <td>Height:</td>
            <td>{pokemon.pokedex_entry.height} meters</td>
        </tr>
        <tr>
            <td>Weight:</td>
            <td>{pokemon.pokedex_entry.weight} kg</td>
        </tr>
        <tr>
            <td>Abilities:</td>
            <td>
                {#each pokemon.pokedex_entry.abilities as ability}
                    {#if ability.description != ""}
                        <li style="font-weight: normal">{organize_name(ability.name)} - <br>{ability.description}</li>
                    {:else}
                        <li style="font-weight: normal">{organize_name(ability.name)} - <br>N/A</li>
                    {/if}
                {/each}
            </td>
        </tr>
        <tr>
            <td>Shape:</td>
            {#if pokemon.pokedex_entry.shape != ""}
                <td>{pokemon.pokedex_entry.shape}</td>
            {:else}
                <td>N/A</td>
            {/if}
        </tr>
        <tr>
            <td>Color:</td>
            <td>{pokemon.pokedex_entry.color}</td>
        </tr>
    </table>
    
    <div class="row" style="margin-top: 30px;">
        <div class="column" style = "gap: 20px">
            <h1>Training</h1>
            <table>
                <tr>
                    <td>Base Experience:</td>
                    <td>{pokemon.training.base_experience}</td>
                </tr>
                <tr>
                    <td>Base Happiness:</td>
                    <td>{pokemon.training.base_happiness}</td>
                </tr>
                <tr>
                    <td>Catch Rate:</td>
                    <td>{pokemon.training.catch_rate}</td>
                </tr>
                <tr>
                    <td>EV Yield:</td>
                    <td>
                        {#each pokemon.training.EV_yield as ev}
                        {#if ev.effort > 0}
                                <li style="font-weight: normal">{organize_name(ev.stat.name)} - {ev.effort}</li>
                        {/if}
                        {/each}
                    </td>
                </tr>
                <tr>
                    <td>Held Items:</td>
                    <td>
                        {#if pokemon.training.held_items.length === 0}
                            <li style="font-weight: normal">None</li>
                        {:else}
                            {#each pokemon.training.held_items as items}
                                <li style="font-weight: normal">{capitalize_name(items.item.name)}</li>
                            {/each}
                        {/if}
                    </td>
                </tr>
            </table>
        </div>
        <div class="column">
            <h1>Breeding</h1>
            <table>
                <tr>
                    <td>Gender Rates:</td>
                    <td>Male: {breeding_info.gender_rate.male}%, Female: {breeding_info.gender_rate.female}%</td>
                </tr>
                <tr>
                    <td>Growth Rate: </td>
                    <td>{breeding_info.growth_rate}</td>
                </tr>
                <tr>
                    <td>Egg Groups:</td>
                    <td>
                    {#each breeding_info.egg_groups as group, index}
                        <li style = "font-weight: normal">{group}{index < breeding_info.egg_groups.length - 1 ? ' ' : ''}</li>
                    {/each}
                    </td>
                </tr>
                <tr>
                    <td>Habitat:</td>
                    {#if breeding_info.habitat != ""}
                        <td>{breeding_info.habitat}</td>
                    {:else}
                        <td>None</td>
                    {/if}
                </tr>
                <tr>
                    <td>Hatch Counter:</td>
                    <td>{breeding_info.hatch_counter} cycles, {breeding_info.hatch_counter* 128} steps</td>
                </tr>
            </table>
        </div>
    </div>

    <div class = "type_and_forms_row" style = "margin-top: 0px">
        <div class = "column2">
            <h1>Type Effectiveness</h1>
            <tr>
                <td>Damaged Normally By (1x):</td>
                <td>
                    {#each assigned_multipliers.normal as x, index}
                        {#if assigned_multipliers.normal.length > 0}
                            <img src = "../../../types/{x}.svg" alt = {x}>{index < assigned_multipliers.normal.length - 1 ? ' ' : ''}
                        {:else}
                            None
                        {/if}
                    {/each}
                </td>
                
            </tr>
            <tr>
                <td>Weaker To (2x):</td>
                <td>
                    {#each assigned_multipliers.double as x, index}
                        {#if assigned_multipliers.double.length > 0}
                            <img src = "../../../types/{x}.svg" alt = {x}> {index < assigned_multipliers.double.length - 1 ? ' ' : ''}
                        {:else}
                            None
                        {/if}
                    {/each}
                </td>
            </tr>
            <tr>
                <td>Weakest To (4x):</td>
                <td>
                    {#if assigned_multipliers.quadruple.length > 0}
                    {#each assigned_multipliers.quadruple as x, index}
                        <img src = "../../../types/{x}.svg" alt = {x}>{index < assigned_multipliers.quadruple.length - 1 ? ' ' : ''}
                    {/each}
                {:else}
                    None
                {/if}
                </td>
            </tr>
            <tr>
                <td>Stronger Against (1/2x):</td>
                <td>
                    {#if assigned_multipliers.half.length > 0}
                        {#each assigned_multipliers.half as x, index}
                            <img src = "../../../types/{x}.svg" alt = {x}>{index < assigned_multipliers.half.length - 1 ? ' ' : ''}
                        {/each}
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
            <tr>
                <td>Strongest Against (1/4x):</td>
                <td>
                {#if assigned_multipliers.one_fourth.length > 0}
                        {#each assigned_multipliers.one_fourth as x, index}
                            <img src = "../../../types/{x}.svg" alt = {x}> {index < assigned_multipliers.one_fourth.length - 1 ? ' ' : ''}
                        {/each}
                    {:else}
                        None
                {/if}
                </td>
            </tr>
            <tr>
                <td>Immune To (0x):</td>
                <td>
                    {#if assigned_multipliers.immune.length > 0}
                        {#each assigned_multipliers.immune as x, index}
                            <img src = "../../../types/{x}.svg" alt = {x}> {index < assigned_multipliers.immune.length - 1 ? ' ' : ''}
                        {/each}
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
        </div>
        <div class = "column2">
            <h1>Other Forms</h1>
            <tr>
                <td>
                    Alternate Forms?
                </td>
                <td>
                    {#if varieties.length > 1}
                        Yes
                    {:else}
                        None
                    {/if}                   
                </td>

            <tr>
                <td>All Forms: </td>
                <td>
                    <li style = "font-weight: normal">{varieties[0].pokemon.name} (Default Form)</li>
                    {#each varieties as form}
                        {#if form.is_default === false}
                            <li style = "font-weight: normal">{form.pokemon.name}</li>
                        {/if}
                    {/each}

                </td>
            </tr>
        </div>
    </div>
    
    <div class="stats-table">
        <h2 style = "color: black">Base Stats</h2>
        <table>
            <tr>
                <th>Stat</th>
                <th>Base</th>
                <th>Progress</th>
                <th>Min</th>
                <th>Max</th>
            </tr>
                {#each pokemon.statistics as stats}
                    <tr>
                        <td>{organize_name(stats.stat.name)}</td>
                        <td>{stats.base_stat}</td>
                        <td><div class="progress"><div class="progress-bar" style = "width: {(stats.base_stat/stats.max)*100}%"></div></div></td>
                        {#if stats.stat.name == "hp"}
                            <td>{stats.min}</td>
                            <td>{stats.max}</td>
                        {:else}
                            <td>{stats.min}</td>
                            <td>{stats.max}</td>
                        {/if}
                    </tr>
                {/each}
        </table>
        <h4 style = "color: grey">Minimum stats were calculated using level 100 Pokemons, 0 EVs, 0 IVs, and a hindering nature (0.9%), Maximum Stats calculated with level 100 Pokemon, 252 EVs, 31 IVs, and a helpful nature (1.1%).</h4>
        <br>

    </div>

    <div class = move-table>
        <h2 style = "color:black"> Move Set By Leveling</h2>
        <table>
            <tr>
                <th>Level</th>
                <th>Move</th>
                <th>Type</th>
                <th>Category</th>
                <th>Power</th>
                <th>Accuracy</th>
                <th>Power Points</th>
            </tr>
            {#each moveset.levelup as move}
                <tr>
                    {#if move.level === 0}
                        <td>Evol.</td>
                    {:else}
                        <td>{move.level}</td>
                    {/if}
                    <td>{organize_name(move.name)}</td>
                    <td><img src = "../../../types/{move.type}.svg" alt = "lol"></td>
                    <td>{move.category}</td>
                    <td>{move.power}</td>
                    <td>{move.accuracy}</td>
                    <td>{move.pp}</td>
                </tr>
            {/each}
        </table>
    </div>

    <h1>Evolution Family</h1>
    <section class = "Evolution-Family">
        
        <button id = "allpokemons" on:click={() => handle_click(evolution_group.first[2].toLowerCase())}>
            <img src = {artwork + evolution_group.first[1] + ".png"} alt = "lol">
            <h1>{evolution_group.first[0]}</h1>
        </button>

        {#if evolution_group.second.length > 0}
            {#each evolution_group.second as pokemon}
                <button id = "allpokemons" on:click={() => handle_click(pokemon[2].toLowerCase())}>
                    <img src = {artwork + pokemon[1] + ".png"} alt = "lol">
                    <h1>{pokemon[0]}</h1>
                </button>
            {/each}
        {/if}

        {#if evolution_group.third.length > 0}
            {#each evolution_group.third as pokemon}
                <button id = "allpokemons" on:click={() => handle_click(pokemon[2].toLowerCase())}>
                    <img src = {artwork + pokemon[1] + ".png"} alt = "lol">
                    <h1>{pokemon[0]}</h1>
                </button>
            {/each}
        {/if}
    

    </section>

    <br>

    <hr>

    <div class="container">
    <br>
    <h1>Sprites</h1>
    <section class = "sprites">
        <div class="row">
            <figure>
                <img src={sprites.front} alt="front">
                <figcaption>Front</figcaption>
            </figure>
            <figure>
                {#if sprites.back != null}
                <img src={sprites.back} alt="back">
                <figcaption>Back</figcaption>
                {/if}
            </figure>
            <figure>
                <img src={sprites.shiny_front} alt="shiny front">
                <figcaption>Shiny Front</figcaption>
            </figure>
            <figure>
                {#if sprites.shiny_back != null}
                <img src={sprites.shiny_back} alt="shiny back">
                <figcaption>Shiny Back</figcaption>
                {/if}
            </figure>
        </div>

        {#if sprites.anifront != ""}
        <div class = "row">
            <figure>
                <img src={sprites.anifront} alt="animated front">
                <figcaption>Animated Front</figcaption>
            </figure>
            <figure>
                <img src={sprites.aniback} alt="animated back">
                <figcaption>Animated Back</figcaption>
            </figure>
            <figure>
                <img src={sprites.anishinyf} alt="animated shiny front">
                <figcaption>Animated Shiny Front</figcaption>
            </figure>
            <figure>
                <img src={sprites.anishinyb} alt="animated shiny back">
                <figcaption>Animated Shiny Back</figcaption>
            </figure>
        </div>
        {/if}
    </section>
    </div>

    


</section>
{/if}

<style>

    .search-button input{
        font-size: 30px;
        height: 50px;
        background: transparent;
        border: 0;
        outline: 0;
        color: #333;
        border: 1px solid black;
        text-align: center;
        width: 89%;
        margin-left: auto;
        margin-right: auto;
        margin-top: 25px;
        margin-bottom: 50px;
        height: 80px;
        
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
        font-size: 30px;
        font-weight: normal;
    }

    .result-box ul button .number {
        margin-right: 80px;
        font-size: 20px;
        font-weight: normal;
    }

    .result-box ul button:hover {
        background: rgb(218, 218, 244);
    }

    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column; 
        min-height: 30vh; 
    }

    .sprites .row{
        display: flex;
        justify-content: space-around; 
        align-items: center; 
        flex-wrap: wrap;
        gap: 50px; 
    }

    .sprites figure {
        text-align: center; 
    }

    .sprites img {
        width: 200px; 
        height: 200px; 
        object-fit: contain; 
    }

    .sprites figcaption {
        font-weight: bold;
        margin-top: 5px; 
        font-size: 30px; 
        color: #333; 
    }

    .test img{
        padding-inline: 10px;
        margin-bottom: 20px;
    }


    :global() {
    background-color: white;
    /* background-image: url("https://i.pinimg.com/736x/ab/58/cc/ab58cc75dcb2e42555cf7e614216350a.jpg"); */
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    }

    .stats-table th{
        color: black;
        background-color: white;
    }
    
    .progress {
    width: 100%;
    background-color: #ddd;
    border-radius: 25px;
    overflow: hidden;
    box-shadow: 0 3px 3px -3px rgba(0, 0, 0, 0.2);
    }

    .progress-bar {
        height: 30px;
        width: 100%;
        background-color: #4caf50;
        text-align: center;
        line-height: 30px;
        color: white;
        border-radius: 25px 0 0 25px;
        transition: width 0.3s;
    }

    
    
    .PokeDisplay {
    background-color: white;
    text-align: center;
    }

    .PokeDisplay {
    background-color: white;
    text-align: center;
    }

    .PokeDisplay table {
    width: 100%;
    }

    .PokeDisplay :nth-child(1){
    font-weight: bold;
    }

    .PokeDisplay td{
    background-color: white;
    }

    .PokeDisplay p{
    color: black;
    }

    .PokeDisplay td{
    color: black;
    }


    .PokeDisplay h1 {
    text-align: center;
    display: inline-block;
    color: black;
    }

    .PokeDisplay p {
    text-align: center;
    }

    .PokeDisplay img{
    margin-left: auto;
    margin-right: auto;
    }

    .row, .type_and_forms_row {
    margin-left:-5px;
    margin-right:-5px;
    }

    .column, .column2{
    float: left;
    width: 50%;
    padding: 30px;
    }

    /* Clearfix (clear floats) */
    .row::after, .type_and_forms_row::after {
    content: "";
    clear: both;
    display: table;
    }

    .Evolution-Family {
        gap: 30px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;

    }

    .next-and-prev button {
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

    .next-and-prev button:hover {
        transform: scale(1.05);
    }

    .next-and-prev img {
        max-width: 100%;
        max-height: 150px;
        margin-bottom: 10px;
    }

    .next-and-prev .left-button {
        width: 400px;
        height: 125px;
        flex-direction: row;
    }
    
    .next-and-prev .left-button img {
        max-height: 100px;
    }

    .next-and-prev .right-button {
        width: 400px;
        height: 125px;
        flex-direction: row;
    }

    .next-and-prev .right-button img {
        max-height: 100px;
    }

    .Evolution-Family h1{
        color: black;
    }
    
    .Evolution-Family button {
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

    .Evolution-Family button:hover {
        transform: scale(1.05);
    }

    .Evolution-Family button img {
        max-width: 100%;
        max-height: 150px;
        margin-bottom: 10px;
    } 

    .search-button {
        width: 60%;
        display:flex;
        margin-left: auto;
        margin-right: auto;
    }

    

</style>
