export enum HeroRoles {
  Assassin,
  Warrior,
  Specialist,
  Support
}

export interface Skill {
  name: string;
  level: number;
  description: string;
}

export interface Build {
  name: string;
  skills: Array<Skill>;
}

export interface Hero {
  name: string;
  role: HeroRoles|Array<HeroRoles>;
  builds: Array<Build>;
}
