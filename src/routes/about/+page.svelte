<script>
    import {fade} from 'svelte/transition';

   
    
</script>


<svelte:head>
    <title>About Page</title>
</svelte:head>

<section class = "centered">
    <h1 id = "title">About PokeSearch Project</h1>
        <p>This website was created as a project
            for the FullyHacks Hackathon hosted by <br> California State University, Fullerton. 
            Using the SvelteKit framework provided by the hosts of the Hackathon, <br> as well as other various
            frontend tools, I was able  to create an informational website that allows users <br> to find information  
            for over 900 Pokemon, as well as information about all Pokemon types.
        </p>

        <p>
            Creating this website was a fun experience, getting more practice with frontend 
        </p>
</section>

<div class= "functionality">
    <h1 style="display:flex; justify-content:center">Functionality: </h1>
    <ul>
        <li>Search button that allows you to search for any Pokemon you wish.</li>
        <li>Provides accurate information about the Pokemon, including sprites, audio of their cry and their evolution tree.</li>
        <li>Discover Pokemon through selecting a certain type, as well as displaying the type's info.</li>
    </ul>
</div>

<div class= "toolsused" style= "padding-bottom: 525px">
    <h1 style="display:flex; justify-content:center">Tools Used: </h1>
    <ul>
        <li>Languages Used: JavaScript, TypeScript, CSS, HTML for frontend functionality.</li>
        <li>Frameworks Used: SvelteKit for page functionality.</li>
        <li>API Used: PokeApi for fetching data of Pokemon and the types.</li>
    </ul>
</div>

<!-- <p style="font-weight: bold;">By Bevin Huynh </p> -->
        



    





<style>
     /* Basic styles for the body */
.centered h1 {
    padding-top: 50px;
    color:darkred;
    font-size: 50px
}
.centered p {
    color: gray;
    font-size: 28px;
    font-weight: bold;
}

:global(body) {
    background-color: white;
    background-image: url("https://i.pinimg.com/736x/ab/58/cc/ab58cc75dcb2e42555cf7e614216350a.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    }

.functionality li {
    color: gray;
    font-size: 29.5px;
    font-weight: bold;
}

.functionality h1 {
    color:darkred;

    padding-top: 50px;
    font-size: 45px;
}

.toolsused {
    padding-top: 50px;
    
}
h1 {
    color:darkred;
}

.toolsused ul {
    /* display: flex; */
    
}
.toolsused li{
    margin-left: auto;
    margin-right: auto;
    align-items: center;
    color: gray;
    font-size: 29.5px;
    font-weight: bold;
}



</style>
