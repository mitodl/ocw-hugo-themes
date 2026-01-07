---
content_type: page
description: Test page for subscripts and superscripts
draft: false
title: Subscripts and Superscripts
uid: 7b3ae5c4-3b27-4806-b0c5-f012f16fa245
---

**NOTE:** Not all of these are use-cases that we want to encourage. The goal here is to document what currently works and to alert ourselves if one of these stops working. For example, styling bold inside a subscript is absolutely not something we would encourage.

Example, Normal: Lorem ipsum dolor sit<sub>abc 123</sub> amet consectetur. Lorem ipsum dolor sit<sup>abc 123</sup> amet consectetur.

Example, Bold: **Lorem ipsum dolor sit<sub>abc 123</sub> amet consectetur. Lorem ipsum dolor sit<sup>abc 123</sup> amet consectetur.**

Example, Italic: *Lorem ipsum dolor sit<sub>abc 123</sub> amet consectetur. Lorem ipsum dolor sit<sup>abc 123</sup> amet consectetur.*

Example, Interior Bold: Lorem ipsum dolor sit<sub>abc **123**</sub> amet consectetur. Lorem ipsum dolor sit<sup>abc **123**</sup> amet consectetur.

Example, Interior italic: Lorem ipsum dolor sit<sub>abc *123*</sub> amet consectetur. Lorem ipsum dolor sit<sup>abc *123*</sup> amet consectetur.

Example, Links in scripts: Lorem ipsum dolor sit<sub>{{% resource_link "15c4e4f1-c7dd-4e2f-af6e-c59210f7710f" "abc 123" %}}</sub> amet consectetur. Lorem ipsum dolor sit<sup>{{% resource_link "15c4e4f1-c7dd-4e2f-af6e-c59210f7710f" "abc 123" %}}</sup> amet consectetur.

Example, Scripts in Links: Lorem ipsum dolor {{% resource_link "15c4e4f1-c7dd-4e2f-af6e-c59210f7710f" "sit<sub>abc 123</sub> amet" %}} consectetur. Lorem ipsum dolor {{% resource_link "15c4e4f1-c7dd-4e2f-af6e-c59210f7710f" "sit<sup>abc 123</sup> amet" %}} amet consectetur.

Example, Resource Links in scripts: Lorem ipsum dolor sit<sub>{{% resource_link "7b3ae5c4-3b27-4806-b0c5-f012f16fa245" "abc 123" %}}</sub> amet consectetur. Lorem ipsum dolor sit<sup>{{% resource_link "7b3ae5c4-3b27-4806-b0c5-f012f16fa245" "abc 123" %}}</sup> amet consectetur.

Example, Scripts in Resource Links: Lorem ipsum dolor {{% resource_link "7b3ae5c4-3b27-4806-b0c5-f012f16fa245" "sit<sub>abc 123</sub> amet" %}} consectetur. Lorem ipsum dolor {{% resource_link "7b3ae5c4-3b27-4806-b0c5-f012f16fa245" "sit<sup>abc 123</sup> amet" %}} consectetur.

### Usage in tables

{{< tableopen >}}{{< theadopen >}}{{< tropen >}}{{< thopen >}}
Header One
{{< thclose >}}{{< thopen >}}
Header Two
{{< thclose >}}{{< thopen >}}
Header Three
{{< thclose >}}{{< trclose >}}{{< theadclose >}}{{< tbodyopen >}}{{< tropen >}}{{< tdopen >}}
lorem<sub>abc 123</sub> ipsum
{{< tdclose >}}{{< tdopen >}}
lorem[<sup>†</sup>](https://mit.edu) ipsum
{{< tdclose >}}{{< tdopen >}}
lorem{{% resource_link "7b3ae5c4-3b27-4806-b0c5-f012f16fa245" "<sup>‡</sup>" %}} ipsum
{{< tdclose >}}{{< trclose >}}{{< tropen >}}{{< tdopen >}}
a
{{< tdclose >}}{{< tdopen >}}
b
{{< tdclose >}}{{< tdopen >}}
c
{{< tdclose >}}{{< trclose >}}{{< tbodyclose >}}{{< tableclose >}}