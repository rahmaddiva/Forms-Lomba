// =============================================
// KONFIGURASI
// =============================================
// Ganti URL ini dengan Web App URL dari Google Apps Script Anda
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw7ywxE8NgRiCp_vYYfD2jfQoBV-EzS7LbJHiSSK2f7oUjtQ3wGTpnaUHnmrSA5jeHN/exec';

// =============================================
// DOM Elements
// =============================================
const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const successModal = document.getElementById('successModal');
const regNumberEl = document.getElementById('regNumber');
const modalDetail = document.getElementById('modalDetail');
const btnCopy = document.getElementById('btnCopy');
const btnCloseModal = document.getElementById('btnCloseModal');

// =============================================
// Batas Maksimal Peserta
// =============================================
const MAX_PESERTA = 50;

// Format nomor pendaftaran: KBY-001
function formatRegNumber(num) {
  return `KBY-${String(num).padStart(3, '0')}`;
}

// =============================================
// Validation
// =============================================
function validateField(name) {
  let valid = true;

  if (name === 'email' || name === 'all') {
    const emailInput = document.getElementById('email');
    const group = document.getElementById('group-email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      group.classList.add('has-error');
      valid = false;
    } else {
      group.classList.remove('has-error');
    }
  }

  if (name === 'nama' || name === 'all') {
    const namaInput = document.getElementById('namaLengkap');
    const group = document.getElementById('group-nama');
    if (!namaInput.value.trim()) {
      group.classList.add('has-error');
      valid = false;
    } else {
      group.classList.remove('has-error');
    }
  }

  if (name === 'organisasi' || name === 'all') {
    const orgInput = document.getElementById('organisasi');
    const group = document.getElementById('group-organisasi');
    if (!orgInput.value.trim()) {
      group.classList.add('has-error');
      valid = false;
    } else {
      group.classList.remove('has-error');
    }
  }

  if (name === 'lomba' || name === 'all') {
    const group = document.getElementById('group-lomba');
    const checked = document.querySelectorAll('input[name="jenisLomba"]:checked');
    if (checked.length === 0) {
      group.classList.add('has-error');
      valid = false;
    } else {
      group.classList.remove('has-error');
    }
  }

  return valid;
}

// Real-time validation on blur / change
document.getElementById('email').addEventListener('blur', () => validateField('email'));
document.getElementById('namaLengkap').addEventListener('blur', () => validateField('nama'));
document.getElementById('organisasi').addEventListener('blur', () => validateField('organisasi'));
document.querySelectorAll('input[name="jenisLomba"]').forEach(cb => {
  cb.addEventListener('change', () => validateField('lomba'));
});

// Clear error on input
document.getElementById('email').addEventListener('input', function () {
  document.getElementById('group-email').classList.remove('has-error');
});
document.getElementById('namaLengkap').addEventListener('input', function () {
  document.getElementById('group-nama').classList.remove('has-error');
});
document.getElementById('organisasi').addEventListener('input', function () {
  document.getElementById('group-organisasi').classList.remove('has-error');
});

// =============================================
// Form Submission
// =============================================
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Validate all fields
  if (!validateField('all')) {
    const firstError = document.querySelector('.form-group.has-error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // Set loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    // Gather data
    const email = document.getElementById('email').value.trim();
    const namaLengkap = document.getElementById('namaLengkap').value.trim();
    const organisasi = document.getElementById('organisasi').value.trim();
    const checkedBoxes = document.querySelectorAll('input[name="jenisLomba"]:checked');
    const jenisLomba = Array.from(checkedBoxes).map(cb => cb.value).join(', ');
    const tanggal = new Date().toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // Kirim data ke Google Sheets via Apps Script (GET dengan parameter)
    // Server akan menentukan nomor urut secara otomatis
    const params = new URLSearchParams({
      action: 'submit',
      email: email,
      namaLengkap: namaLengkap,
      organisasi: organisasi,
      jenisLomba: jenisLomba,
      tanggal: tanggal,
    });

    const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`);
    const result = await response.json();

    if (result.status === 'full') {
      alert(`Maaf, pendaftaran sudah penuh (maksimal ${MAX_PESERTA} peserta).`);
      return;
    }

    if (result.status !== 'success') {
      alert('Terjadi kesalahan dari server: ' + (result.message || 'Coba lagi.'));
      return;
    }

    // Tampilkan hasil dengan nomor dari server
    const payload = {
      noPendaftaran: result.noPendaftaran,
      email,
      namaLengkap,
      organisasi,
      jenisLomba,
    };

    showSuccess(payload);
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Gagal terhubung ke server. Pastikan koneksi internet Anda stabil dan coba lagi.');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});

// =============================================
// Show Success Modal
// =============================================
function showSuccess(data) {
  regNumberEl.textContent = data.noPendaftaran;

  modalDetail.innerHTML = `
    <div style="margin-bottom: 8px;"><strong>Email:</strong> ${escapeHtml(data.email)}</div>
    <div style="margin-bottom: 8px;"><strong>Nama:</strong> ${escapeHtml(data.namaLengkap)}</div>
    <div style="margin-bottom: 8px;"><strong>Organisasi:</strong> ${escapeHtml(data.organisasi)}</div>
    <div><strong>Jenis Lomba:</strong> ${escapeHtml(data.jenisLomba)}</div>
  `;

  successModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

// =============================================
// Copy Registration Number
// =============================================
btnCopy.addEventListener('click', function () {
  const number = regNumberEl.textContent;
  navigator.clipboard.writeText(number).then(() => {
    btnCopy.classList.add('copied');
    btnCopy.querySelector('span').textContent = 'Tersalin!';
    setTimeout(() => {
      btnCopy.classList.remove('copied');
      btnCopy.querySelector('span').textContent = 'Salin';
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = number;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    btnCopy.classList.add('copied');
    btnCopy.querySelector('span').textContent = 'Tersalin!';
    setTimeout(() => {
      btnCopy.classList.remove('copied');
      btnCopy.querySelector('span').textContent = 'Salin';
    }, 2000);
  });
});

// =============================================
// Close Modal & Reset Form
// =============================================
btnCloseModal.addEventListener('click', function () {
  successModal.hidden = true;
  document.body.style.overflow = '';
  form.reset();
  // Clear all error states
  document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
});

// Close modal on overlay click
successModal.addEventListener('click', function (e) {
  if (e.target === successModal) {
    btnCloseModal.click();
  }
});

// =============================================
// Utility: Escape HTML to prevent XSS
// =============================================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}
