import {capitalize_name, get_audio_and_picture, get_form, calculate_max, calculate_min, organize_name, get_only_name} from '../helpers/helpers'


export interface Move {
    move: {
        name: string
        url: string
    }
    version_group_details: {
        level_learned_at: number
        move_learn_method: {
            name: string
            url: string
        },
        version_group: {
            name: string
        }
    }[]
}

export interface MoveInfo {
    type: string
    category: string
    power: number
    accuracy: number
    pp: number
}

export interface LearningType {
    levelup: { name: string; level: number; type: string; category: string, power: number; accuracy: number, pp: number }[];
    egg: { name: string; level: number; type: string; category: string, power: number; accuracy: number, pp: number }[];
    tutor: { name: string; level: number; type: string; category: string, power: number; accuracy: number, pp: number }[];
    machine: { name: string; machine_number: number; type: string; category: string, power: number; accuracy: number, pp: number }[];
}



const link = "https://pokeapi.co/api/v2/pokemon/"

export async function get_moves(pokemon_name: string) {
    let x: LearningType = {
        levelup: [],
        egg: [],
        tutor: [],
        machine: [],
    }
    const response = await fetch(link+pokemon_name);
    if (response.ok) {
        const data = await response.json();
        x = assign_learn_type(data.moves, x, data.id);
    }
    return x
}

export function assign_learn_type(data: Move[], learningtype: LearningType, id: number) {
    data.forEach(move => {
        let Details = move.version_group_details.find(
            details => details.move_learn_method.name === "level-up" &&
                       details.version_group.name === "sword-shield"
        );
        
        if (Details == null) {
            if (id < 899) {
                Details = move.version_group_details.find(
                details => details.move_learn_method.name === "level-up" &&
                            details.version_group.name === "sun-moon"
                )
            }
            else {
                Details = move.version_group_details.find(
                    details => details.move_learn_method.name === "level-up" )
            }
            
        }



        if (Details) {
            const moveName = move.move.name;
            const levelLearned = Details.level_learned_at;

            if (!learningtype.levelup.some(m => m.name === moveName && m.level === levelLearned)) {
                learningtype.levelup.push({ name: moveName, level: levelLearned, type: "", category: "", power: 0, accuracy: 0, pp: 0 });
            }
        }

    });
    
    learningtype.levelup.sort((a, b) => a.level - b.level);
    return learningtype;
}

export async function get_move_types(moveinfo: LearningType, move_name: string, index: number): Promise<LearningType> {
    const api = 'https://pokeapi.co/api/v2/move/' + move_name;
    const response = await fetch(api);
    if (response.ok) {
        const data = await response.json();
        moveinfo.levelup[index].type = data.type.name
        moveinfo.levelup[index].category = capitalize_name(data.damage_class.name)

        if (data.power == null) {moveinfo.levelup[index].power = 0}
        else {moveinfo.levelup[index].power = data.power}

        if (data.accuracy == null) {moveinfo.levelup[index].accuracy = 0}
        else {moveinfo.levelup[index].accuracy = data.accuracy}

        moveinfo.levelup[index].pp = data.pp

    }
    return moveinfo;
}







