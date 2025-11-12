# Perubahan Routing dan Layer Order

## Perubahan yang Dilakukan

### 1. Routing dengan React Router
- **Installed**: `react-router-dom` dan `@types/react-router-dom`
- **File yang diubah**: 
  - `packages/demo/src/index.tsx` - Menambahkan BrowserRouter dan Routes
  - `packages/demo/src/views/Root.tsx` - Menggunakan `useNavigate()` untuk navigasi
  - `packages/demo/src/views/MapLibreView.tsx` - Menambahkan `useNavigate()` untuk back navigation

### 2. Routes yang Tersedia
- `/` - Halaman utama (Sigma Graph View)
- `/map` - MapLibre View dengan multilayer GeoJSON
- `*` - Redirect ke halaman utama

### 3. Layer Order di MapLibreView
Layer sekarang ditampilkan dengan urutan dari bawah ke atas:
1. **Polygon Fill** (paling bawah)
2. **Polygon Outline**
3. **Line Glow**
4. **Line**
5. **Points** (paling atas - vendor-based colors)
6. **Polygon Hover** (interaksi)

### 4. Default Layer
- Multilayer GeoJSON sekarang ditampilkan secara default saat halaman dimuat
- Dropdown layer selector menunjukkan "multilayer" sebagai pilihan default

## Cara Menggunakan

### Navigasi ke MapLibre View
1. Dari halaman utama, klik tombol dengan icon peta (FiMap)
2. Atau akses langsung via URL: `http://localhost:5000/demo/map`

### Refresh Halaman
- Halaman MapLibre View sekarang dapat di-refresh tanpa kehilangan state
- URL akan tetap `/demo/map` setelah refresh

### Kembali ke Halaman Utama
- Klik tombol "Tutup" di MapLibre View
- Atau gunakan tombol back browser

## Technical Details

### BrowserRouter Configuration
```tsx
<BrowserRouter basename="/demo">
  <Routes>
    <Route path="/" element={<Root />} />
    <Route path="/map" element={<MapLibreView onClose={() => window.history.back()} />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>
```

### Layer Rendering Order
Layers ditambahkan dalam urutan tertentu untuk memastikan points berada di atas:
1. Polygon layers (fill, outline)
2. Line layers (glow, main)
3. Point layer (top)
4. Hover effects (interactive)

## Benefits
✅ URL persisten - dapat bookmark dan share
✅ Browser back/forward berfungsi dengan baik
✅ Refresh halaman tidak kehilangan state
✅ Layer order yang benar (points di atas)
✅ Multilayer GeoJSON ditampilkan secara default
