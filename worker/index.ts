const APEX_HOSTNAME = "tecmogeek.com";
const CANONICAL_HOSTNAME = "www.tecmogeek.com";

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === APEX_HOSTNAME) {
      url.hostname = CANONICAL_HOSTNAME;
      return Response.redirect(url, 308);
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
