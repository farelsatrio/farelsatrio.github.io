---
layout: post
title: "Deploy Laravel menggunakan Docker"
date: 2025-08-28 12:00:00 +0700
categories: [Laravel, Docker, Tutorial]
tags: [laravel, docker, deployment, php]
author: Farel Satrio Pratama
excerpt: "Cara deploy aplikasi Laravel menggunakan Docker agar bisa berjalan diberbagai environment."
image: /assets/images/laravel-docker.png
---
![laravel-docker](/assets/images/laravel-docker.png)
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

- Ubuntu 22.04 (virtualbox)
- Docker
- Mysql-Server

### C. Siapkan source code

- Source code: [Download di sini](https://github.com/farelsatrio/sistem-informasi-gudang-berbasis-web-laravel.git)

- Tambahkan baris `<meta name="csrf-token" content="{{ csrf_token() }}" />` ke file `sistem-informasi-gudang-berbasis-web-laravel/si_gudang/resources/views/welcome.blade.php`
  Karena aplikasi menggunakan AJAX untuk berkomunikasi dengan backend Laravel, token CSRF diperlukan untuk memastikan permintaan aman.
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.5; font-family: 'Courier New', monospace;">
    <pre style="margin: 0;"><code class="language-html">
  <meta name=&quot;csrf-token&quot; content=&quot;&#123;&#123; csrf_token() &#125;&#125;&quot;>
    </code></pre>
  </div>


- Edit file `sistem-informasi-gudang-berbasis-web-laravel/si_gudang/config/database.php`
  Ubah bagian `strict` menjadi `false` untuk mencegah terjadinya error saat menyimpan data:
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.5; font-family: 'Courier New', monospace;">
    <pre style="margin: 0;"><code class="language-bash">
  'strict' => false,
    </code></pre>
  </div>


- Edit file sistem-informasi-gudang-berbasis-web-laravel/database/db_gudang.sql. Ubah pada bagian trigger seperti di bawah untuk  memisahkan akhir blok trigger (END) dari akhir perintah SQL (;)
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.4;">
  <pre style="margin: 0;"><code class="language-bash">
  DROP TRIGGER IF EXISTS barang_masuk;
  DELIMITER $$
  CREATE TRIGGER `barang_masuk` AFTER INSERT ON `purchases` FOR EACH ROW BEGIN
          UPDATE products SET stok_produk = stok_produk+NEW.qty_purchase
      WHERE id_produk = NEW.id_produk;
  END;
  $$
  DELIMITER ;

  DROP TRIGGER IF EXISTS cancel_purchase;
  DELIMITER $$
  CREATE TRIGGER `cancel_purchase` AFTER DELETE ON `purchases` FOR EACH ROW BEGIN
          UPDATE products SET stok_produk = products.stok_produk - OLD.qty_purchase
          WHERE id_produk = OLD.id_produk;
  END;
  $$
  DELIMITER ;

  DROP TRIGGER IF EXISTS pengambilan;
  DELIMITER $$
  CREATE TRIGGER `pengambilan` AFTER INSERT ON `sells` FOR EACH ROW BEGIN
          UPDATE products SET stok_produk = stok_produk-NEW.qty
      WHERE id_produk = NEW.id_produk;
  END;
  $$
  DELIMITER ;

  DROP TRIGGER IF EXISTS cancel_sell;
  DELIMITER $$
  CREATE TRIGGER `cancel_sell` AFTER DELETE ON `sells` FOR EACH ROW BEGIN
          UPDATE products SET stok_produk = products.stok_produk + OLD.qty
          WHERE id_produk = OLD.id_produk;
  END;
  $$
  DELIMITER ;

  </code></pre>
  </div>

### D. Setup Database

- Masuk ke mysql
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.4;">
    <pre style="margin: 0;"><code class="language-bash">
  sudo mysql -u root
    </code></pre>
  </div>

- Membuat database dengan nama db_gudang 
db_gudang digunakan untuk database app laravel
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.4;">
    <pre style="margin: 0;"><code class="language-bash">
  CREATE DATABASE db_gudang;
    </code></pre>
  </div>

- Membuat user mysql bernama farel dengan password farel123
Menggunakan % agar bisa diakses dari ip luar
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.4;">
    <pre style="margin: 0;"><code class="language-bash">
  CREATE USER ‘farel’@’%’ IDENTIFIED BY ‘farel123’;
    </code></pre>
  </div>

- Memberikan hak akses database  db_gudang ke user farel
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px margin-bottom: 12px;; line-height: 1.4;">
    <pre style="margin: 0;"><code class="language-bash">
  GRANT ALL PRIVILEGES ON db_gudang.* TO ‘farel’@’%’;
    </code></pre>
  </div>

- Simpan perubahan
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.4;">
    <pre style="margin: 0;"><code class="language-bash">
  FLUSH PRIVILEGES;
    </code></pre>
  </div>

- Edit file /etc/mysql/mysql.conf.d/mysqld.cnf agar bisa menerima koneksi dari semua alamat IP
  Edit bagian bind-address menjadi seperti berikut:
    <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.4;">
    <pre style="margin: 0;"><code class="language-bash">
  bind-address            = 0.0.0.0
    </code></pre>
  </div><br><br>
- Import database
    <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.4;">
    <pre style="margin: 0;"><code class="language-bash">
  sudo mysql -u root -p db_gudang < db_gudang.sql
    </code></pre>
  </div><br><br>

### E. Deploy Laravel

- Buat `Dockerfile`
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.4;">
    <pre style="margin: 0;"><code class="language-bash">
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
    </code></pre>
  </div>
  - FROM php:7.4-apache : Base image yang digunakan adalah php:7.4-apache
  - RUN apt update : Perbarui package
  - RUN docker-php-ext-install pdo_mysql : Install ekstensi PHP untuk MySQL
  - COPY --from=composer:latest /usr/bin/composer /usr/bin/composer : Salin Composer dari image lain
  - COPY 000-default.conf /etc/apache2/sites-available/000-default.conf : Salin konfigurasi Apache 
  - COPY a2enmod rewrite : Mengaktifkan modul rewrite di Apache
  - COPY sistem-informasi-gudang-berbasis-web-laravel /var/www/ : Salin kode aplikasi Laravel ke direktori /var/www
  - WORKDIR /var/www/si_gudang : Set direktori kerja default ke lokasi aplikasi
  - RUN sed -i 's/DB_HOST=127.0.0.1/DB_HOST=10.10.10.123/g' .env && \  : Ganti nilai DB_HOST di file .env. && berfungsi jika perintah ini berhasil maka jalankan perintah berikutnya. \ unutk melanjutkan perintah ke baris selanjutnya
  - sed -i 's/DB_USERNAME=root/DB_USERNAME=farel/g' && \ : Ganti nilai DB_USERNAME
  - sed -i 's/DB_PASSWORD=/DB_PASSWORD=farel123/g' .env : Ganti nilai DB_PASSWORD
  - RUN chmod -R 775 /var/www/si_gudang && \ : Mengubah hak akses file agar bisa diakses oleh Apache
  - chown -R www-data:www-data /var/www/si_gudang : Mengubah kepemilikan file ke user www-data (user Apache)
  - CMD ["apache2-foreground"] : Jalankan Apache di foreground agar container tetap jalan . Secara default, Apache berjalan di background dan container menganggap tidak ada proses yang aktif, lalu otomatis berhenti. Dengan apache2-foreground, Apache dijalankan sebagai proses utama di foreground, sehingga container tetap berjalan selama aplikasi aktif. 


- Buat file 000-default.conf untuk konfigurasi apache  agar laravel bisa diakses
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.4;">
    <pre style="margin: 0;"><code class="language-bash">
  <VirtualHost *:80>
                ServerAdmin webmaster@localhost
                DocumentRoot /var/www/si_gudang/public

                <Directory /var/www/si_gudang/public>
                Options Indexes FollowSymLinks
                AllowOverride All
                Require all granted
                </Directory>

                ErrorLog ${APACHE_LOG_DIR}/error.log
                CustomLog ${APACHE_LOG_DIR}/access.log combined

  </VirtualHost>
    </code></pre>
  </div>
  - <VirtualHost *:80> : menerima permintaan di semua alamat IP pada port 80 (HTTP)
  - DocumentRoot /var/www/si_gudang/public : Menetapkan direktori utama apache
  - <Directory /var/www/si_gudang/public> : aturan konfigurasi folder public
  - Options Indexes FollowSymLinks : Mengizinkan daftar isi direktori (jika tidak ada index) dan mengikuti symbolic link
  - AllowOverride All : Mengizinkan file .htaccess
  - Require all granted : Mengizinkan semua pengguna untuk mengakses direktori ini
  - ErrorLog ${APACHE_LOG_DIR}/error.log : Menentukan lokasi file log error
  - CustomLog ${APACHE_LOG_DIR}/access.log combined : Menentukan lokasi log akses


- Build image dari dockerfile yang sudah dibuat
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.4;">
    <pre style="margin: 0;"><code class="language-bash">
  docker build -t exam .
    </code></pre>
  </div>
  -	docker build : perintah untuk build image
  -	-t exam : memberi nama pada image
  -	.  :  lokasi dockerfile  berada di directory saat ini


- Menjalankan container dari image yang sudah di build
  <div style="background-color: #000; color: white; padding: 1px 12px; border-radius: 6px; overflow-x: auto; font-size: 16px; line-height: 1.4;">
    <pre style="margin: 0;"><code class="language-bash">
  docker run -d –-name  exam -p 80:80 exam
    </code></pre>
  </div>
  -	docker run > Jalankan container dari image
  -	-d > Jalankan di background
  -	--name exam > buat nama container exam
  -	-p 80:80 > Buka port 80 di host arahkan ke port 80 di container 
  - exam > Nama image yang digunakan

  ```sql
  GRANT ALL PRIVILEGES ON db_gudang.* TO &apos;farel&apos;@&apos;%&apos;;
  ```

  ``
  fa
  ``
- Cek aplikasi menggunakan browser
![Cek Brower](/assets/images/login.png)

- Dashboard
![Dasboard](/assets/images/dashboard.png)