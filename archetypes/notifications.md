{{- $name := replaceRE "-" " " .Name | replaceRE "_" " " | title -}}
---
id: "{{ now.UnixNano }}"
title: "{{ $name }}"
date: {{ .Date }}
headless: true
---
