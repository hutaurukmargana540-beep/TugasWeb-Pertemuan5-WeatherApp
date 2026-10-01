# Weather App — Tugas Rutin 5 (No API Key)

Weather App responsif menggunakan **Open-Meteo API**, HTML, CSS, dan JavaScript ES6+.

> **Catatan penting:** versi ini sengaja menggunakan Open-Meteo agar website dapat langsung digunakan tanpa pengguna memasukkan API key. Jika dosen mewajibkan **OpenWeatherMap** secara spesifik, gunakan versi OpenWeatherMap yang sebelumnya.

## Requirements yang dipenuhi

1. **ES6+**: `const`, `let`, arrow function, template literals, object shorthand, `URLSearchParams`, `async/await`.
2. **Fetch API + async/await** untuk geocoding dan data cuaca.
3. Menampilkan **kota, suhu, deskripsi, ikon, kelembapan** serta detail angin, tekanan, dan visibility.
4. **Error 404**: pesan khusus jika kota tidak ditemukan.
5. **Network error**: penanganan error koneksi/fetch.
6. **Loading state** pada tombol pencarian.
7. **Array methods**: `map()`, `filter()`, dan `reduce()` digunakan pada aplikasi.
8. **Responsive/mobile-friendly** dengan media queries pada CSS.

## Bonus

- Riwayat pencarian menggunakan LocalStorage.
- Toggle °C / °F.
- Forecast 5 hari.
- **Tidak ada API key yang perlu dimasukkan pengguna.**

## Cara menjalankan

1. Ekstrak ZIP.
2. Buka folder di VS Code.
3. Jalankan `index.html` dengan Live Server.
4. Cari kota, misalnya `Medan`.
5. Pastikan perangkat terhubung ke internet karena data diambil dari API Open-Meteo.

## Kenapa tidak perlu API key?

Open-Meteo menyediakan endpoint geocoding dan weather forecast yang dapat dipanggil langsung dari frontend untuk penggunaan yang sesuai ketentuan layanan, sehingga aplikasi statis seperti tugas ini tidak membutuhkan API key.

## Struktur

```text
weather-app-tugas-rutin-5/
├── index.html
├── style.css
├── script.js
└── README.md
```
