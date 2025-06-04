// src/scripts/pages/auth/register/register-page.js
import Loading from '../../views/components/loading.js';
import RegisterPresenter from './register-presenter';

export default class RegisterPage {
  async render() {
    return `
      <section style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff;padding:20px;">
        <div style="background:#fff;padding:40px 30px;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,.1);width:100%;max-width:420px;">
          <h2 style="text-align:center;margin-bottom:30px;color:#2196F3;font-size:2rem;">Daftar Akun</h2>

          <form id="register-form">
            <div style="margin-bottom:20px;">
              <label for="name" style="display:block;margin-bottom:8px;font-weight:500;color:#333;">Nama Lengkap</label>
              <input id="name" type="text" required style="width:100%;padding:12px;border:1px solid #ccc;border-radius:8px;outline-color:#2196F3;">
            </div>

            <div style="margin-bottom:20px;">
              <label for="email" style="display:block;margin-bottom:8px;font-weight:500;color:#333;">Email</label>
              <input id="email" type="email" required style="width:100%;padding:12px;border:1px solid #ccc;border-radius:8px;outline-color:#2196F3;">
            </div>

            <div style="margin-bottom:28px;">
              <label for="password" style="display:block;margin-bottom:8px;font-weight:500;color:#333;">Password</label>
              <input id="password" type="password" required style="width:100%;padding:12px;border:1px solid #ccc;border-radius:8px;outline-color:#2196F3;">
            </div>

            <button type="submit" style="width:100%;padding:14px;background:#2196F3;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;transition:.3s;">Daftar</button>
          </form>

          <p style="text-align:center;margin-top:22px;font-size:.95rem;color:#555;">
            Sudah punya akun?
            <a href="#/login" style="color:#2196F3;font-weight:500;text-decoration:none;">Login di sini</a>
          </p>
        </div>

        <!-- loading spinner -->
        <div id="loading" style="position:fixed;top:0;left:0;right:0;bottom:0;display:none;justify-content:center;align-items:center;background:rgba(255,255,255,.6);z-index:9999;">
          <div style="width:40px;height:40px;border:4px solid #2196F3;border-top:4px solid transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
        </div>
      </section>

      <style>
        @keyframes spin {0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      </style>
    `;
  }

  async afterRender() {
    new RegisterPresenter({
      form: document.getElementById('register-form'),
      loading: document.getElementById('loading'),
      onStarted: () => {
        // Tambah spinner global bawaan komponen Loading (optional)
        const html = Loading.create();
        document.body.insertAdjacentHTML('beforeend', html);
      },
      onSuccess: () => {
        document.getElementById('loading-container')?.remove();
        this._showSuccessPopup();
        setTimeout(() => (window.location.hash = '#/login'), 1200);
      },
      onFailure: (err) => {
        document.getElementById('loading-container')?.remove();
        alert(`Registrasi gagal: ${err.message}`);
      },
    });
  }

  _showSuccessPopup() {
    const pop = document.createElement('div');
    pop.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      background:#4CAF50;color:#fff;padding:20px 40px;border-radius:8px;
      font-size:1.2rem;box-shadow:0 8px 16px rgba(0,0,0,.2);z-index:9999;
    `;
    pop.innerText = 'Registrasi berhasil! Silakan login.';
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 2500);
  }
}
