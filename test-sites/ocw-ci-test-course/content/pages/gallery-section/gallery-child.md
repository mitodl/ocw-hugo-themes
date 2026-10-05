---
content_type: page
description: A child page whose galleries the section above renders inline
learning_resource_types: []
ocw_type: CourseSection
parent_title: Gallery Section
parent_type: CourseSection
parent_uid: 74fbca47-ea4f-40f1-b441-1f899b9520b4
title: Gallery Child
uid: 8c87fffd-bf19-4bd2-9aea-20b6ef65907f
weight: 10
---
A gallery whose image's credit links inside the course.

{{< image-gallery id="8c87fffd-bf19-4bd2-9aea-20b6ef65907f_nanogallery2" baseUrl="/courses/ocw-ci-test-course/" >}}
{{< image-gallery-item uuid="ed7a5780-9e6f-4b56-971b-b4e25cd173cb" href="gallery_linked_credit.png" >}}
{{< /image-gallery >}}

A gallery of lookup edge cases: a uuid that belongs to a document rather than
an image, and an item authored with no href at all.

{{< image-gallery id="8c87fffd-bf19-4bd2-9aea-20b6ef65907f_edge_nanogallery2" baseUrl="/courses/ocw-ci-test-course/" >}}
{{< image-gallery-item uuid="8e40ed3c-81d4-47e1-bf2f-4fd4a52a1da8" href="example_jpg.jpg" data-ngdesc="A document uuid" >}}
{{< image-gallery-item href="" >}}
{{< /image-gallery >}}
