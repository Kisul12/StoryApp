export default class AboutPage {
  async render() {
    return `
      <section class="container" style="max-width: 900px; margin: 40px auto; padding: 20px;">
        <div style="background-color: #fff; padding: 30px 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);">
          <h1 style="font-size: 2.5rem; font-weight: bold; color: #2196F3; text-align: center; margin-bottom: 20px;">
            About Me
          </h1>

          <div style="text-align: center; margin-bottom: 20px;">
            <img src="../../../public/images/FOTO.jpg" alt="Muhammad Rizki Assamsuli" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;">
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="font-size: 1.8rem; color: #333; font-weight: normal;">
              Muhammad Rizki Assamsuli
            </h2>
            <p style="font-size: 1.1rem; color: #666; font-weight: normal;">
              Asal Kampus: Universitas Mataram
            </p>
          </div>

          <div style="background-color: #f5f5f5; padding: 15px 20px; border-radius: 8px; text-align: center;">
            <h3 style="font-size: 1.4rem; color: #2196F3; margin-bottom: 10px;">Tentang Saya</h3>
            <p style="font-size: 1rem; color: #444;">
              Saya seorang mahasiswa yang berasal dari Universitas Mataram. Saat ini saya sedang mengeksplorasi berbagai teknologi di bidang pengembangan perangkat lunak dan aplikasi web. Saya sangat tertarik dengan pemrograman, terutama dalam pengembangan aplikasi berbasis web dan mobile.
            </p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // You can add any interactive elements or other logic here
  }
}
