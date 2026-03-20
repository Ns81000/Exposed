const link = document.getElementById('open-dashboard');

link.addEventListener('click', async (event) => {
  event.preventDefault();
  await chrome.tabs.create({ url: 'http://localhost:5173/' });
  window.close();
});
