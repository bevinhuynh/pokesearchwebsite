<script lang="ts">
    import { goto } from "$app/navigation";


const pokemon_types = ["bug", "fire", "dark", "dragon", "electric", "fairy", "fighting", "flying", "ghost", "grass", "ground", "ice", "normal", "poison", "psychic", "rock", "steel", "water",]

function handle_click(name: string) {
  goto(`/content/${name}`)
}

</script>


<svelte:head>
  <title>Home</title>
</svelte:head>

<section class="title">
  <h1>Pokemon Types</h1>
</section>

<div class = "description">
  <h2>Select a type below to view information about the type and its Pokemons.</h2>
</div>

<section class="type-button" style="padding-bottom:180px">
  {#each pokemon_types as type}
  <button on:click={() => handle_click(type)}>
    <img src = "../../../types/{type}.svg" alt = {type}>
  </button>
  {/each}
</section>


<style>

  .description h2 {
    display: flex;
    justify-content: center;
    color: grey;
  }

  .title h1{
    color: black;
    display: flex;
    justify-content: center;
  }

  :global(body){
    background-color: white;
  }

  .type-button {
    padding-top: 50px;
    gap: 30px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .type-button img {
    justify-content: center;
    width: 300px;
  }

  .type-button button {
    display: inline;
    justify-content: center;
    background: none;
    border: none;
    transition: transform 0.2s;
  }

  .type-button button:hover {
    transform: scale(1.1)
  }

  :global(body) {
    background-color: white;
    background-image: url("https://i.pinimg.com/736x/ab/58/cc/ab58cc75dcb2e42555cf7e614216350a.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    }


</style>