import execShCb from "exec-sh"
import { program } from "commander"

interface Options {
  dev: boolean
  printEnv: boolean
}

program
  .name("with-env")
  .description(
    [
      "Runs a bash command with environment variables. ",
      "Environment variables are read from `.env` and validated, with default",
      "values being set for all optional variables"
    ].join("")
  )
  .option("--dev", "Sets NODE_ENV=development.", false)
  .option("--print-env", "Prints the environment variables that will be used.")
  .argument("<command...>")
  .parse()

const printEnv = (env: Record<string, string>): void => {
  /**
   * Prepend header lines with `#` so that the output is a valid env file.
   */
  console.log("# Environment variables:")
  console.log("#".repeat(32), "\n")
  Object.entries(env).forEach(([k, v]) => console.log(`${k}=${v}`))
}

const runCommand = async () => {
  const opts = program.opts<Options>()
  if (opts.dev) {
    process.env.NODE_ENV = "development"
  }
  const command = program.args.join(" ")

  /**
   * We need to load this after parsing the `--dev` flag because some of the
   * envalidate defaults use `devDefault` which needs to know the value of
   * NODE_ENV.
   */
  const { env, stringifyEnv } = await import("../env")
  const stringified = stringifyEnv(env)

  if (opts.printEnv) {
    printEnv(stringified)
  }

  const envCopy = {
    ...process.env,
    ...stringified
  } as NodeJS.ProcessEnv

  try {
    await execShCb.promise(command, { env: envCopy, stdio: "inherit" })
  } catch (err) {
    process.exit(1)
  }
}

runCommand()
