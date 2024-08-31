import type {Sprites, next_and_prev} from "../interfaces/allinterfaces"

export function get_species_name(name: string){
  if (name == "mr-mime" || name == "mime-jr" || name == "mr-rime" || name == "jangmo-o" || name == "hakamo-o" || name == "kommo-o" || name == "nidoran-m" || name == "nidoran-f" || "ho-oh") {
    return name;
  }
  let splitted = name.split('-');
  return splitted[0];
  
}
 
export function capitalize_name(name: string) {
        let first_letter = name[0].toUpperCase();
        let rest_of_name = ""+name.substring(1);
        let new_name = first_letter + rest_of_name
        return new_name

    }
  
export function get_form(form: string){
  let splitted_name = form.split('-')
  if (splitted_name.length == 3) {
    return capitalize_name(splitted_name[1]) + " " + capitalize_name(splitted_name[2])
  }
  else if (splitted_name.length == 2) {
    return capitalize_name(splitted_name[1])
  }
  else {
    return capitalize_name(splitted_name[0])
  }
}

export function get_sprites(api: any, sprite_list: Sprites, gen_number: number) {
    sprite_list.front = api.sprites.front_default;
    sprite_list.back = api.sprites.back_default;
    sprite_list.shiny_front = api.sprites.front_shiny;
    sprite_list.shiny_back = api.sprites.back_shiny;

    if (gen_number < 6) {
      sprite_list.anifront = api.sprites.versions?.["generation-v"]?.['black-white']?.animated.front_default;
      sprite_list.aniback = api.sprites.versions?.["generation-v"]?.['black-white']?.animated.back_default;
      sprite_list.anishinyf = api.sprites.versions?.["generation-v"]?.['black-white']?.animated.front_shiny;
      sprite_list.anishinyb = api.sprites.versions?.["generation-v"]?.['black-white']?.animated.back_shiny;
    }
    return sprite_list;
}


export function get_audio_and_picture(poke_data: any){
    const get_sprite = poke_data.sprites.other?.['official-artwork']?.front_default;
    const PokeSprite = document.getElementById("PokeSprite") as HTMLImageElement | null;
    const get_audio = poke_data.cries.latest;
    const PokeCry = document.getElementById("cry") as HTMLAudioElement | null;
    if (PokeSprite && PokeCry) {
      PokeSprite.src = get_sprite;
      PokeSprite.style.display = "flex"
      PokeCry.src = get_audio;
      PokeCry.load();
    }
}


export function clear(){
  const pokedisplay = document.getElementById("display")
  if (pokedisplay){
    pokedisplay.style.display = "none";
  }

  const home_page = document.getElementById("homepage")
  if (home_page){
    home_page.style.display = "flex";
  }
}


export function check_dashes(get_name: any) {
  if (get_name.length === 2) {
    if (get_name[1] === 'f'){
      return get_name[0] + ' ♀'
    }
    else if (get_name[1] === 'm'){
      return get_name[0] + ' ♂'
    }
  }
  return get_name[0]
}


export function calculate_min(base_stat: any, name: any){
  if (name == "hp"){
      let fraction = (2 * base_stat * 100)/100
      return Math.floor(fraction) + 100 + 10
  }
  else {
      let fraction = Math.floor((2 * base_stat * 100)/100) + 5
      return Math.floor(fraction * .9)

  }
}

export function calculate_max(base_stat: any, name:any){
  if (name == "hp"){
  let fraction = ((2 * base_stat + 31 + Math.floor(252/4))*100)/100
  return Math.floor(fraction) + 100 + 10
  }
  else {
      let fraction = (2 * base_stat + 31 + Math.floor(252/4)) * 100
      fraction = Math.floor(fraction/100) + 5
      return Math.floor(fraction * 1.1)
  }
}

export function organize_name(name: string){
  if (name === "hp") {return "HP";}
  let split_name = name.split('-');
  if (split_name.length === 2) {
      return capitalize_name(split_name[0]) + " " + capitalize_name(split_name[1])
  }
  return capitalize_name(split_name[0])

}


export function get_only_name(name: any){
  if (name == "mr-mime") {return "Mr. Mime"}
  if (name == "mime-jr") {return "Mime Jr."}
  if (name == "mr-rime") {return "Mr. Rime"}
  if (name == "farfetchd") {return "Farfetch'd"}
  if (name == "sirfetchd") {return "Sirfetch'd"}
  if (name == "nidoran-m") {return "Nidoran ♂"}
  if (name == "nidoran-f") {return "Nidoran ♀"}
  if (name == "ho-oh") {return "Ho-Oh"}
  let splitted_name = name.split('-');
  if (splitted_name[1] == "o") {
    return splitted_name[0] + "-" + splitted_name[1]
  }
  if (name[1] != 'f' || name[1] != 'm') {
      return splitted_name[0];
  }


  return name;
}

export async function get_next_and_previous_pokemons(pokedex_num: number, api: any, sequence: next_and_prev) {
  if (pokedex_num - 1 != 0) {
    let prev = await fetch(api+(pokedex_num-1).toString())
    if (prev.ok) {
      let prev_data = await prev.json();
      sequence.previous.name = capitalize_name(get_only_name(prev_data.name));
      sequence.previous.number = prev_data.id;
      sequence.previous.image = prev_data.sprites.other?.['official-artwork']?.front_default;
      sequence.previous.api_name = prev_data.name
    }
  }
  if (pokedex_num + 1 != 906) {
    let next = await fetch(api + (pokedex_num+1).toString())
    if (next.ok) {
      let next_data = await next.json();
      sequence.next.name = capitalize_name(get_only_name(next_data.name));
      sequence.next.number = next_data.id
      sequence.next.image = next_data.sprites.other?.['official-artwork']?.front_default;
      sequence.next.api_name = next_data.name
    }
  }
  return sequence;

}


export async function fetch_all_pokemon_names() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=905&offset=0")
  let all_pokemon_list = [];
  if (response.ok) {
    const data = await response.json();
    all_pokemon_list = data.results.map((pokemon: any) => pokemon.name);
  }
  return all_pokemon_list;
}

export function filter_pokemon(text_input: string, all_pokemons: any) {
  text_input = text_input.toLowerCase();
  let result = []
  if (text_input.length){
    result = all_pokemons.filter((pokemon:string) =>{
      return pokemon.includes(text_input)
    })
  }
  return result.slice(0,4)
}

