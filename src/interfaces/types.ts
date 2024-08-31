
import all_types from "../all_types.json"
import type { AssignedMultipliers } from "./allinterfaces"

export const types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting",
    "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon",
    "dark", "steel", "fairy"
]

export function determine_multipliers(types: String[]) {

    let multipliers = {
        defense: {}
    }
    types.forEach( (type:any) => {
        // @ts-ignore
        let defenses = all_types?.[type].defense
        let double_damage = defenses.double
        let half_damage = defenses.half
        let normal_damage = defenses.normal
        let immune = defenses.zero

        double_damage.forEach((type:any) => {
            if (!(type in multipliers.defense)) {
            multipliers.defense[type] = 2
            }
            else {multipliers.defense[type]  *= 2}
        })
        half_damage.forEach((type:any) => {
            if (!(type in multipliers.defense)) {
            multipliers.defense[type] = 1/2
            }
            else {multipliers.defense[type] *= 1/2}
        });
        immune.forEach((type:any) => {
            multipliers.defense[type] = 0
        });
        normal_damage.forEach((type:any) => {
            if (!(type in multipliers.defense)) {
                multipliers.defense[type] = 1
            }
        }) 
    })

    return multipliers
        
    
}

export function assign_multipliers(types: {}){
    const keys = Object.keys(types)
    let multipliers: AssignedMultipliers = {
        double: [],
        half: [],
        immune: [],
        quadruple: [],
        one_fourth: [],
        normal: []
    }
    keys.forEach((type:string) => {
        if (types[type as keyof {}] == 2) {
            multipliers.double.push(type)
        }
        else if (types[type as keyof {}] == 4){
            multipliers.quadruple.push(type)
        }
        else if (types[type as keyof {}] == 1/2){
            multipliers.half.push(type)
        }
        else if (types[type as keyof {}] == 0){
            multipliers.immune.push(type)
        }
        else if (types[type as keyof {}] == 0.25){
            multipliers.one_fourth.push(type)
        }
        else if (types[type as keyof {}] == 1){
            multipliers.normal.push(type)
        }

    });
    return multipliers
}

