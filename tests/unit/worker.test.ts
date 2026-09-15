import { describe, expect, it, vi } from "vitest";

import worker from "../../worker/index";

describe("canonical hostname routing", () => {
  it("redirects the apex hostname to www while preserving the request URL", async () => {
    const assetsFetch = vi.fn();
    const response = await worker.fetch(
      new Request("https://tecmogeek.com/teams/bills/?season=1991"),
      { ASSETS: { fetch: assetsFetch } },
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://www.tecmogeek.com/teams/bills/?season=1991",
    );
    expect(assetsFetch).not.toHaveBeenCalled();
  });

  it("serves assets directly on the canonical hostname", async () => {
    const request = new Request("https://www.tecmogeek.com/teams/");
    const assetResponse = new Response("teams");
    const assetsFetch = vi.fn().mockResolvedValue(assetResponse);

    const response = await worker.fetch(request, {
      ASSETS: { fetch: assetsFetch },
    });

    expect(response).toBe(assetResponse);
    expect(assetsFetch).toHaveBeenCalledWith(request);
  });
});
