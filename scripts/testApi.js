(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'ping from agent' }] }),
      });
      console.log('status', res.status);
      const text = await res.text();
      console.log('body length', text?.length);
      console.log('body:', text);
      process.exit(0);
    } catch (e) {
      console.log('attempt', i + 1, 'failed', e.message || e);
      await sleep(1000);
    }
  }
  console.error('endpoint not responding after retries');
  process.exit(1);
})();
