import { parseHeroesListFromIcyVeins, getHeroesListFromHotsLogs, getFullHeroesList } from '../../src/heroes';
import { createAxiosMock } from '../utils';
import { readFileSync } from 'fs';
import { deepEqual as assertDeepEqual } from 'assert';
import { HeroRoles } from '../../src/utils/hots-commons';

describe('src/heores/index.ts', () => {

  describe('parseHeroesListFromIcyVeins', () => {

    it('should be able to parse the heroes list', () => {
      const axios = createAxiosMock({
        'GET http://www.icy-veins.com/heroes/': {
          status: 200,
          response: `
            <div id="nav_warriors">
              <div class="nav_content_block_entry_heroes_hero">
                <div>
                  <a><span>Diablo</span></a>
                </div>
              </div>
            </div>
            <div id="nav_assassins">
              <div class="nav_content_block_entry_heroes_hero">
                <a><span>Valla</span></a>
              </div>
            </div>
            <div id="nav_support">
              <div class="nav_content_block_entry_heroes_hero">
                <a><span>Li Li</span></a>
              </div>
              <div class="nav_content_block_entry_heroes_hero">
                <a><span>Uther</span></a>
              </div>
            </div>
            <div id="nav_specialists">
              <div class="nav_content_block_entry_heroes_hero">
                <a><span>Murky</span></a>
              </div>
            </div>
            `
        }
      });

      return Promise.resolve()
        .then(() => parseHeroesListFromIcyVeins(axios))
        .then(heroesList => {
          assertDeepEqual(heroesList, [
            { name: 'Diablo', roles: [ HeroRoles.Warrior ], builds: [] },
            { name: 'Valla', roles: [ HeroRoles.Assassin ], builds: [] },
            { name: 'Li Li', roles: [ HeroRoles.Support ], builds: [] },
            { name: 'Uther', roles: [ HeroRoles.Support ], builds: [] },
            { name: 'Murky', roles: [ HeroRoles.Specialist ], builds: [] }
          ]);
        });

    });

  });

  describe('getHeroesListFromHotsLogs', () => {

    it('can get the heroes list from HotsLogs API', () => {

      const axios = createAxiosMock({
        'GET https://api.hotslogs.com/Public/Data/Heroes': {
          status: 200,
          response: [
            { PrimaryName: 'Diablo', Group: 'Warrior' },
            { PrimaryName: 'Li Li', Group: 'Support' },
            { PrimaryName: 'Valla', Group: 'Assassin' },
            { PrimaryName: 'Murky', Group: 'Specialist' }
          ]
        }
      });

      return Promise.resolve()
        .then(() => getHeroesListFromHotsLogs(axios))
        .then(heroesList => {
          assertDeepEqual(heroesList, [
            { name: 'Diablo', roles: [ HeroRoles.Warrior ], builds: [] },
            { name: 'Li Li', roles: [ HeroRoles.Support ], builds: [] },
            { name: 'Valla', roles: [ HeroRoles.Assassin ], builds: [] },
            { name: 'Murky', roles: [ HeroRoles.Specialist ], builds: [] }
          ]);
        });

    });

  });

  describe('getFullHeroesList', () => {

    it('returns a list based on both Icy-Veins and HotsLogs with uniq names sorted by hero name', () => {

      const axios = createAxiosMock({
        'GET https://api.hotslogs.com/Public/Data/Heroes': {
          status: 200,
          response: [
            { PrimaryName: 'Diablo', Group: 'Warrior' },
            { PrimaryName: 'Li Li', Group: 'Support' },
            { PrimaryName: 'Valla', Group: 'Assassin' },
            { PrimaryName: 'Murky', Group: 'Specialist' }
          ]
        },
        'GET http://www.icy-veins.com/heroes/': {
          status: 200,
          response: `
            <div id="nav_warriors">
              <div class="nav_content_block_entry_heroes_hero">
                <div>
                  <a><span>Diablo</span></a>
                </div>
              </div>
            </div>
            <div id="nav_assassins">
              <div class="nav_content_block_entry_heroes_hero">
                <a><span>Valla</span></a>
              </div>
            </div>
            <div id="nav_support">
              <div class="nav_content_block_entry_heroes_hero">
                <a><span>Li Li</span></a>
              </div>
              <div class="nav_content_block_entry_heroes_hero">
                <a><span>Uther</span></a>
              </div>
            </div>
            <div id="nav_specialists">
              <div class="nav_content_block_entry_heroes_hero">
                <a><span>Murky</span></a>
              </div>
            </div>
            `
        }
      });

      return Promise.resolve()
        .then(() => getFullHeroesList(axios))
        .then(heroesList => {
          assertDeepEqual(heroesList, [
            { name: 'Diablo', roles: [ HeroRoles.Warrior ], builds: [] },
            { name: 'Li Li', roles: [ HeroRoles.Support ], builds: [] },
            { name: 'Murky', roles: [ HeroRoles.Specialist ], builds: [] },
            { name: 'Uther', roles: [ HeroRoles.Support ], builds: [] },
            { name: 'Valla', roles: [ HeroRoles.Assassin ], builds: [] }
          ]);
        });

    });

  });

});
