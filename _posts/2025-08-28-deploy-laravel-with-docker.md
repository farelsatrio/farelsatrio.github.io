---
layout: post
title: "Deploy Laravel dengan Docker"
date: 2025-08-28 12:00:00 +0700
categories: laravel docker tutorial
---

## 1. Latar Belakang

Di dunia pengembangan aplikasi, kita sering menghadapi tantangan besar ketika aplikasi yang berjalan lancar di laptop harus dipindahkan ke server atau environment lain...

## 2. Pengertian

**Laravel** adalah framework PHP yang sangat populer karena memudahkan kita membangun aplikasi web yang modern dan mudah dikelola...

**Docker** adalah platform open-source yang memanfaatkan teknologi containerization untuk mengemas aplikasi beserta seluruh dependensi dan konfigurasinya...

## 3. Praktik

### A. Topologi

...

### B. Setup Environment

- Ubuntu 22.04 (virtualbox)
- Docker
- Mysql-Server

### C. Siapkan source code

- Tambahkan baris `<meta name="csrf-token" content="{{ csrf_token() }}">` ke file `welcome.blade.php`
- Edit file `config/database.php`, ubah `'strict' => false`
- Edit file `db_gudang.sql` untuk memperbaiki trigger

### D. Setup Database

- Masuk ke mysql: `sudo mysql -u root`
- Membuat database: `CREATE DATABASE db_gudang;`
- Membuat user: `CREATE USER 'farel'@'%' IDENTIFIED BY 'farel123';`
- Memberikan hak akses: `GRANT ALL PRIVILEGES ON db_gudang.* TO 'farel'@'%';`
- Edit file `/etc/mysql/mysql.conf.d/mysqld.cnf` → `bind-address = 0.0.0.0`
- Import database: `sudo mysql -u root -p db_gudang < db_gudang.sql`

### E. Deploy Laravel

1. Buat Dockerfile
2. Buat file `000-default.conf`
3. Build image: `docker build -t exam .`
4. Jalankan container: `docker run -d --name exam -p 80:80 exam`
5. Akses di browser dengan login:
   - Username: admin
   - Password: admin
