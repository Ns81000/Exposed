const link = document.getElementById('open-dashboard');

link.addEventListener('click', async (event) => {
  event.preventDefault();
  await chrome.tabs.create({ url: 'https://exposed-dashboard.vercel.app/dashboard' });
  window.close();
});
