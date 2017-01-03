import { parseHeroesListFromIcyVeins, getHeroesListFromHotsLogs, getFullHeroesList } from '../../src/heroes';
import { createAxiosMock } from '../utils';
import { readFileSync } from 'fs';
import { deepEqual as assertDeepEqual, ok } from 'assert';
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

    it('can handle dual roles heroes', () => {
      const axios = createAxiosMock({
        'GET http://www.icy-veins.com/heroes/': {
          status: 200,
          response: `
            <div id="nav_warriors">
              <div class="nav_content_block_entry_heroes_hero">
                <div>
                  <a><span>Varian</span></a>
                </div>
              </div>
            </div>
            <div id="nav_assassins">
              <div class="nav_content_block_entry_heroes_hero">
                <a><span>Varian</span></a>
              </div>
            </div>
            `
        }
      });

      return Promise.resolve()
        .then(() => parseHeroesListFromIcyVeins(axios))
        .then(heroesList => {
          assertDeepEqual(heroesList, [
            { name: 'Varian', roles: [ HeroRoles.Warrior, HeroRoles.Assassin ], builds: [] },
          ]);
        });

    });

    it('can handle failed HTTP request', () => {

      const axios = createAxiosMock({
        'GET http://www.icy-veins.com/heroes/': {
          status: 500,
          response: ''
        }
      });

      return Promise.resolve()
        .then(() => parseHeroesListFromIcyVeins(axios))
        .then(
          () => Promise.reject('Failing request did not reject'),
          e => ok(/parsing.*failed/.test(e)) // helpful error message
        );

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

    it('can handle failed HTTP request', () => {

      const axios = createAxiosMock({
        'GET https://api.hotslogs.com/Public/Data/Heroes': {
          status: 500,
          response: []
        }
      });

      return Promise.resolve()
        .then(() => getHeroesListFromHotsLogs(axios))
        .then(
          () => Promise.reject('Failing request did not reject'),
          e => ok(/fetching.*failed/.test(e)) // helpful error message
        );

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

    it('keeps working if only one source failed', () => {

      return Promise.resolve()
        .then(() => {
          const axios = createAxiosMock({
            'GET https://api.hotslogs.com/Public/Data/Heroes': {
              status: 500,
              response: []
            },
            'GET http://www.icy-veins.com/heroes/': {
              status: 200,
              response: `
                <div id="nav_specialists">
                  <div class="nav_content_block_entry_heroes_hero">
                    <a><span>Murky</span></a>
                  </div>
                </div>
                `
            }
          });
          return getFullHeroesList(axios);
        })
        .then(heroesList => {
          assertDeepEqual(heroesList, [
            { name: 'Murky', roles: [ HeroRoles.Specialist ], builds: [] }
          ]);
        })
        .then(() => {
          const axios = createAxiosMock({
            'GET https://api.hotslogs.com/Public/Data/Heroes': {
              status: 200,
              response: [ { PrimaryName: 'Murky', Group: 'Specialist' } ]
            },
            'GET http://www.icy-veins.com/heroes/': {
              status: 500,
              response: ''
            }
          });
          return getFullHeroesList(axios);
        })
        .then(heroesList => {
          assertDeepEqual(heroesList, [
            { name: 'Murky', roles: [ HeroRoles.Specialist ], builds: [] }
          ]);
        });

    });

    it('fails if all sources failed', () => {

      const axios = createAxiosMock({
        'GET https://api.hotslogs.com/Public/Data/Heroes': {
          status: 500,
          response: []
        },
        'GET http://www.icy-veins.com/heroes/': {
          status: 500,
          response: ''
        }
      });

      return Promise.resolve()
        .then(() => getFullHeroesList(axios))
        .then(
          () => Promise.reject('All sources failing did not reject'),
          e => ok(/wrong.*could not/.test(e)) // helpful error message
        );

    });

  });

});
