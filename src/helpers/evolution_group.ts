import { capitalize_name, get_only_name} from "./helpers"
import type {EvolutionGroup} from "../interfaces/allinterfaces"

let species_api = "https://pokeapi.co/api/v2/pokemon-species/"
let regular_api = "https://pokeapi.co/api/v2/pokemon/"



export async function get_evolution_chain(species_name: string, evo_group: EvolutionGroup) {
    const response = await fetch(species_api+species_name);
    if (response.ok) {
        const data = await response.json();
        evo_group = await evolution_chain_details(evo_group ,data);
        evo_group = await get_api_name(evo_group)
        
    }
    return evo_group
}



async function evolution_chain_details(evo_group: EvolutionGroup, chain_api: any) {
    const response = await fetch(chain_api.evolution_chain.url);
    if (response.ok) {
        const data = await response.json();
        let split = data.chain.species.url.split('/');
        evo_group.first = [capitalize_name(get_only_name(data.chain.species.name)), split[6], ""]
        
        if (data.chain.evolves_to.length > 0) {
            data.chain.evolves_to.forEach((element: any) => {
                let split = element.species.url.split('/');
                evo_group.second.push([capitalize_name(get_only_name(element.species.name)), split[6], ""])
            })

            if (data.chain.evolves_to[0].evolves_to.length > 0) {
                data.chain.evolves_to[0].evolves_to.forEach((element:any) => {
                    let split = element.species.url.split('/');
                    evo_group.third.push([capitalize_name(get_only_name(element.species.name)), split[6], ""])
                })
            }
        
        }
            
    }
    return evo_group
}

async function get_api_name(evo_group: EvolutionGroup) {
    let response = await fetch(regular_api+evo_group.first[1]);
    if (response.ok) {
        let data = await response.json();
        evo_group.first[2] = data.name;
    }
    if (evo_group.second.length > 0) {
        evo_group.second.forEach(async (pokemon:any) => {
            response = await fetch(regular_api+pokemon[1])
            if (response.ok) {
                let data = await response.json();
                pokemon[2] = data.name;
            }
        });
    }
    if (evo_group.third.length > 0) {
        evo_group.third.forEach(async (pokemon:any) => {
            response = await fetch(regular_api+pokemon[1])
            if (response.ok) {
                let data = await response.json();
                pokemon[2] = data.name;
            }
        });
    }
    return evo_group

}




