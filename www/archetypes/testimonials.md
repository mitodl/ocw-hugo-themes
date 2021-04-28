{{- $name := replaceRE "-" " " .Name | replaceRE "_" " " | title -}}
---
title: "{{ $name }}"
name: "{{ $name }}"
date: {{ .Date }}
location: ADD LOCATION
occupation: ADD OCCUPATION
image: /images/testimonials/[filename].jpg
leadquote: "One sentence that stands out from the testimonial."
---

# {{ $name }}

**Insert learner biography here**
