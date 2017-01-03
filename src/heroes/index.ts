import { createParser, Parser } from '../utils/parser';
import { flatten, uniqBy, sortBy } from 'lodash';
import defaultAxios from 'axios';

interface Hero {
  name: string;
}

export function parseHeroesListFromIcyVeins(axios: any = defaultAxios): Promise<Array<Hero>> {
  const parser = createParser('http://www.icy-veins.com/heroes/', axios);

  return Promise.all([
    getHeroesListFromIcyVeinsCategory(parser, 'warriors'),
    getHeroesListFromIcyVeinsCategory(parser, 'assassins'),
    getHeroesListFromIcyVeinsCategory(parser, 'support'),
    getHeroesListFromIcyVeinsCategory(parser, 'specialists'),
  ])
    .then(flatten);
}

function getHeroesListFromIcyVeinsCategory(parser: Parser, category: string): Promise<Array<Hero>> {
  return parser.getNodesTexts(`#nav_${category} .nav_content_block_entry_heroes_hero a span:nth-of-type(1)`)
    .then(heroesNames => heroesNames.map(heroName => ({ name: heroName })));
}

export function getHeroesListFromHotsLogs(axios: any = defaultAxios): Promise<Array<Hero>> {
  return Promise.resolve()
    .then(() => axios.get('https://api.hotslogs.com/Public/Data/Heroes'))
    .then(({ data }: { data: Array<{PrimaryName: string}> }) => data.map(heroData => ({ name: heroData.PrimaryName })));
}

export function getFullHeroesList(axios: any = defaultAxios): Promise<Array<Hero>> {
  return Promise.all([
    parseHeroesListFromIcyVeins(axios),
    getHeroesListFromHotsLogs(axios)
  ])
    .then(flatten)
    .then(heroesList => uniqBy(heroesList, 'name'))
    .then(heroesList => sortBy(heroesList, 'name'));
}
