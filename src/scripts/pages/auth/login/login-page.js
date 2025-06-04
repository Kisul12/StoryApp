import Loading from '../../views/components/loading';

export default class LoginPage {
  async render() {
    return `
      <section style="display: flex; justify-content: center; align-items: center; min-height: 80vh; background-color:rgb(255, 255, 255); padding: 20px;">
        <div style="background-color: #fff; padding: 40px 30px; border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); width: 100%; max-width: 400px;">
          <h2 style="text-align: center; margin-bottom: 30px; color: #2196F3; font-size: 2rem;">Login</h2>
          <form id="login-form">
            <div style="margin-bottom: 20px;">
              <label for="email" style="display: block; margin-bottom: 6px; font-weight: 500; color: #333;">Email</label>
              <input type="email" id="email" required 
                style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 1rem;" />
            </div>
            <div style="margin-bottom: 25px;">
              <label for="password" style="display: block; margin-bottom: 6px; font-weight: 500; color: #333;">Password</label>
              <input type="password" id="password" required 
                style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 1rem;" />
            </div>
            <button type="submit"
              style="width: 100%; padding: 12px; background-color: #2196F3; color: white; border: none; border-radius: 5px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.3s ease;">
              Login
            </button>
          </form>
          <p style="text-align: center; margin-top: 20px; font-size: 0.95rem;">
            Belum punya akun?
            <a href="#/register" style="color: #FF5722; font-weight: 500; text-decoration: none;">Daftar</a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const LoginPresenter = await import('./login-presenter');
    LoginPresenter.default.init({
      form: document.getElementById('login-form'),
      onLoginStarted: this.onLoginStarted.bind(this), // ⬅️ bind 'this'
      onLoginSuccess: this.onLoginSuccess.bind(this), // ⬅️ bind 'this'
      onLoginFailure: this.onLoginFailure.bind(this)  // ⬅️ bind 'this'
    });
  }

  onLoginStarted() {
    const loadingHTML = Loading.create();
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
  }

  onLoginSuccess() {
    const loader = document.getElementById('loading-container');
    if (loader) loader.remove();
    this.showSuccessPopup();
    setTimeout(() => {
      window.location.hash = '#/home';
    }, 1000); // beri jeda sedikit agar popup terlihat
  }

  onLoginFailure() {
    const loader = document.getElementById('loading-container');
    if (loader) loader.remove();
    alert('Login gagal, silakan coba lagi.');
  }

  showSuccessPopup() {
    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #4CAF50;
      color: white;
      padding: 20px 40px;
      border-radius: 8px;
      font-size: 1.2rem;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      text-align: center;
      z-index: 9999;
    `;
    popup.innerText = 'Login berhasil! Selamat datang!';
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.remove();
    }, 2500);
  }
}

