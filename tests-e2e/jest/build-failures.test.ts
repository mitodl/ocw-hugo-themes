import * as path from "node:path";
import { IncomingMessage } from "node:http";
import LocalOCW from "../LocalOcw";
import { TestSiteAlias } from "../util/test_sites";

interface ExecError extends Error {
  stdout: string;
  stderr: string;
}

const expectBuildError = async (
  ocw: LocalOCW,
  alias: TestSiteAlias,
  messages: (string | RegExp)[]
) => {
  let error: ExecError | undefined;

  console.time(`Build site for ${alias}`);
  try {
    await ocw.buildSite(alias, { execOptions: { stdio: undefined } });
  } catch (err) {
    error = err as ExecError;
  }
  console.timeEnd(`Build site for ${alias}`);

  if (!error) {
    throw new Error(`Expected build error, but build completed successfully.`);
  }

  messages.forEach((msg) => {
    expect(error.stdout).toMatch(msg);
  });
};

describe("OCW Build Failures", () => {
  const ocw = new LocalOCW({
    rootDestinationDir: path.join(__dirname, "tmp"),
    fixturesPort: 4322,
  });

  beforeEach(async () => {
    console.log("Cleaning up temporary directory...");
    await ocw.rmrfTmp();
  });

  beforeAll(() => {
    console.log("Starting fixtures server...");
    ocw.fixturesServer.listen();
  });

  afterAll(() => {
    console.log("Stopping fixtures server...");
    ocw.fixturesServer.close();
  });

  afterEach(() => {
    console.log("Resetting fixtures server handlers...");
    ocw.fixturesServer.resetHandler();
  });

  test.each([
    {
      statusCode: 404,
      match: [/Failed to fetch instructors/, /from .*4322\/instructors/],
    },
    {
      statusCode: 504,
      match: [
        /Failed to fetch instructors/,
        /from .*4322\/instructors/,
        /with error.* Gateway Timeout/,
      ],
    },
  ])(
    "Instructor static API errors crash build",
    async ({ statusCode, match }) => {
      const shouldPatch = (req: IncomingMessage) =>
        req.url?.includes("3caa0884-4fdd-4f3c-ba39-67a64c27d877");
      ocw.fixturesServer.patchHandler((req, res) => {
        if (shouldPatch(req)) {
          console.log(`Patching response for: ${req.url}`);
          res.writeHead(statusCode);
          res.end();
        }
      });

      await expectBuildError(ocw, "course", match);
    },
    10000
  );

  test.each([
    {
      statusCode: 404,
      match: [
        /Failed to fetch featured course info/,
        /from .*4322\/courses\/some-featured-course/,
      ],
    },
    {
      statusCode: 504,
      match: [
        /Failed to fetch featured course info/,
        /from .*4322\/courses\/some-featured-course.*/,
        /with error.* Gateway Timeout/,
      ],
    },
  ])(
    "Featured course static API failures",
    async ({ statusCode, match }) => {
      const shouldPatch = (req: IncomingMessage) =>
        req.url?.includes("some-featured-course");
      ocw.fixturesServer.patchHandler((req, res) => {
        if (shouldPatch(req)) {
          console.log(`Patching response for: ${req.url}`);
          res.writeHead(statusCode);
          res.end();
        }
      });

      await expectBuildError(ocw, "www", match);
    },
    10000
  );

  test.each([
    {
      statusCode: 404,
      match: [/Failed to fetch new course info/],
    },
    {
      statusCode: 504,
      match: [
        /Failed to fetch new course info/,
        /from .*4322\/courses\/some-new-course.*/,
        /with error.* Gateway Timeout/,
      ],
    },
  ])(
    "Featured course static API failures",
    async ({ statusCode, match }) => {
      const shouldPatch = (req: IncomingMessage) =>
        req.url?.includes("some-new-course");
      ocw.fixturesServer.patchHandler((req, res) => {
        if (shouldPatch(req)) {
          console.log(`Patching response for: ${req.url}`);
          res.writeHead(statusCode);
          res.end();
        }
      });

      await expectBuildError(ocw, "www", match);
    },
    10000
  );
});
