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
  let input = ""

  const chunks = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk)
  }
  input = chunks.join("")

  const { data } = JSON.parse(input)

  let message = "Lighthouse results:\n\n"

  data.forEach(entry => {
    const { url, scores } = entry
    const {
      accessibility,
      bestPractices,
      performance,
      progressiveWebApp,
      seo
    } = scores

    message += `results for [${url}]:\n\n`
    message +=
      "| Accessibility | Best Practices | Performance | Progressive Web App | SEO |\n"
    message +=
      "| --------------- | --------------- | ------------ | ------------------- | ------ |\n"
    message += `| ${accessibility} ${emojify(
      accessibility
    )} | ${bestPractices} ${emojify(bestPractices)} | ${performance} ${emojify(
      performance
    )} | ${progressiveWebApp} ${emojify(progressiveWebApp)} | ${seo} ${emojify(
      seo
    )} |\n\n`
  })

  process.stdout.write(message)
}

main()
