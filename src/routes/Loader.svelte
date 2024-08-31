<script lang="ts">
    export let loading = true;
  </script>
  
  <style>
    .loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: grey;
        /* visibility: 5s; */
    }
  
    .loader.hidden {
      opacity: 0;
      visibility: hidden
    }
  
   
  
    .pokeball {
    width: 150px;
    height: 150x;
    animation: spin 0.75s linear infinite;
  }


  @keyframes spin {
    from { transform: rotate(0turn); }
    to { transform: rotate(1turn); }
  }
</style>

<div class="loader {loading ? '' : 'hidden'}">
  <div style="display: flex; flex-direction: column; align-items: center;">
    <img class="pokeball" src="https://pngfre.com/wp-content/uploads/Pokeball-19.png" alt="loader">
    <h1 style = "padding:20px">Loading...</h1>
  </div>
</div>