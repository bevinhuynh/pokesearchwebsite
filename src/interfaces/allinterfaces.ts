export interface EvolutionGroup {
  first: string[];
  second: [string, string, string][];
  third: [string, string, string][];
}

export interface Sprites {
  front: string
  back: string
  shiny_front: string
  shiny_back: string

  
  anifront: string
  aniback:string
  anishinyf: string
  anishinyb: string

}

interface EVStat {
  base_stat: number;
  effort: number;
  stat: {
      name: string;
      url: string;
  };
}

interface held_items {
  item: {
    name: string
    url: string
  }
}

interface Statistics{
  base_stat: number
  effort: string;
  stat: {
      name: string;
      url: string;
  };
  min: number;
  max: number;
}

export interface Pokemon {
    name: string;
    artwork: string;
    bio: string;
    cry: string;
    types: [];
    pokedex_entry: PokedexEntry
    training: Training
    breeding: Breeding
    statistics: Statistics[]
    
  }


  interface Training {
    base_experience: string
    base_happiness: string
    base_friendship: string
    EV_yield: EVStat[]
    catch_rate: string
    held_items: held_items[]
  }

  interface Breeding{
    habitat: string;
    gender_rate: string;
    growth_rate: string;
    egg_cycles: string;
    egg_groups: string;
  }
  
  interface PokedexEntry{
    number: number;
    generation: number;
    height: string;
    weight: string;
    catch_rate: string;
    color: string;
    shape: string;
    abilities: Ability[]
  }

  export interface PokemonDisplay {
    name: string;
    number: string;
    artwork: string;
    api_name: string;
  }

  interface Ability {
    name: string;
    hidden: boolean;
    description: string;
  }

  export interface AssignedMultipliers {
    double: string[]
    quadruple: string[]
    half: string[]
    immune: string[]
    one_fourth: string[]
    normal: string[]
  }

  export interface next_and_prev {
    next: {
      name: string
      api_name: string
      number: number
      image: string
    }
    previous: {
      name: string
      api_name: string
      number: number
      image: string
    }
  }

