const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:3000';
const ideaText = process.argv.slice(2).join(' ') || 'Automated multi-agent demo';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async function main(){
  try {
    console.log('Submitting idea:', ideaText);
    const res = await axios.post(`${API}/ideas`, { idea: ideaText }, { timeout: 5000 });
    const id = res.data.id;
    console.log('Job id:', id);

    const timeoutMs = 2 * 60 * 1000; // 2 minutes
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await sleep(1000);
      let s = null;
      try {
        const r = await axios.get(`${API}/status/${encodeURIComponent(id)}`, { timeout: 3000 });
        s = r.data;
      } catch (e) {
        process.stdout.write('.');
        continue;
      }
      console.clear();
      console.log('Status for', id);
      console.log(JSON.stringify(s, null, 2));
      if (s.state === 'done') {
        console.log('Workflow finished.');
        process.exit(0);
      }
    }
    console.error('Timed out waiting for done state');
    process.exit(2);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
