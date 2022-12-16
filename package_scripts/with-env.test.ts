import execShCb from "exec-sh"

describe("with-env", () => {
  it("Exits successfully if subcommand exits with 0", async () => {
    const command = `yarn with-env --dev -- exit 0`
    await execShCb.promise(command)
  })

  it("Exits with error if subcommand exits with 1", async () => {
    const command = `yarn with-env --dev -- exit 1`
    expect.assertions(1)
    await expect(execShCb.promise(command)).rejects.toThrow(
      "Shell command exit with non zero code: 1"
    )
  })
})
