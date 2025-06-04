import API from '../../../data/api.js';

const LoginPresenter = {
  init({ form, onLoginStarted, onLoginSuccess, onLoginFailure }) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = form.querySelector('#email').value;
      const password = form.querySelector('#password').value;

      if (onLoginStarted) onLoginStarted(); // ⬅️ Tampilkan loading segera setelah user submit

      try {
        await API.getLogin({ email, password });
        localStorage.setItem('isLoggedIn', 'true');
        if (onLoginSuccess) onLoginSuccess(); // ⬅️ Tampilkan popup & redirect
      } catch (err) {
        if (onLoginFailure) {
          onLoginFailure(err); // ⬅️ Kirim error agar bisa ditampilkan
        } else {
          alert(`Login gagal: ${err.message}`);
        }
      }
    });
  },
};

export default LoginPresenter;
