/**
 * SMART INVENTORY & ORDER MANAGER - BACKEND
 * Konfigurasi Spreadsheet ID. Ganti dengan ID Spreadsheet Anda.
 */
const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // GANTI INI NANTI

/**
 * Fungsi utama untuk melayani HTML
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  // Melewatkan parameter URL ke frontend (untuk halaman publik via QR)
  template.urlId = e.parameter.id || ''; 
  
  return template.evaluate()
    .setTitle('Smart Inventory AI')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Mendapatkan URL Web App untuk pembuatan QR Code
 */
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * Helper: Mengambil data sheet sebagai Array of Objects
 */
function getSheetData(sheetName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data;
  const result = [];
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    // Menyimpan index baris untuk keperluan update
    obj._rowIndex = i + 1; 
    result.push(obj);
  }
  return result;
}

/**
 * Autentikasi User
 */
function loginUser(username, passwordHash) {
  const users = getSheetData('Users');
  const user = users.find(u => u.username === username && u.password_hash === passwordHash);
  if (user) {
    return { success: true, user: { username: user.username, role: user.role } };
  }
  return { success: false, message: 'Username atau password salah' };
}

/**
 * Manajemen Produk
 */
function getProducts() {
  return getSheetData('Products');
}

function addProduct(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Products');
  const id = 'PRD-' + new Date().getTime();
  const now = new Date();
  sheet.appendRow([
    id, data.kode, data.nama, data.stok, data.stok_minimal, 
    data.harga_beli, data.harga_jual, data.gambar_url, now, now
  ]);
  return { success: true, message: 'Produk ditambahkan' };
}

function updateProduct(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Products');
  const products = getSheetData('Products');
  const target = products.find(p => p.id === data.id);
  
  if (target) {
    const row = target._rowIndex;
    const now = new Date();
    // Update kolom spesifik (menyesuaikan urutan kolom di sheet)
    sheet.getRange(row, 2).setValue(data.kode);
    sheet.getRange(row, 3).setValue(data.nama);
    sheet.getRange(row, 5).setValue(data.stok_minimal);
    sheet.getRange(row, 6).setValue(data.harga_beli);
    sheet.getRange(row, 7).setValue(data.harga_jual);
    sheet.getRange(row, 8).setValue(data.gambar_url);
    sheet.getRange(row, 10).setValue(now); // updated_at
    return { success: true, message: 'Produk diperbarui' };
  }
  return { success: false, message: 'Produk tidak ditemukan' };
}

/**
 * Transaksi
 */
function recordTransaction(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const transSheet = ss.getSheetByName('Transactions');
  const prodSheet = ss.getSheetByName('Products');
  
  const products = getSheetData('Products');
  const targetProd = products.find(p => p.id === data.product_id);
  
  if (!targetProd) return { success: false, message: 'Produk tidak ditemukan' };
  
  const currentStock = Number(targetProd.stok);
  const qty = Number(data.qty);
  let newStock = currentStock;
  
  if (data.type === 'sale') {
    if (currentStock < qty) return { success: false, message: 'Stok tidak mencukupi!' };
    newStock -= qty;
  } else if (data.type === 'restock') {
    newStock += qty;
  }
  
  // Update Stock di Sheet Products
  prodSheet.getRange(targetProd._rowIndex, 4).setValue(newStock);
  
  // Catat ke Sheet Transactions
  const transId = 'TRX-' + new Date().getTime();
  const now = new Date();
  transSheet.appendRow([
    transId, data.product_id, targetProd.nama, qty, data.type, data.user, now
  ]);
  
  return { success: true, message: 'Transaksi berhasil dicatat' };
}

/**
 * Dashboard Data
 */
function getDashboardData() {
  const products = getSheetData('Products');
  const transactions = getSheetData('Transactions');
  
  let totalProducts = products.length;
  let totalStock = 0;
  let inventoryValue = 0;
  let lowStockProducts = [];
  
  products.forEach(p => {
    totalStock += Number(p.stok);
    inventoryValue += (Number(p.stok) * Number(p.harga_beli));
    if (Number(p.stok) <= Number(p.stok_minimal)) {
      lowStockProducts.push(p);
    }
  });
  
  // Hitung transaksi hari ini
  const today = new Date();
  today.setHours(0,0,0,0);
  let todayTransactions = transactions.filter(t => new Date(t.timestamp) >= today).length;
  
  // Data chart 7 hari terakhir (hanya penjualan)
  const chartData = { labels: [], data: [] };
  for (let i = 6; i >= 0; i--) {
    let d = new Date();
    d.setDate(d.getDate() - i);
    chartData.labels.push(d.toLocaleDateString('id-ID', {day: '2-digit', month: 'short'}));
    
    let dailySales = transactions.filter(t => {
      let tDate = new Date(t.timestamp);
      return t.type === 'sale' && tDate.getDate() === d.getDate() && tDate.getMonth() === d.getMonth();
    }).reduce((sum, t) => sum + Number(t.qty), 0);
    
    chartData.data.push(dailySales);
  }
  
  return {
    totalProducts, totalStock, inventoryValue, todayTransactions, lowStockProducts, chartData
  };
}

/**
 * AI Forecasting (OpenAI)
 */
function runForecasting() {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('OPENAI_API_KEY');
  
  if (!apiKey) return { success: false, message: 'API Key OpenAI belum dikonfigurasi di Script Properties.' };
  
  const products = getSheetData('Products');
  const transactions = getSheetData('Transactions');
  
  // Ambil data penjualan 90 hari terakhir
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const salesHistory = {};
  transactions.forEach(t => {
    if (t.type === 'sale' && new Date(t.timestamp) >= ninetyDaysAgo) {
      if (!salesHistory[t.product_name]) salesHistory[t.product_name] = 0;
      salesHistory[t.product_name] += Number(t.qty);
    }
  });
  
  // Siapkan data untuk dikirim ke AI
  const promptData = products.map(p => ({
    id: p.id,
    nama: p.nama,
    stok_saat_ini: p.stok,
    stok_minimal: p.stok_minimal,
    terjual_90_hari_terakhir: salesHistory[p.nama] || 0
  }));
  
  const systemPrompt = `Anda adalah ahli supply chain dan inventory management. 
Berdasarkan data produk dan penjualan 90 hari terakhir berikut, prediksikan permintaan untuk 30 hari ke depan, 
berikan rekomendasi jumlah restock (dengan mempertimbangkan stok saat ini dan stok minimal), dan berikan alasan singkat.
Kembalikan dalam format JSON murni berupa array of objects dengan keys: "product_id", "product_name", "prediksi_30hari" (number), "rekomendasi_restok" (number), "alasan" (string). Jangan tambahkan format markdown \`\`\`json.`;

  const payload = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(promptData) }
    ],
    temperature: 0.3
  };

  const options = {
    method: "post",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", options);
    const jsonStr = JSON.parse(response.getContentText());
    
    if (jsonStr.error) {
      return { success: false, message: "OpenAI Error: " + jsonStr.error.message };
    }
    
    const aiContent = jsonStr.choices.message.content.trim();
    const results = JSON.parse(aiContent);
    
    // Simpan ke Sheet ForecastingResults
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('ForecastingResults');
    const now = new Date();
    
    // Opsional: Hapus hasil lama atau simpan historis. Kita simpan historis.
    results.forEach(r => {
      const pId = r.product_id || 'N/A';
      const pName = r.product_name || 'N/A';
      const pStock = promptData.find(p => p.id === pId)?.stok_saat_ini || 0;
      sheet.appendRow([
        'FC-' + new Date().getTime() + Math.floor(Math.random()*100),
        pId, pName, pStock, r.prediksi_30hari, r.rekomendasi_restok, r.alasan, now
      ]);
    });
    
    return { success: true, message: 'Forecasting berhasil diselesaikan', data: results };
  } catch (e) {
    return { success: false, message: "Gagal memproses forecasting: " + e.message };
  }
}

function getForecastingResults() {
  // Ambil hasil terbaru saja (asumsi 1 run untuk semua produk, ambil batch terakhir berdasar hari yang sama)
  const allResults = getSheetData('ForecastingResults');
  if (allResults.length === 0) return [];
  
  // Sort descending by timestamp
  allResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return allResults; 
}


/**
 * Halaman Publik (Via QR)
 */
function getPublicProductData(productId) {
  const products = getSheetData('Products');
  const product = products.find(p => p.id === productId);
  if (!product) return null;
  
  const transactions = getSheetData('Transactions');
  const prodTrans = transactions
    .filter(t => t.product_id === productId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5); // Ambil 5 terakhir
    
  return {
    product: product,
    transactions: prodTrans
  };
}
