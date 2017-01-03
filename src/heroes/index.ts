import { createParser, Parser } from '../utils/parser';
import { flatten, uniqBy, sortBy, findIndex } from 'lodash';
import defaultAxios from 'axios';
import { Hero, HeroRoles } from '../utils/hots-commons';

export function parseHeroesListFromIcyVeins(axios: any = defaultAxios): Promise<Array<Hero>> {
  const parser = createParser('http://www.icy-veins.com/heroes/', axios);

  return Promise.all([
    getHeroesListFromIcyVeinsCategory(parser, 'warriors'),
    getHeroesListFromIcyVeinsCategory(parser, 'assassins'),
    getHeroesListFromIcyVeinsCategory(parser, 'support'),
    getHeroesListFromIcyVeinsCategory(parser, 'specialists'),
  ])
    .then(flatten)
    .then(heroesList => heroesList.reduce((heroesList: Array<Hero>, hero) => {
      const index = findIndex(heroesList, ({ name }) => name === hero.name);
      if (index === -1) {
        heroesList.push(hero);
      } else {
        heroesList[index].builds = heroesList[index].builds.concat(hero.builds);
        heroesList[index].roles = heroesList[index].roles.concat(hero.roles);
      }
      return heroesList;
    }, []))
    .catch(() => Promise.reject('Heroes list parsing from Icy-Veins failed'));
}

function getHeroesListFromIcyVeinsCategory(parser: Parser, category: string): Promise<Array<Hero>> {
  return parser.getNodesTexts(`#nav_${category} .nav_content_block_entry_heroes_hero a span:nth-of-type(1)`)
    .then(heroesNames => heroesNames.map(heroName => ({
      name: heroName,
      roles: [ getRoleFromIcyVeinsCategory(category) ],
      builds: [],
    })));
}

function getRoleFromIcyVeinsCategory(category: string): HeroRoles {
  if (category === 'warriors') {
    return HeroRoles.Warrior;
  } else if (category === 'assassins') {
    return HeroRoles.Assassin;
  } else if (category === 'support') {
    return HeroRoles.Support;
  } else if (category === 'specialists') {
    return HeroRoles.Specialist;
  } else {
    throw new Error('Unknow Icy-Veins hero category');
  }
}

export function getHeroesListFromHotsLogs(axios: any = defaultAxios): Promise<Array<Hero>> {
  return Promise.resolve()
    .then(() => axios.get('https://api.hotslogs.com/Public/Data/Heroes'))
    .then(({ data }: { data: Array<{ PrimaryName: string, Group: string }> }) =>
      data.map(heroData => ({
        name: heroData.PrimaryName,
        roles: [ getRoleFromHotsLogsGroup(heroData.Group) ],
        builds: []
      })
    ))
    .catch(() => Promise.reject('Heroes list fetching from HotsLogs API failed'));
}

function getRoleFromHotsLogsGroup(group: string): HeroRoles {
  if (group === 'Warrior') {
    return HeroRoles.Warrior;
  } else if (group === 'Assassin') {
    return HeroRoles.Assassin;
  } else if (group === 'Support') {
    return HeroRoles.Support;
  } else if (group === 'Specialist') {
    return HeroRoles.Specialist;
  } else {
    throw new Error('Unknow HotsLogs hero group');
  }
}

export function getFullHeroesList(axios: any = defaultAxios): Promise<Array<Hero>> {
  const sources = [
    parseHeroesListFromIcyVeins(axios),
    getHeroesListFromHotsLogs(axios)
  ];
  let failureCounter = 0;

  return Promise.all(sources
      .map(promise => promise.catch(() => {
        failureCounter += 1;
        return [];
      }))
    )
    .then(heroesLists => {
      if (failureCounter === sources.length) return Promise.reject('Something went terribly wrong, could not get full heroes list');
      return heroesLists;
    })
    .then(flatten)
    .then(heroesList => uniqBy(heroesList, 'name'))
    .then(heroesList => sortBy(heroesList, 'name'));
}
