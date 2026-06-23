let scannedUrl = '';
let eventSource = null;

function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  clearTimeout(t._hide);
  t._hide = setTimeout(function() { t.classList.add('hidden'); }, 4000);
}

function showScanResult() {
  document.getElementById('scanResult').classList.remove('hidden');
}

function hideScanResult() {
  document.getElementById('scanResult').classList.add('hidden');
}

async function scanUrl() {
  var url = document.getElementById('urlInput').value.trim();
  if (!url) {
    showToast('Masukkan link video terlebih dahulu!', 'error');
    return;
  }

  var btn = document.getElementById('scanBtn');
  btn.disabled = true;
  btn.textContent = 'Scan...';
  scannedUrl = url;

  hideScanResult();

  try {
    var res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url }),
    });

    var data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || 'Gagal scan link');
    }

    document.getElementById('thumbnail').src = data.thumbnail || '';
    document.getElementById('thumbDuration').textContent = data.duration || '';
    document.getElementById('videoTitle').textContent = data.title || 'Video';
    document.getElementById('videoStatus').textContent = data.duration || '';

    document.getElementById('pickFormat').classList.remove('hidden');
    document.getElementById('progressArea').classList.add('hidden');
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressPercent').textContent = '0%';
    document.getElementById('progressSpeed').textContent = '';

    showScanResult();

  } catch (e) {
    showToast(e.message, 'error');
    var status = document.getElementById('videoStatus');
    status.textContent = e.message;
    status.className = 'video-status error';
    document.getElementById('pickFormat').classList.add('hidden');
    document.getElementById('progressArea').classList.add('hidden');
    showScanResult();
  } finally {
    btn.disabled = false;
    btn.textContent = 'Scan';
  }
}

async function startDownload(fmt) {
  if (!scannedUrl) return;

  document.getElementById('pickFormat').classList.add('hidden');
  document.getElementById('progressArea').classList.remove('hidden');
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressPercent').textContent = '0%';
  document.getElementById('progressSpeed').textContent = '';
  document.getElementById('videoStatus').textContent = 'Memulai download ' + fmt.toUpperCase() + '...';

  try {
    var res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: scannedUrl, format: fmt }),
    });

    if (!res.ok) {
      var err = await res.json();
      throw new Error(err.detail || 'Gagal mulai download');
    }

    var data = await res.json();
    listenProgress(data.download_id, fmt);

  } catch (e) {
    document.getElementById('videoStatus').textContent = e.message;
    document.getElementById('videoStatus').className = 'video-status error';
    showToast(e.message, 'error');
  }
}

function listenProgress(id, fmt) {
  if (eventSource) eventSource.close();

  eventSource = new EventSource('/api/progress/' + id);

  eventSource.onmessage = function (e) {
    try {
      var data = JSON.parse(e.data);

      if (data.status === 'not_found') {
        document.getElementById('videoStatus').textContent = 'Download tidak ditemukan';
        finish();
        return;
      }

      if (data.title) {
        document.getElementById('videoTitle').textContent = data.title;
      }
      if (data.duration) {
        document.getElementById('thumbDuration').textContent = data.duration;
        document.getElementById('videoStatus').textContent = data.duration;
      }

      var fill = document.getElementById('progressFill');
      var pct = document.getElementById('progressPercent');
      var speed = document.getElementById('progressSpeed');
      var status = document.getElementById('videoStatus');

      fill.style.width = data.progress + '%';
      pct.textContent = data.progress + '%';

      if (data.speed) {
        speed.textContent = data.speed + (data.eta ? ' - sisa ' + data.eta : '');
      }

      if (data.status === 'extracting') {
        status.textContent = 'Mendapatkan informasi...';
      } else if (data.status === 'downloading') {
        status.textContent = 'Mendownload ' + fmt.toUpperCase() + '... ' + data.progress + '%';
      } else if (data.status === 'processing') {
        status.textContent = 'Memproses file...';
      } else if (data.status === 'complete') {
        status.textContent = 'Selesai!';
        status.className = 'video-status';
        fill.style.width = '100%';
        pct.textContent = '100%';
        speed.textContent = '';
        var a = document.createElement('a');
        a.href = '/api/file/' + id;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        a.remove();
        finish();
      } else if (data.status === 'error') {
        status.textContent = data.message;
        status.className = 'video-status error';
        finish();
      } else if (data.status === 'queued') {
        status.textContent = 'Menunggu antrian...';
      }

    } catch (err) {}
  };

  eventSource.onerror = function () {
    eventSource.close();
  };
}

function finish() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}

document.getElementById('urlInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') scanUrl();
});


