---
layout: post
title: "Deploy Laravel menggunakan Docker"
date: 2025-08-28 12:00:00 +0700
categories: [Laravel, Docker, Tutorial]
tags: [laravel, docker, deployment, php]
author: Farel Satrio Pratama
excerpt: "Cara deploy aplikasi Laravel menggunakan Docker agar bisa berjalan diberbagai environment."
image:
  path: /assets/images/laravel-docker.png
  alt: Deploy Laravel dengan Docker
---

## 1. Latar Belakang

Di dunia pengembangan aplikasi, kita sering menghadapi tantangan besar ketika aplikasi yang berjalan lancar di laptop harus dipindahkan ke server atau environment lain. Perbedaan versi, sistem operasi, hingga konfigurasi server bisa menyebabkan aplikasi error atau bahkan tidak dapat berjalan sama sekali. Bayangkan betapa repotnya harus mengatur ulang semua dependensi agar seragam di setiap environment.

Di sinilah Docker hadir sebagai solusi. Docker adalah teknologi containerization yang memungkinkan kita mengemas aplikasi beserta semua kebutuhannya seperti library, konfigurasi, dan versi perangkat lunak tertentu ke dalam sebuah container. Container ini ibarat kotak portabel yang dapat berjalan di mana saja, baik di laptop, server, maupun cloud, tanpa khawatir terhadap perbedaan environment.

Untuk proyek Laravel maupun framework lainnya, Docker sangat membantu karena aplikasi modern sering membutuhkan dependensi dan konfigurasi yang spesifik. Dengan Docker, proses deployment ke production menjadi lebih mudah dan konsisten. Skalabilitas pun menjadi lebih sederhana, karena kita dapat menambah jumlah container sesuai kebutuhan.

## 2. Pengertian

### Laravel

Laravel adalah framework PHP yang sangat populer karena memudahkan kita membangun aplikasi web yang modern dan mudah dikelola. Dengan sintaksis yang bersih, fitur Eloquent ORM untuk pengelolaan database, Blade sebagai templating engine, serta sistem routing yang intuitif, Laravel menjadi pilihan utama banyak developer dalam mengembangkan aplikasi web secara cepat dan terstruktur.

### Docker

Docker adalah platform open-source yang memanfaatkan teknologi containerization untuk mengemas aplikasi beserta seluruh dependensi dan konfigurasinya ke dalam satu unit yang ringan dan dapat dijalankan secara konsisten di berbagai environment. Dengan menggunakan Docker, aplikasi dapat berjalan secara terisolasi dalam sebuah container yaitu wadah mandiri yang mencakup seluruh komponen yang dibutuhkan, seperti sistem file, library, dan runtime tanpa bergantung pada konfigurasi khusus dari host tempat container tersebut dijalankan.

## 3. Praktik

### A. Topologi
![Topologi Laravel Docker](/assets/images/topologi.png)

### B. Persyaratan
```bash
aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json

- Ubuntu 22.04 (virtualbox)
- Docker
- Mysql-Server

### C. Siapkan source code

- Source code: [Download di sini](https://github.com/farelsatrio/sistem-informasi-gudang-berbasis-web-laravel.git)

- Tambahkan baris `<meta name="csrf-token" content="{{ csrf_token() }}" />` ke file `sistem-informasi-gudang-berbasis-web-laravel/si_gudang/resources/views/welcome.blade.php`
  Karena aplikasi menggunakan AJAX untuk berkomunikasi dengan backend Laravel, token CSRF diperlukan untuk memastikan permintaan aman.

- Edit file `sistem-informasi-gudang-berbasis-web-laravel/si_gudang/config/database.php`
  Ubah bagian `strict` menjadi `false` untuk mencegah terjadinya error saat menyimpan data:
  ```php
  'strict' => false,

  
### 2. **Kode Dockerfile**

```markdown
```dockerfile
FROM php:7.4-apache
RUN apt update
RUN docker-php-ext-install pdo_mysql
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite
COPY sistem-informasi-gudang-berbasis-web-laravel /var/www/
WORKDIR /var/www/si_gudang/
RUN sed -i 's/DB_HOST=127.0.0.1/DB_HOST=10.10.10.123/g' .env && \
    sed -i 's/DB_USERNAME=root/DB_USERNAME=farel/g' .env && \
    sed -i 's/DB_PASSWORD=/DB_PASSWORD=farel123/g' .env
RUN chmod -R 775 /var/www/si_gudang && \
    chown -R www-data:www-data /var/www/si_gudang
CMD ["apache2-foreground"]