(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const text = (id, en) => language === 'id' ? id : en;
  const content = window.PORTFOLIO_CONTENT || [];
  const assets = window.PORTFOLIO_SCREENSHOTS || {};
  let language = 'id';
  try { language = localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'id'; } catch (_) {}
  const chapters = [
    {name:'Project Introduction', first:1, last:4},
    {name:'System Design', first:5, last:6},
    {name:'Application Exploration', first:7, last:12},
    {name:'Data Analytics', first:13, last:15},
    {name:'Evaluation & Contributions', first:16, last:18}
  ];
  const platforms = ['YouTube','Police Tube','X/Twitter','Instagram','Facebook','TikTok'];
  const chapterFor = n => chapters.findIndex(c => n >= c.first && n <= c.last);
  const pad = n => String(n).padStart(2,'0');
  const hashId = n => `slide-${pad(n)}`;
  let active = Math.max(1,Math.min(18,Number(location.hash.match(/slide-(\d+)/)?.[1]) || 1));
  let menuOpen = false;
  let role = 'polres', management = 'recap', reportTab = 'ranking', algorithmStep = 0, selectedCluster = 'low';
  let imageTrigger = null;
  const notes = {
    4: ['Formulir menampilkan dua pilihan simpan. Kode layanan yang diperiksa menyetujui rekap setelah validasi. Rinciannya ada pada slide 08.', 'The form shows two save options. The reviewed service approves a record after validation. See slide 08 for the source difference.'],
    5: ['Pada naskah skripsi, petugas Polsek juga mengelola rekap. Pada aplikasi akhir, pengelolaan terpusat di Polres dan petugas Polsek hanya dapat membaca rekap unitnya.', 'The thesis described sector staff managing records. In the final application, district staff maintain the records and sector staff have read-only access to their unit.'],
    8: ['Formulir menampilkan “Simpan Rekap” dan “Simpan & Setujui”. Pada kode layanan yang diperiksa, rekap langsung berstatus Disetujui setelah lolos validasi. Kedua label tombol belum membuktikan adanya dua status simpan yang berbeda.', 'The form shows “Simpan Rekap” and “Simpan & Setujui”. In the reviewed service, validation automatically sets a record to approved. The button labels alone do not establish two different saved states.'],
    9: ['Diagram menjelaskan fungsi modul. Arsip yang tersedia belum memastikan status akun yang digunakan untuk pengujian atau produksi.', 'The diagram describes the module. The available archive does not establish whether the configured account was used for testing or production.'],
    13: ['Arsip dataset menampilkan Juli 2026. Arsip normalisasi menampilkan September 2025. Keduanya mendokumentasikan periode yang berbeda.', 'The dataset capture shows July 2026. The normalization capture shows September 2025. They document different periods.'],
    15: ['Skripsi dan dokumentasi aplikasi mencatat nilai DBI yang berbeda. Kesamaan seluruh data masukan dan parameter kedua proses belum diverifikasi. Gambar evaluasi hanya menampilkan pembulatan 0,4862.', 'The thesis and application documentation report different DBI values. Matching inputs and parameters have not been verified. The evaluation capture only displays the rounded value 0.4862.'],
    17: ['Pengujian dalam skripsi mencakup penambahan, perubahan, dan pengiriman draf oleh petugas Polsek. Belum ada hasil uji ulang untuk akses baca saja dalam bukti yang ditinjau.', 'The thesis tested sector staff creating, editing, and submitting drafts. The reviewed evidence contains no retest of the final read-only policy.']
  };

  function inline(source) {
    return esc(source).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }
  function paragraphs(source) {
    return String(source || '').split(/\n\s*\n/).filter(Boolean).map(p => `<p>${inline(p).replace(/\n/g,'<br>')}</p>`).join('');
  }
  function references(source) {
    const lines = String(source || '').split('\n').filter(l => l.trim());
    const list = lines.filter(l => /^- /.test(l));
    const prose = lines.filter(l => !/^- /.test(l));
    return (list.length ? `<ul>${list.map(l=>`<li>${inline(l.slice(2))}</li>`).join('')}</ul>` : '') + paragraphs(prose.join('\n'));
  }
  function screenshot(key, size = '') {
    const asset = assets[key];
    if (!asset) return `<p class="visual-caption">${text('Dokumentasi asli belum tersedia.','Original documentation is not available.')}</p>`;
    const title = language==='en' ? asset.titleEN || asset.title : asset.title;
    const period = language==='en' ? asset.periodEN || asset.dataPeriod : asset.dataPeriod;
    return `<figure class="screenshot ${size}"><button class="capture-view" data-image="${key}" aria-label="${text('Perbesar','Enlarge')} · ${esc(title)}"><img src="${esc(asset.file)}" alt="${esc(title)}" loading="${size==='cover-image'?'eager':'lazy'}" width="${asset.width}" height="${asset.height}"></button><figcaption><span><strong>${esc(title)}</strong>${esc(period)}</span><button class="capture-expand" data-image="${key}">${text('Perbesar','Enlarge')}</button></figcaption></figure>`;
  }
  function imageButton(key, label) { return assets[key] ? `<button class="text-button" data-image="${key}">${esc(label)}</button>` : ''; }
  function lineList(rows, className='') {
    return `<dl class="line-list ${className}">${rows.map(([label,detail])=>`<div><dt>${esc(label)}</dt><dd>${esc(detail)}</dd></div>`).join('')}</dl>`;
  }
  function sequence(rows) {
    return `<ol class="sequence">${rows.map(([title,detail],i)=>`<li><span aria-hidden="true">${pad(i+1)}</span><h3>${esc(title)}</h3><p>${esc(detail)}</p></li>`).join('')}</ol>`;
  }
  function roleVisual() {
    const central=role==='polres';
    const rows=central ? [
      [text('Rekap','Records'),text('Mencatat dan mengelola publikasi semua Polsek.','Enter and maintain records for all sectors.')],
      [text('Pengguna','Users'),text('Mengatur akun dan penugasan Polsek.','Manage accounts and sector assignments.')],
      [text('Analisis','Analysis'),text('Membentuk dataset, menjalankan K-Means, dan mengevaluasi klaster.','Build datasets, run K-Means, and evaluate clusters.')]
    ] : [
      [text('Rekap','Records'),text('Hanya membaca rekap Polsek penugasan.','Read records for the assigned sector only.')],
      [text('Hasil','Results'),text('Melihat peringkat dan laporan unitnya.','Review rankings and reports for the assigned sector.')],
      [text('Komunikasi','Communication'),text('Membaca pengumuman dan berkirim pesan sesuai hak akses.','Read announcements and exchange messages within the permitted scope.')]
    ];
    return `<div class="segmented" role="group" aria-label="${text('Pilih peran','Select role')}">${['polres','polsek'].map(r=>`<button data-role="${r}" aria-pressed="${r===role}">Admin Humas ${r==='polres'?'Polres':'Polsek'}</button>`).join('')}</div>${lineList(rows)}`;
  }
  function managementVisual() {
    const areas=[['recap',text('Rekap','Records')],['polsek','Polsek'],['users',text('Pengguna','Users')]];
    const tabs=`<div class="segmented" role="group" aria-label="${text('Pilih data','Select data')}">${areas.map(([key,name])=>`<button data-management="${key}" aria-pressed="${key===management}">${name}</button>`).join('')}</div>`;
    if(management==='recap') return tabs+screenshot('recap');
    return tabs+lineList(management==='polsek'?[
      [text('Identitas Polsek','Sector identity'),text('Menentukan unit pemilik rekap.','Identifies the sector that owns a record.')],
      [text('Status aktif','Active status'),text('Menentukan apakah rekap yang disetujui dapat masuk ke dataset.','Determines whether approved records qualify for a dataset.')]
    ]:[
      [text('Peran','Role'),text('Menentukan fungsi yang dapat digunakan.','Determines the functions available to the user.')],
      [text('Penugasan','Assignment'),text('Menghubungkan akun Admin Humas Polsek dengan data unitnya.','Links a sector administrator’s account to their unit’s data.')]
    ]);
  }
  function architectureVisual() {
    const layers = [
      ['Controller', text('Menerima permintaan dan memeriksa akses.', 'Receives requests and checks access.')],
      ['Service', text('Menjalankan aturan bisnis dan perhitungan.', 'Applies business rules and calculations.')],
      ['Repository', text('Membaca dan menyimpan data melalui PDO.', 'Reads and writes data through PDO.')],
      ['View', text('Menyajikan hasil sesuai hak akses pengguna.', 'Renders the result for the user’s role.')]
    ];
    return `<div class="architecture"><div class="diagram-end"><b>${text('Peramban','Browser')}</b><span>Admin Humas Polres / Polsek</span></div>
      <div class="engine"><div class="engine-head"><strong>Apache / PHP Native 8.2</strong><span>${text('Aplikasi web','Web application')}</span></div>
      <dl class="layers">${layers.map(([name,role])=>`<div><dt>${name}</dt><dd>${role}</dd></div>`).join('')}</dl></div>
      <div class="diagram-branches"><div><b>PDO / MySQL</b><span>${text('Rekap, snapshot, dan hasil analisis','Records, snapshots, and results')}</span></div><div><b>Instagram Graph API</b><span>${text('Modul pemantauan Instagram','Supporting Instagram module')}</span></div></div></div>`;
  }
  function algorithmVisual() {
    const steps = [
      [text('Normalisasi','Normalize'), text('Samakan skala tiap platform','Put each platform on a common scale'),text('Min-Max mengubah jumlah publikasi menjadi nilai 0–1. Jika semua Polsek memiliki jumlah yang sama pada satu platform, nilainya menjadi 0.','Min-Max rescales publication counts to 0–1. If all sectors have the same count on a platform, its normalized value is 0.'),'x′ = (x − min) / (max − min)','preprocessing'],
      [text('Pusat awal','Seed centers'), text('Pilih tiga pusat dengan Farthest-First','Choose three centers with Farthest-First'),text('Pusat pertama adalah Polsek dengan rata-rata enam nilai terendah. Untuk setiap pusat berikutnya, pilih Polsek yang jaraknya paling jauh dari pusat terdekat yang sudah dipilih.','The sector with the lowest six-feature mean becomes the first center. Each subsequent center is the sector farthest from its nearest selected center.'),'K = 3'],
      [text('Jarak','Distance'),text('Ukur jarak ke tiap pusat','Measure the distance to each center'),text('Jarak Euclidean memperhitungkan selisih pada keenam platform. Semakin kecil jaraknya, semakin mirip pola publikasi Polsek dengan pusat klaster.','Euclidean distance accounts for differences on all six platforms. A smaller distance means the sector’s profile is closer to the cluster center.'),'d(x,c) = √(∑ⱼ (xⱼ − cⱼ)²)'],
      [text('Keanggotaan','Assignment'),text('Tempatkan Polsek pada klaster terdekat','Assign each sector to its nearest center'),text('Sistem membandingkan jarak ke tiga pusat. Setiap Polsek menjadi anggota satu klaster berdasarkan jarak terkecil.','The system compares distances to all three centers. Each sector joins the cluster with the smallest distance.'),''],
      [text('Iterasi','Iterate'),text('Perbarui pusat dan periksa perubahan','Update centers and check for changes'),text('Pusat baru adalah rata-rata anggota pada tiap platform. Proses berulang hingga anggota stabil, pergeseran pusat memenuhi toleransi, atau batas iterasi tercapai. Rata-rata pusat akhir menentukan label Tinggi, Sedang, dan Rendah.','Each new center is the mean of its members on each platform. Iteration stops at stable assignments, the movement tolerance, or the iteration cap. Final center means determine High, Medium, and Low labels.'),'','kmeans'],
      [text('Evaluasi','Evaluate'),text('Nilai hasil dengan Davies-Bouldin Index','Evaluate the result with the Davies-Bouldin Index'),text('DBI membandingkan sebaran anggota dalam klaster dengan jarak antarpusat. Pada data dan skala yang sama, nilai lebih kecil menunjukkan kelompok yang lebih rapat dan lebih terpisah.','DBI compares within-cluster spread with the distance between centers. On the same data and scale, lower values indicate more compact, better-separated groups.'),'','dbi']
    ];
    const [label,title,detail,formula,asset] = steps[algorithmStep];
    return `<div class="algorithm"><div class="step-tabs" role="group" aria-label="${text('Pilih tahap','Choose a step')}">${steps.map(([name],i)=>`<button data-step="${i}" aria-label="${pad(i+1)} · ${esc(name)}" aria-pressed="${i===algorithmStep}"><span aria-hidden="true">${pad(i+1)}</span>${esc(name)}</button>`).join('')}</div>
      <div class="step-canvas" aria-live="polite"><div class="step-count">${text('Tahap','Step')} ${pad(algorithmStep+1)} / 06</div><h3>${esc(title)}</h3><p>${esc(detail)}</p>${formula?`<div class="equation">${esc(formula)}</div>`:''}${asset?imageButton(asset,text('Lihat tangkapan layar','View screenshot')):''}</div></div>`;
  }
  const clusters = {
    high:{count:2,labelID:'Kinerja Tinggi',labelEN:'High Performance',members:['Pamanukan','Purwadadi']},
    medium:{count:3,labelID:'Kinerja Sedang',labelEN:'Medium Performance',members:['Pagaden','Pusakanagara','Subang']},
    low:{count:16,labelID:'Kinerja Rendah',labelEN:'Low Performance',members:['Binong','Blanakan','Ciasem','Cibogo','Cijambe','Cikaum','Cipeundeuy','Cisalak','Compreng','Jalancagak','Kalijati','Legonkulon','Pabuaran','Patokbeusi','Segalaherang','Tanjungsiang']}
  };
  function resultsVisual() {
    const selected=clusters[selectedCluster];
    return `<div class="visual-label">${text('Hasil skripsi','Thesis results')} / September 2025</div><div class="cluster-bars">
      ${Object.entries(clusters).map(([key,c])=>`<button class="cluster-row ${key}" data-cluster="${key}" aria-pressed="${selectedCluster===key}"><span>${esc(language==='id'?c.labelID:c.labelEN)}<b>${c.count} <small>Polsek</small></b></span><span class="bar-track"><i style="width:${c.count/21*100}%"></i></span></button>`).join('')}</div>
      <div class="cluster-member-detail" aria-live="polite"><h4>${esc(language==='id'?selected.labelID:selected.labelEN)} · ${selected.count} Polsek</h4><p>${esc(selected.members.join(', '))}</p></div>
      <div class="dbi-comparison"><div class="dbi-value"><span>${text('DBI skripsi','Thesis DBI')}</span><strong>${text('0,4860797654','0.4860797654')}</strong></div><div class="dbi-value"><span>${text('DBI dokumentasi aplikasi · #11','Documented application DBI · #11')}</span><strong>${text('0,48621367','0.48621367')}</strong></div></div>
      ${imageButton('kmeans',text('Lihat hasil pada aplikasi','View application results'))}`;
  }
  function visual(n) {
    switch(n) {
      case 1:return `<div class="cover-plate">${screenshot('dashboard','cover-image')}</div><div class="cover-bottom"><span><strong>21</strong>Polsek</span><span><strong>6</strong>${text('platform publikasi','publishing platforms')}</span><span><strong>3</strong>${text('klaster aktivitas','activity clusters')}</span></div>`;
      case 2:return `<div class="scope-banner"><strong>6</strong><span>${text('platform publikasi','publishing platforms')}</span></div><ul class="platforms">${platforms.map(p=>`<li>${p}</li>`).join('')}</ul><p class="visual-caption">${text('Satu variabel untuk setiap platform, diukur dari jumlah publikasi.','One variable per platform, measured in posts.')}</p>`;
      case 3:return sequence([
        [text('Publikasi','Publication'),text('Polsek menerbitkan konten di media sosial.','Sectors publish social posts.')],
        [text('Pengiriman tautan','Link sharing'),text('Petugas mengirim tautan ke grup Humas.','Staff send links to the public relations group.')],
        [text('Penghitungan','Counting'),text('Admin Polres menghitung publikasi per platform.','District staff count posts by platform.')],
        [text('Rekap Excel','Excel records'),text('Hasil dicatat per Polsek dan periode.','Staff record totals by sector and period.')]
      ]);
      case 4:return sequence([
        [text('Catat dan simpan','Record and save'),text('Formulir menyediakan Simpan Rekap dan Simpan & Setujui.','The form offers Save Record and Save & Approve.')],
        [text('Periksa kelayakan','Check eligibility'),text('Pilih rekap Disetujui dari Polsek aktif.','Select approved records from active sectors.')],
        [text('Siapkan dataset','Prepare the dataset'),text('Jumlahkan publikasi bulanan, simpan snapshot, lalu catat normalisasi Min-Max dalam riwayat pengolahan.','Aggregate monthly counts, save a snapshot, and record Min-Max normalization in the processing history.')],
        [text('Analisis dan laporkan','Analyze and report'),text('K-Means memakai jarak Euclidean untuk membentuk tiga klaster. DBI mengevaluasi hasil. Peringkat dan laporan menyajikannya.','K-Means uses Euclidean distance to form three clusters. DBI evaluates the result. Rankings and reports present it.')]
      ]);
      case 5:return roleVisual();
      case 6:return architectureVisual();
      case 7:return screenshot('dashboard');
      case 8:return managementVisual();
      case 9:return `<div class="system-band"><span>${text('Integrasi pendukung','Supporting integration')}</span><strong>Instagram Graph API</strong></div>${lineList([
        [text('Permintaan','Request'),text('Akun yang dikonfigurasi dan rentang tanggal.','Configured account and date range.')],
        [text('Hasil','Result'),text('Informasi unggahan, tautan, jumlah suka, dan komentar.','Post details, links, likes, and comments.')],
        [text('Penyimpanan','Storage'),text('Hasil pengambilan beserta riwayat proses.','Retrieved data and request history.')]
      ])}<p class="comparison-note">${text('Sumber enam variabel K-Means tetap rekap publikasi.','The six K-Means variables come from publication records.')}</p>`;
      case 10:return `<div class="system-band"><span>${text('Cakupan akses','Access scope')}</span><strong>${text('Polsek penugasan','Assigned sector')}</strong></div>${lineList([
        [text('Ringkasan','Overview'),text('Jumlah rekap dan total publikasi unit.','Record count and total posts for the unit.')],
        [text('Rekap terbaru','Latest records'),text('Tanggal dan jumlah publikasi tiap platform.','Dates and publication counts by platform.')],
        [text('Akses lanjutan','Related views'),text('Peringkat, laporan, dan pengumuman sesuai penugasan.','Rankings, reports, and announcements in scope.')]
      ])}<p class="visual-caption">${text('Diagram hak akses pada aplikasi akhir.','Access diagram for the final application.')}</p>`;
      case 11:return `<div class="segmented" role="group" aria-label="${text('Pilih tampilan','Select view')}"><button data-report="ranking" aria-pressed="${reportTab==='ranking'}">${text('Peringkat','Ranking')}</button><button data-report="report" aria-pressed="${reportTab==='report'}">${text('Laporan','Report')}</button></div>${screenshot(reportTab)}${reportTab==='report'?`<p class="comparison-note">${text('Contoh laporan September 2026 memuat 7 Polsek di klaster tinggi, 8 sedang, dan 6 rendah. Hasil penelitian September 2025 tersedia di slide 15.','This September 2026 report shows 7 high, 8 medium, and 6 low sectors. Slide 15 presents the September 2025 research results.')}</p>`:''}`;
      case 12:return `<div class="channels"><article><h3>${text('Pengumuman','Announcements')}</h3><p>${text('Satu pemberitahuan untuk seluruh pengguna, seluruh Admin Polsek, atau satu Polsek.','One notice for all users, all sector administrators, or one sector.')}</p><strong>${text('Polres kepada penerima terpilih','District to selected recipients')}</strong></article><article><h3>${text('Pesan internal','Internal messages')}</h3><p>${text('Percakapan dua arah yang dikelompokkan menurut Polsek.','Two-way conversations organized by police sector.')}</p><strong>${text('Polres dan Polsek','District and sector')}</strong></article></div>`;
      case 13:return `<div class="matrix-caption"><strong>21 × 6</strong><span>${text('Struktur dataset penelitian','Research dataset structure')}</span></div>${lineList([
        [text('Baris','Rows'),text('Satu Polsek per baris.','One sector per row.')],
        [text('Kolom','Columns'),platforms.join(' · ')],
        [text('Nilai','Values'),text('Jumlah publikasi per platform dalam satu bulan.','Posts per platform in a single month.')]
      ])}<div class="archive-links">${imageButton('dataset',text('Dataset · Juli 2026','Dataset · July 2026'))}${imageButton('preprocessing',text('Normalisasi · September 2025','Normalization · September 2025'))}</div>`;
      case 14:return algorithmVisual();
      case 15:return resultsVisual();
      case 16:return lineList([
        [text('Antarmuka','Interface'),'Bootstrap 5.3 · '+text('CSS khusus','Custom CSS')+' · Vanilla JavaScript'],
        [text('Aplikasi','Application'),'PHP Native 8.2 · Apache'],
        [text('Basis data','Database'),'MySQL · PDO'],
        [text('Grafik','Charts'),text('Chart.js yang disimpan lokal','Locally hosted Chart.js')]
      ],'stack-list');
      case 17:return `<div class="test-record"><div class="test-total"><strong>25</strong><span>${text('skenario uji dalam skripsi','test scenarios in the thesis')}</span></div><div class="test-breakdown"><div><strong>16</strong>Admin Humas Polres</div><div><strong>9</strong>Admin Humas Polsek</div></div></div><p class="comparison-note">${text('Skenario Polsek masih mencakup pengiriman draf. Pada aplikasi akhir, petugas Polsek hanya bisa membaca rekap.','Sector tests included draft submission. In the final application, sector staff can only read activity records.')}</p>`;
      case 18:return `<div class="closing-visual"><span>${text('Jelajahi kembali','Revisit the project')}</span>${[[7,text('Lihat aplikasi','Explore the application')],[14,text('Telusuri K-Means','Explore K-Means')],[15,text('Lihat hasil penelitian','Review the findings')]].map(([n,name])=>`<a href="#${hashId(n)}"><strong>${name}</strong><small>${text('Slide','Slide')} ${pad(n)}</small></a>`).join('')}<button class="closing-button" data-go="1">${text('Kembali ke pembuka','Back to the cover')}</button></div>`;
      default:return '';
    }
  }

  const chapterNamesID = ['Pengenalan proyek','Desain sistem','Fitur aplikasi','Analisis data','Evaluasi dan kontribusi'];
  const layouts = ['hero','analytical','analytical','technical','analytical','technical','product','product','technical','analytical','product','analytical','data','data','data','technical','data','hero'];
  const officialTitle = 'Implementasi Algoritma K-Means untuk Klasterisasi Aktivitas Viralisasi Media Sosial Polsek pada Sistem Informasi Berbasis Web di Humas Polres Subang.';
  function slideTitle(s) { return text(s.titleID || s.title, s.headlineEN || s.title); }
  function chapterTitle(i) { return text(chapterNamesID[i], chapters[i].name); }
  function author() {
    return `<div class="author"><strong>Dewi Embun Permata Dini, S.Kom.</strong><span>${text('Sistem Informasi','Information Systems')} · Universitas Mandiri · 2026</span></div>`;
  }
  function renderSlide(s) {
    const n = s.id;
    const langID = language === 'id';
    const bulletList = langID ? s.bulletsID : s.bulletsEN;
    const note = notes[n];
    const title = slideTitle(s);
    const heading = n===1 ? 'h1' : 'h2';
    const id = hashId(n);
    const label = n===1 ? text('Studi kasus','Case study') + ' / Humas Polres Subang' : text(s.topicID || s.title, s.title);
    return `<section class="slide layout-${layouts[n-1]}" id="${id}" data-slide="${n}" aria-labelledby="title-${n}" ${n===active?'':'hidden'}>
      <div class="slide-inner"><div class="slide-copy"><p class="eyebrow">${esc(label)}</p>
      <${heading} class="slide-title" id="title-${n}">${n===1?["Social Media","Activity Monitoring","& Clustering System"].map(part=>`<span class="title-line">${esc(part)}</span>`).join(" "):esc(title)}</${heading}>
      <div class="slide-lede">${paragraphs(langID?s.bodyID:s.bodyEN)}</div>
      ${bulletList?.length?`<ul class="takeaways">${bulletList.map(item=>`<li>${inline(item)}</li>`).join('')}</ul>`:''}
      ${n===1||n===18?author():''}</div>
      <div class="slide-visual" id="visual-${n}">${visual(n)}</div>
      <details class="project-notes"><summary>${note?text('Detail dan catatan sumber','Details and source notes'):text('Detail dan sumber','Details and sources')}</summary><div class="notes-content">
      ${n===1?`<div><h3>${text('Judul resmi skripsi','Official thesis title')}</h3><p>${officialTitle}</p></div>`:''}
      <div><h3>${text('Tentang implementasi','Implementation')}</h3>${paragraphs(langID?s.detailID:s.detailEN)}</div>
      ${note?`<div class="source-note"><h3>${text('Catatan sumber','Source note')}</h3><p>${esc(note[langID?0:1])}</p></div>`:''}
      <div><h3>${text('Relevansi proyek','Project relevance')}</h3>${paragraphs(langID?s.hrID:s.hrEN)}</div>
      <div><h3>${text('Rujukan','Sources')}</h3>${references(s.references)}</div></div></details></div></section>`;
  }
  function renderSlides() {
    $('#presentation').innerHTML=content.map(renderSlide).join('');
    renderNavigation();
    document.documentElement.lang=language;
    $('.skip-link').textContent=text('Lewati navigasi','Skip navigation');
    $('#presentation').setAttribute('aria-label',text('Studi kasus proyek','Project case study'));
    $('#chapter-navigation').setAttribute('aria-label',text('Bab presentasi','Presentation chapters'));
    $('#sidebar').setAttribute('aria-label',text('Daftar isi','Contents'));
    $('#nav-backdrop').setAttribute('aria-label',text('Tutup daftar isi','Close contents'));
    $('#image-dialog').setAttribute('aria-label',text('Dokumentasi aplikasi','Application screenshots'));
    $('#previous-button').textContent=text('Kembali','Previous');
    $('#next-button').textContent=text('Lanjut','Next');
    $('#print-button').textContent=text('Cetak materi','Print material');
    $('#fullscreen-button').setAttribute('aria-label',text('Layar penuh','Fullscreen'));
    $('#fullscreen-button').title=text('Layar penuh','Fullscreen');
    $('#menu-label').textContent=text('Daftar isi','Contents');
    $('#sidebar-caption').textContent=text('DAFTAR ISI','CONTENTS');
    $('#close-menu-button').textContent=text('Tutup','Close');
    $('#menu-button').setAttribute('aria-label',text('Buka daftar isi','Open contents'));
    $$('.language-control button').forEach(b=>{const on=b.dataset.language===language;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});
    updateActive(active);
    syncMobileInert();
  }
  function renderNavigation() {
    $('#chapter-navigation').innerHTML=chapters.map((c,i)=>`<div class="chapter-group ${chapterFor(active)===i?'current':''}" data-chapter="${i}"><a class="chapter-link ${chapterFor(active)===i?'current':''}" href="#${hashId(c.first)}"><span class="chapter-index">${pad(i+1)}</span>${chapterTitle(i)}</a><div class="slide-links">${content.filter(s=>s.id>=c.first&&s.id<=c.last).map(s=>`<a class="slide-link ${s.id===active?'active':''}" href="#${hashId(s.id)}" ${s.id===active?'aria-current="step"':''}>${esc(text(s.topicID,s.title))}</a>`).join('')}</div></div>`).join('');
  }
  function updateActive(n) {
    active=n;
    const chapterIndex=chapterFor(n);
    const selected=content.find(s=>s.id===n);
    $$('.slide').forEach(s=>{s.hidden=Number(s.dataset.slide)!==n;});
    $('#slide-number').textContent=pad(n);
    $('#current-chapter').textContent=`${text('Bab','Chapter')} ${pad(chapterIndex+1)} · ${chapterTitle(chapterIndex)}`;
    $('#control-chapter').textContent=text('Slide','Slide');
    $('#current-title').textContent=slideTitle(selected);
    $('#progress-fill').style.width=`${n/18*100}%`;
    $('#previous-button').disabled=n===1;
    $('#next-button').disabled=n===18;
    $$('.chapter-group').forEach(group=>{const on=Number(group.dataset.chapter)===chapterIndex;group.classList.toggle('current',on);$('.chapter-link',group).classList.toggle('current',on);});
    $$('.slide-link').forEach(link=>{const on=link.hash==='#'+hashId(n);link.classList.toggle('active',on);on?link.setAttribute('aria-current','step'):link.removeAttribute('aria-current');});
    $('#slide-announcement').textContent=`${text('Slide','Slide')} ${n} ${text('dari','of')} 18: ${slideTitle(selected)}`;
    try{history.replaceState(null,'','#'+hashId(n));}catch(_){}
  }
  function go(n) {
    updateActive(Math.max(1,Math.min(18,n)));
    if(menuOpen)toggleMenu(false);
    window.scrollTo({top:0,behavior:'instant'});
  }
  function syncMobileInert() {
    $('#sidebar').inert=!menuOpen;
    $('#presentation').inert=menuOpen;
    $('.presentation-controls').inert=menuOpen;
    $('.topbar').inert=menuOpen;
  }
  function toggleMenu(open) {
    menuOpen=open;
    $('#sidebar').classList.toggle('open',open);
    $('#sidebar').setAttribute('aria-hidden',!open);
    $('#nav-backdrop').hidden=!open;
    $('#menu-button').setAttribute('aria-expanded',open);
    document.body.style.overflow=open?'hidden':'';
    syncMobileInert();
    if(open)$('#close-menu-button')?.focus();else $('#menu-button').focus({preventScroll:true});
  }

  function openImage(key, trigger) {
    const a=assets[key];if(!a)return;
    imageTrigger=trigger;
    $('#dialog-image').src=a.file;
    const title=text(a.title,a.titleEN);
    $('#dialog-image').alt=title;
    $('#dialog-image').classList.remove('zoomed');
    $('#image-dialog-title').textContent=title;
    $('#image-dialog-caption').textContent=`${text('Arsip aplikasi','Application archive')} · ${a.captured} · ${text('Periode data','Data period')}: ${text(a.dataPeriod,a.periodEN)}. ${language==='id'?a.limitation:a.limitationEN}`;
    $('[data-close-dialog]').textContent=text('Tutup','Close');
    $('[data-close-dialog]').setAttribute('aria-label',text('Tutup gambar','Close image'));
    $('#image-dialog').showModal();
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');
    const nav=event.target.closest('a[href^="#slide-"]');
    if(nav){event.preventDefault();go(Number(nav.hash.match(/\d+/)[0]));return;}
    if(!button)return;
    if(button.dataset.language){if(language===button.dataset.language)return;language=button.dataset.language;try{localStorage.setItem('portfolio-language',language);}catch(_){}const n=active;renderSlides();go(n);return;}
    if(button.dataset.role){role=button.dataset.role;$('#visual-5').innerHTML=roleVisual();$(`[data-role="${role}"]`)?.focus();return;}
    if(button.dataset.management){management=button.dataset.management;$('#visual-8').innerHTML=managementVisual();$(`[data-management="${management}"]`)?.focus();return;}
    if(button.dataset.report){reportTab=button.dataset.report;$('#visual-11').innerHTML=visual(11);$(`[data-report="${reportTab}"]`)?.focus();return;}
    if(button.hasAttribute('data-step')){algorithmStep=Number(button.dataset.step);$('#visual-14').innerHTML=algorithmVisual();$(`[data-step="${algorithmStep}"]`)?.focus();return;}
    if(button.dataset.cluster){selectedCluster=button.dataset.cluster;$('#visual-15').innerHTML=resultsVisual();$(`[data-cluster="${selectedCluster}"]`)?.focus();return;}
    if(button.dataset.image){openImage(button.dataset.image,button);return;}
    if(button.dataset.go){go(Number(button.dataset.go));return;}
    if(button.hasAttribute('data-close-dialog'))$('#image-dialog').close();
  });
  $('#previous-button').addEventListener('click',()=>go(active-1));
  $('#next-button').addEventListener('click',()=>go(active+1));
  $('#menu-button').addEventListener('click',()=>toggleMenu(!menuOpen));
  $('#nav-backdrop').addEventListener('click',()=>toggleMenu(false));
  $('#close-menu-button').addEventListener('click',()=>toggleMenu(false));
  $('#fullscreen-button').addEventListener('click',async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen();}catch(_){$('#slide-announcement').textContent=text('Layar penuh tidak tersedia pada browser ini.','Fullscreen is not available in this browser.');}});
  $('#print-button').addEventListener('click',()=>window.print());
  $('#dialog-image').addEventListener('click',()=>$('#dialog-image').classList.toggle('zoomed'));
  $('#image-dialog').addEventListener('close',()=>imageTrigger?.focus());
  $('#image-dialog').addEventListener('click',event=>{if(event.target===$('#image-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}});
  document.addEventListener('keydown',event=>{
    if(menuOpen){if(event.key==='Escape'){event.preventDefault();toggleMenu(false);}if(event.key==='Tab'){const f=$$('a,button', $('#sidebar')).filter(el=>el.getClientRects().length);const first=f[0],last=f.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}return;}
    if($('#image-dialog').open||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable]'))return;
    if(['ArrowRight','PageDown'].includes(event.key)){event.preventDefault();go(active+1);}
    if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();go(active-1);}
    if(event.key==='Home'){event.preventDefault();go(1);}if(event.key==='End'){event.preventDefault();go(18);}
  });
  window.addEventListener('hashchange',()=>{const n=Number(location.hash.match(/slide-(\d+)/)?.[1]);if(n>=1&&n<=18)go(n);});
  window.addEventListener('resize',syncMobileInert);
  renderSlides();
  requestAnimationFrame(()=>go(active));
})();
