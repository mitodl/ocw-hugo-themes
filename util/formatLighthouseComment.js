const readline = require("readline")

const emojify = score => {
  if (score === 100) {
    return "💯"
  }

  if (score >= 90) {
    return "🎉"
  }

  if (score >= 80) {
    return "😄"
  }

  if (score >= 70) {
    return "🙂"
  }

  if (score >= 60) {
    return "😐"
  }

  if (score >= 50) {
    return "😟"
  }

  if (score >= 40) {
    return "😨"
  }

  if (score >= 30) {
    return "😰"
  }

  if (score >= 20) {
    return "😱"
  }

  return "😵"
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin
  })

  let input = ""

  for await (const line of rl) {
    input += line
  }

  const { data } = JSON.parse(input)

  let message = "Lighthouse results:\n"

  message += data
    .map(entry => {
      const { url, scores } = entry
      const {
        accessibility,
        bestPractices,
        performance,
        progressiveWebApp,
        seo
      } = scores

      return `\nresults for <${url}>:

| Accessibility   | Best Practices  | Performance  | Progressive Web App | SEO    |
| --------------- | --------------- | ------------ | ------------------- | ------ |
|${accessibility} ${emojify(accessibility)} |${bestPractices} ${emojify(
  bestPractices
)} |${performance} ${emojify(performance)}|${progressiveWebApp} ${emojify(
  progressiveWebApp
)} | ${seo} ${emojify(seo)} |\n\n`
    })
    .join("")
  console.log(message)
}

main()
