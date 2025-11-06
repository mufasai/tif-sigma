# CSV Join Tool Guide

## Fitur
- Upload 2 file CSV
- Pilih kolom join dari masing-masing file
- Full outer join (mempertahankan semua data dari kedua file)
- Loading animation yang menarik
- Preview hasil join
- Export hasil ke CSV

## Cara Menggunakan

1. Klik button dengan icon merge cells di control panel
2. Upload File 1 dan File 2 (format CSV) dengan 2 cara:
   - **Click**: Klik area upload untuk memilih file
   - **Drag & Drop**: Drag file CSV dan drop ke area upload
3. Pilih kolom join untuk masing-masing file
4. Klik "Join Data"
5. Tunggu proses join selesai (dengan animasi loading)
6. Preview hasil join
7. Klik "Export CSV" untuk download hasil

## Contoh File CSV untuk Testing

### File 1: devices.csv
```csv
hostname,ip_address,location
router-01,192.168.1.1,Jakarta
switch-01,192.168.1.2,Bandung
router-02,192.168.1.3,Surabaya
```

### File 2: device_info.csv
```csv
hostname,manufacturer,model,status
router-01,Cisco,ISR4331,Active
switch-01,Arista,7050SX,Active
firewall-01,Juniper,SRX300,Active
```

### Hasil Join (Full Outer Join)
Semua data dari kedua file akan digabungkan berdasarkan kolom hostname.
Data yang tidak memiliki pasangan tetap akan dipertahankan.

## Teknologi
- React + TypeScript
- PapaParse untuk CSV parsing
- CSS animations untuk loading effects
- Design mengikuti style guide aplikasi (Lora + Public Sans fonts, Ruby color scheme)

## Design System
Komponen ini menggunakan design system yang sama dengan aplikasi utama:
- **Font**: Lora (headings), Public Sans (body)
- **Colors**: Ruby (#e22653), Grey tones, Cream (#f9f7ed)
- **Spacing**: Em-based units untuk konsistensi
- **Border radius**: 3px
- **Transitions**: 300ms ease-out
