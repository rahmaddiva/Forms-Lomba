// ======================================================
// GOOGLE APPS SCRIPT — Salin kode ini ke Apps Script
// ======================================================
// 
// LANGKAH-LANGKAH SETUP:
//
// 1. Buka Google Sheets baru di https://sheets.google.com
// 2. Beri nama spreadsheet, misal: "Pendaftaran Lomba Kebaya"
// 3. Pada baris pertama (header), isi kolom A-F:
//    A1: No Pendaftaran
//    B1: Email
//    C1: Nama Lengkap
//    D1: Asal Organisasi
//    E1: Jenis Lomba
//    F1: Tanggal Pendaftaran
//
// 4. Klik menu: Extensions > Apps Script
// 5. Hapus semua kode default, lalu PASTE seluruh kode di bawah ini
// 6. Klik tombol 💾 Save
// 7. Klik Deploy > New deployment
// 8. Pilih type: "Web app"
// 9. Description: "Form Pendaftaran"
// 10. Execute as: "Me"
// 11. Who has access: "Anyone"
// 12. Klik "Deploy"
// 13. Salin URL Web App yang muncul
// 14. Paste URL tersebut ke file app.js pada variabel GOOGLE_SCRIPT_URL
//
// ======================================================

var MAX_PESERTA = 30;

/**
 * Handle GET requests
 * - action=submit : simpan data & kembalikan nomor pendaftaran
 * - default       : tes koneksi
 */
function doGet(e) {
  var action = (e.parameter.action || '').toString();

  // ---- SUBMIT: simpan data dan kembalikan nomor ----
  if (action === 'submit') {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('Sheet1') || ss.getActiveSheet();
      var lastRow = sheet.getLastRow();
      var dataCount = Math.max(0, lastRow - 1); // minus header

      // Cek batas peserta
      if (dataCount >= MAX_PESERTA) {
        return ContentService.createTextOutput(
          JSON.stringify({ status: 'full', message: 'Pendaftaran sudah penuh' })
        ).setMimeType(ContentService.MimeType.JSON);
      }

      // Hitung nomor urut berikutnya
      var nextNum = dataCount + 1;
      var noPendaftaran = 'KBY-' + ('00' + nextNum).slice(-3);

      // Ambil data dari parameter
      var email       = e.parameter.email || '';
      var namaLengkap = e.parameter.namaLengkap || '';
      var organisasi  = e.parameter.organisasi || '';
      var jenisLomba  = e.parameter.jenisLomba || '';
      var tanggal     = e.parameter.tanggal || '';

      // Simpan ke spreadsheet
      sheet.appendRow([
        noPendaftaran,
        email,
        namaLengkap,
        organisasi,
        jenisLomba,
        tanggal
      ]);

      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'success',
          noPendaftaran: noPendaftaran,
          message: 'Data berhasil disimpan'
        })
      ).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: error.toString() })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // ---- DEFAULT: tes API ----
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', message: 'Form API is running' })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests (fallback, jika dibutuhkan)
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Sheet1') || ss.getActiveSheet();

    sheet.appendRow([
      data.noPendaftaran || '',
      data.email || '',
      data.namaLengkap || '',
      data.organisasi || '',
      data.jenisLomba || '',
      data.tanggal || ''
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Data berhasil disimpan' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
