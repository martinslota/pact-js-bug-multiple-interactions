"use strict";

const axios = require("axios");
const expect = require("chai").expect;
const path = require("path");
const { Pact } = require("@pact-foundation/pact");
const LOG_LEVEL = process.env.LOG_LEVEL || "DEBUG";

describe("Test Pact.js", () => {
  const port = 8992;

  const provider = new Pact({
    port: port,
    log: path.resolve(process.cwd(), "logs", "mockserver-integration.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    spec: 2,
    consumer: "MyConsumer",
    provider: "MyProvider",
    logLevel: LOG_LEVEL,
  });

  // Setup the provider
  before(() => provider.setup());

  // Write Pact when all tests done
  after(() => provider.finalize());

  // verify with Pact, and reset expectations
  afterEach(() => provider.verify());

  before(async () => {
    function generateInteraction(index) {
      return {
        state: `state ${index}`,
        uponReceiving: `request ${index}`,
        withRequest: {
          method: "GET",
          path: `/${index}`,
        },
        willRespondWith: {
          status: 200,
        },
      };
    }
    await provider.addInteraction(generateInteraction(1));
    await provider.addInteraction(generateInteraction(2));
  });

  it("works with two interactions", async () => {
    const response1 = await axios.request({
      method: "GET",
      baseURL: `http://localhost:${port}`,
      url: "/1",
    });
    expect(response1.status).to.equal(200);

    const response2 = await axios.request({
      method: "GET",
      baseURL: `http://localhost:${port}`,
      url: "/2",
    });
    expect(response2.status).to.equal(200);
  });
});
