---
content_type: page
description: 'shortcode demonstrations description '
draft: false
title: Shortcode Demonstrations
uid: 7e1d1926-96b4-4f0c-b4b6-2f34ab7562f6
---
### Resource Link

Check no extra spaces xxx{{% resource_link "38167987-b1af-4544-86a1-909a7cdb4f18" "Resource link to First Test Page" %}}xxx

### Subscripts and Superscripts

Not really a shortcode, but that's ok.

Plain old sub<sub>scripts</sub> and <sup>super</sup>scripts and Hello<sup>world 123</sup>. Cool.!

Now in **bold**: the quick brown **fox sub<sub>scripts</sub> and <sup>super</sup>scripts jumps** over the lazy and **Hello<sup>world 123</sup>. Cool** cool!.

Now in italic: the quick brown *fox sub<sub>scripts</sub> and <sup>super</sup>scripts jumps* over the lazy. and *Hello<sup>world 123</sup>. Cool* cool!.

Now with interior **bold**: the quick brown fox sub<sub>sc</sub>**<sub>rip</sub>**<sub>ts</sub> and <sup>s</sup>**<sup>upe</sup>**<sup>r</sup>scripts jumps over the lazy and Hello<sup>wor</sup>**<sup>ld 1</sup>**<sup>23</sup>. Cool cool!.

Now with interior italics: the quick brown fox sub<sub>sc</sub>*<sub>rip</sub>*<sub>ts</sub> and <sup>s</sup>*<sup>upe</sup>*<sup>r</sup>scripts jumps over the lazy. and Hello<sup>wo</sup>*<sup>rld 12</sup>*<sup>3</sup>. Cool cool!.

And in links: lorem ipsum dolor[<sup>[1]</sup>](https://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts). blah blah[<sup>footnote 2</sup>](https://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts).

And in resource links: lorem ipsum dolor{{% resource_link "38167987-b1af-4544-86a1-909a7cdb4f18" "<sup>[3]</sup>" %}}. blah blah {{% resource_link "38167987-b1af-4544-86a1-909a7cdb4f18" "<sup>see sylabus</sup>" %}}. blah

What about in tables?

{{< tableopen >}}{{< theadopen >}}{{< tropen >}}{{< thopen >}}
Header ONE!
{{< thclose >}}{{< thopen >}}
Header DOS
{{< thclose >}}{{< thopen >}}
Three
{{< thclose >}}{{< trclose >}}{{< theadclose >}}{{< tbodyopen >}}{{< tropen >}}{{< tdopen >}}
alpha
{{< tdclose >}}{{< tdopen >}}
See[<sup>†</sup>](https://mit.edu)
{{< tdclose >}}{{< tdopen >}}
lorem
{{< tdclose >}}{{< trclose >}}{{< tropen >}}{{< tdopen >}}
beta
{{< tdclose >}}{{< tdopen >}}
Also see{{% resource_link "d89d89f6-49b1-4cde-ab8e-840e4ed76118" "<sup>‡</sup>" %}}. Cool!
{{< tdclose >}}{{< tdopen >}}
ipsum
{{< tdclose >}}{{< trclose >}}{{< tbodyclose >}}{{< tableclose >}}