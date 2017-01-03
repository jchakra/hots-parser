export function createAxiosMock(mockDefinition: { [request: string]: { status: number, response: any } }): any {
  return {
    get(url: string) {
      const { status, response } = mockDefinition[`GET ${url}`];

      if (status !== 200) {
        return Promise.reject({ data: response });
      }

      return Promise.resolve({ data: response });
    },
  };
}
