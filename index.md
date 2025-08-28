---
layout: home
title: Home
permalink: /
---

{% for post in site.posts %}
  <article class="post">
    <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
    <p>{{ post.excerpt }}</p>
    <small>{{ post.date | date: "%B %d, %Y" }} · {{ post.read_time }} min</small>
  </article>
{% endfor %}
