{{- $name := replaceRE "-" " " .Name | replaceRE "_" " " | title -}}
---
uid: "{{ now.UnixNano }}"
title: "{{ $name }}"
date: {{ .Date }}
_build:
  list: always
  render: never
---
