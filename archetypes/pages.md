{{- $name := replaceRE "-" " " .Name | replaceRE "_" " " | title -}}
---
title: "{{ $name }}"
date: {{ .Date }}
---

**Insert content here**
