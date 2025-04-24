export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const data = req.body;
  
    const groupIds = ['6281273133989-1502490848'];//
    const groupIds = [120363327177489441]
    const message = formatMessage(data); // fungsi ini kamu sesuaikan
  
    try {
      const response = await fetch('https://tegal.wablas.com/api/v2/send-message', {
        method: 'POST',
        headers: {
          'Authorization': 'rfxGFTZNzK6brC9JhC2u9vUWGKLqiLJrN13Ugo2uyBA9C7bQUGAndAFxz9rJipBp.QogfE4TK',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: groupIds.map(id => ({
            phone: id,
            message,
            isGroup: true
          }))
        })
      });
  
      const result = await response.json();
      if (result.success) {
        res.status(200).json({ message: 'Success', result });
      } else {
        res.status(500).json({ error: result.error || 'Failed to send message' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  
  function formatMessage(data) {
    const get = (key) => (data[key] || '').toString();
    return `🟦 🟦 🟦
  
  🚛AST Mechanic Report🚛
  
  Unit: ${get('Unit')}
  No WO: ${get('No WO')}
  Lokasi: ${get('Lokasi Pengerjaan')}
  Hours Meters: ${get('Hours Meters')}
  Start BD:
  Tanggal: ${get('Tanggal BD')}
  Jam: ${get('Jam BD')}
  Pembuat Laporan: ${get('Pembuat Laporan')}
  
  ⚠️Problem:
  ${bulletList(get('Problem'))}
  Hasil Pengecekan:
  ${bulletList(get('Hasil Pengecekan'))}
  
  🛠️Tindak Lanjut Perbaikan:
  ${bulletList(get('Action'))}
  
  ⚙️ Part yang Digunakan:
  ${bulletList(get('Part/Komponen yang digunakan'))}
  
  Delay:
  ${bulletList(get('Delay'))}
  
  Start Pengerjaan:
  Tanggal: ${get('Tanggal Pengerjaan')}
  Jam: ${get('Jam Pengerjaan')}
  
  Finish Pengerjaan:
  Tanggal: ${get('Tanggal Selesai Pengerjaan')}
  Jam: ${get('Jam Selesai Pengerjaan')}
  
  Status: ${get('Status')}
  
  Pending Job:
  ${bulletList(get('Pending Job'))}
  Note:
  ${bulletList(get('Note'))}
  
  Man Power:
  ${bulletList(get('Nama Man Power'))}
  Supervisor:
  ${get('Supervisor')}
  
  🔰Terimakasih🔰`;
  }
  
  function bulletList(text) {
    return text.split('\n').map(line => '• ' + line.trim()).join('\n');
  }
  
