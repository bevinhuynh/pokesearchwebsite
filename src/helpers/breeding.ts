import {organize_name, capitalize_name} from '../helpers/helpers'

export interface Breeding {
    growth_rate: string,
    habitat: string,
    gender_rate: {
        male: number;
        female: number;
    }
    hatch_counter: number,
    egg_groups: string[]
}

let species_api = "https://pokeapi.co/api/v2/pokemon-species/"

export async function breeding_information(pokemon_name: any, breeding_info: Breeding) {
    const response = await fetch(species_api+pokemon_name);
    if (response.ok) { 
        const data = await response.json();

        let gender_rate = data.gender_rate;
        if (gender_rate == -1) {
            breeding_info.gender_rate.female = 0;
            breeding_info.gender_rate.male = 0;
        }
        else {
            breeding_info.gender_rate.female = (gender_rate/8) * 100
            breeding_info.gender_rate.male = 100 - breeding_info.gender_rate.female
        }
        breeding_info.growth_rate = organize_name(data.growth_rate.name)
        
        if (data.habitat && data.habitat.name) {
            breeding_info.habitat = capitalize_name(data.habitat.name);
        }        
        
        if (data.egg_groups.length == 1) {
            breeding_info.egg_groups.push(organize_name(data.egg_groups[0].name))
        }
        else if (data.egg_groups.length == 2){
            breeding_info.egg_groups.push(organize_name(data.egg_groups[0].name))
            breeding_info.egg_groups.push(organize_name(data.egg_groups[1].name))
        }

        breeding_info.hatch_counter = data.hatch_counter

    }
    return breeding_info;
}

