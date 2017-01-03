import { parseHeroesListFromIcyVeins } from '../../src/heroes';
import { createAxiosMock } from '../utils';
import { readFileSync } from 'fs';
import { deepEqual as assertDeepEqual } from 'assert';

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
            { name: 'Diablo' },
            { name: 'Valla' },
            { name: 'Li Li' },
            { name: 'Uther' },
            { name: 'Murky' }
          ]);
        });

    });

  });

});
