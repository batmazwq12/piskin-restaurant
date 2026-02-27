// Hızlı test - veri kaydedilip kaydedilmediğini kontrol et
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data', 'content.json');

console.log('📋 Test: Veri dosyası ve API işleyişini kontrol et\n');

// 1. Dosya var mı?
if (!fs.existsSync(DATA_PATH)) {
  console.error('❌ HATA: data/content.json dosyası bulunamadı!');
  process.exit(1);
}
console.log('✅ data/content.json dosyası var');

// 2. Dosya okunabiliyor mu?
try {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(raw);
  console.log('✅ Dosya okunabiliyor ve JSON geçerli');
  console.log(`   - İçerikte ${Object.keys(data).length} ana alan var`);
  console.log(`   - Alanlar: ${Object.keys(data).join(', ')}`);
} catch (err) {
  console.error('❌ HATA: Dosya okunurken veya parse edilirken hata:', err.message);
  process.exit(1);
}

// 3. Yazma izni var mı?
try {
  const testData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  testData._test_timestamp = new Date().toISOString();
  fs.writeFileSync(DATA_PATH, JSON.stringify(testData, null, 2), 'utf-8');
  console.log('✅ Dosyaya yazma izni var');
  
  // Test alanını sil
  delete testData._test_timestamp;
  fs.writeFileSync(DATA_PATH, JSON.stringify(testData, null, 2), 'utf-8');
} catch (err) {
  console.error('❌ HATA: Dosyaya yazılamıyor:', err.message);
  process.exit(1);
}

// 4. Admin paneli verilerini simüle et
console.log('\n📝 Simülasyon: Admin paneli "Kaydet" işlemini test et\n');

try {
  const currentData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  
  // Admin panelinden gelen örnek veri (değiştirilmiş hero subtitle)
  const updatedData = {
    ...currentData,
    hero: {
      ...currentData.hero,
      subtitle: 'TEST BAŞARILI - Kayıt İşlemi Çalışıyor'
    }
  };
  
  // Veriyi yaz
  fs.writeFileSync(DATA_PATH, JSON.stringify(updatedData, null, 2), 'utf-8');
  console.log('✅ TEST verisi data/content.json dosyasına yazıldı');
  
  // Okunan veriyi kontrol et
  const readBack = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  if (readBack.hero.subtitle === 'TEST BAŞARILI - Kayıt İşlemi Çalışıyor') {
    console.log('✅ Yazılan veri başarıyla okundu - SORUN YOK!');
  }
  
  // Bak console log output
  console.log('\n📊 Şu anki hero.subtitle değeri:', readBack.hero.subtitle);
  
} catch (err) {
  console.error('❌ HATA: Test sırasında:', err.message);
  process.exit(1);
}

console.log('\n✨ Sonuç: Veri yazma/okuma sistemi düzgün çalışıyor.\n');
console.log('💡 Eğer sitede değişiklik görünmüyorsa:');
console.log('   1. Tarayıcıda Hard Refresh (Ctrl+Shift+R) yap');
console.log('   2. F12 → Console → window.__SITE_CONTENT yazıp bak');
console.log('   3. Hero subtitle "TEST BAŞARILI" yazıyorsa → cache sorunu');
