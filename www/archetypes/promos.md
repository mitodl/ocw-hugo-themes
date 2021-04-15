{{- $name := replaceRE "-" " " .Name | replaceRE "_" " " | title -}}
---
title: "{{ $name }}"
subtitle: 
link_title:
link_url: https://example.com/promo
date: {{ .Date }}
image: /images/promo-carousel/[filename].jpg
---
