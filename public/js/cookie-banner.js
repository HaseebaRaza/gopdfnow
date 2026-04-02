window.addEventListener('load', () => {
  if (!localStorage.getItem('cookieAccepted')) {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <span>This site uses cookies to improve your experience.</span>
      <button id="acceptCookiesBtn">Accept</button>
    `;

    document.body.appendChild(banner);

    const acceptBtn = document.getElementById('acceptCookiesBtn');
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookieAccepted', 'true');
      banner.remove();
    });
  }
});