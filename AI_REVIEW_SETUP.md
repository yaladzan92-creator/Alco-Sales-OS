# 🤖 AI Code Review & Auto-Fix Setup

Sekarang repository Anda sudah dilengkapi dengan sistem AI Code Review menggunakan OpenAI GPT-4!

## ✨ Fitur

✅ **Automatic Code Review** - Scan seluruh repository  
✅ **Bug Detection** - Deteksi masalah keamanan & performa  
✅ **Auto-Fix** - Perbaiki code secara otomatis  
✅ **PR Comments** - Review automation di setiap PR  
✅ **TypeScript Support** - Khusus untuk TS/TSX  

## 🚀 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup OpenAI API Key
Tambahkan ke `.env.local`:
```env
OPENAI_API_KEY=sk-your-key-here
```

### 3. Generate GitHub Token (untuk PR automation)
```bash
# Di GitHub Settings → Developer settings → Personal access tokens
# Berikan permissions: repo, workflow
```

Tambahkan ke GitHub Secrets:
- Repository → Settings → Secrets and variables → Actions
- Nama: `OPENAI_API_KEY` dan `GITHUB_TOKEN`

## 📖 Cara Penggunaan

### Manual Review (Lokal)
```bash
# Review seluruh repository tanpa perbaikan
npm run ai-review

# Review + Auto-fix (akan mengubah files)
npm run ai-review:fix
```

### Automatic PR Review
1. Push code ke repository
2. Buat Pull Request
3. AI akan otomatis:
   - Review setiap file yang berubah
   - Posting comment dengan findings
   - Suggest perbaikan

### GitHub Actions Workflow
File: `.github/workflows/ai-code-review.yml`
- Berjalan otomatis saat PR dibuka
- Berjalan otomatis saat push ke main
- Commit auto-fixes jika ada

## 🔧 Customization

### Ubah Model AI
Di `scripts/code-reviewer.ts` atau `scripts/ai-review.js`, ubah:
```typescript
model: 'gpt-4-turbo'  // atau 'gpt-3.5-turbo', 'gpt-4o'
```

### Exclude Directories
Di `scripts/code-reviewer.ts`, update array:
```typescript
if (['node_modules', 'dist', '.git', 'custom-dir'].includes(item)) continue;
```

### Customize Review Rules
Edit prompt di `reviewFile()` function

## 📊 Output Contoh

```
🤖 Reviewing: src/pages/Dashboard.tsx
  ⚠️  Issues: 2
    - Missing null check on config object
    - Unused import: useEffect
  ✅ File fixed and saved!
```

## 🎯 Next Steps

1. ✅ Push setup ini ke repository
2. ✅ Set `OPENAI_API_KEY` di GitHub Secrets
3. ✅ Test dengan: `npm run ai-review`
4. ✅ Buat PR untuk trigger automation

## ⚙️ Troubleshooting

**Error: OPENAI_API_KEY not found**
- Set di `.env.local` untuk local development
- Set di GitHub Secrets untuk automation

**Workflow tidak jalan**
- Check: GitHub Actions enabled
- Check: API key valid di GitHub Secrets
- View logs: Actions tab di GitHub

**Files tidak ke-auto-fix**
- Run: `npm run ai-review:fix`
- Atau enable `AUTO_FIX=true` di GitHub Actions

---

Sekarang code Anda akan selalu di-review dan di-fix otomatis! 🎉
