import defaultAxios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

export interface Parser {
  getNodesTexts(selector: string): Promise<Array<string>>;
}

export function createParser(url: string, axios: AxiosInstance = defaultAxios): Parser {
  let $;
  const html: Promise<CheerioStatic> = Promise.resolve() // ensure errors are .catch'ed instead of throwing
    .then(() => axios.get(url))
    .then(({ data }) => cheerio.load(data))
    .then($html => $ = $html);

  return {
    getNodesTexts(selector) {
      return html.then($ => {
        const texts = [];
        $(selector).each((_, node) => texts.push($(node).text()));
        return texts;
      });
    }
  };
}
