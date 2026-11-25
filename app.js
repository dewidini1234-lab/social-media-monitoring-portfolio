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
  const platforms = ['YouTube','Police Tube','X / Twitter','Instagram','Facebook','TikTok'];
  const marks = ['YT','PT','X','IG','FB','TT'];
  const chapterFor = n => chapters.findIndex(c => n >= c.first && n <= c.last);
  const pad = n => String(n).padStart(2,'0');
  const hashId = n => `slide-${pad(n)}`;
  let active = Math.max(1,Math.min(18,Number(location.hash.match(/slide-(\d+)/)?.[1]) || 1));
  let menuOpen = false;
  let role = 'polres', management = 'recap', reportTab = 'ranking', algorithmStep = 0, selectedCluster = 'low';
  let imageTrigger = null;
  const hrEN = [
    'A web application developed for a defined organizational need, connecting operational records with data analysis.',
    'The scope combines 21 police sectors, six publication-count variables, two roles, and three clusters. Performance labels describe publication activity.',
    'The project begins with understanding the existing business process and its need for integrated records and analysis.',
    'The workflow connects operational data, eligibility rules, data preparation, analysis, and reporting.',
    'Responsibilities are translated into application permissions and police-sector record scope. Snapshots support processing traceability.',
    'The architecture connects interfaces, business rules, storage, analytics, and an external supporting integration.',
    'Summaries, charts, and navigation make operational information easier to review. Screenshot totals reflect the captured data state.',
    'Master records, user assignments, and activity records have direct consequences for access and dataset eligibility.',
    'The supporting integration demonstrates API request processing, storage, and job-status presentation. Account production status is not established by these archives.',
    'The assigned-sector view supports focused monitoring. Read-only applies to activity records; profile and communication functions follow their own permissions.',
    'Processed results are presented through rankings and reports. Labels describe publication activity within the analyzed dataset.',
    'Announcements support targeted information sharing, while messages support two-way communication between Polres and Polsek users.',
    'Data preparation establishes the source, eligibility rules, matrix structure, and transformations before clustering.',
    'The calculation is presented as an inspectable workflow, from normalized inputs to cluster assignments and evaluation.',
    'Results retain their source and period. A cluster label describes the analyzed publication-count profile rather than overall organizational performance.',
    'Technologies are mapped to their responsibilities. Code organization helps explain how the application can be inspected and maintained.',
    'The thesis testing record is distinguished from evidence for changed final behavior. Black-box findings apply to the documented scenarios.',
    'The case study connects application development, data processing, and documented results without assigning unverified individual responsibility percentages.'
  ];
  const notes = {
    2:['Variabel menggunakan jumlah publikasi. Instagram Graph API adalah fitur pendukung, terpisah dari sumber enam variabel K-Means.','Variables are publication counts. The Instagram Graph API is a supporting integration, separate from the source of the six K-Means inputs.'],
    4:['Hanya rekap Disetujui dari Polsek aktif digunakan untuk pembentukan dataset. Catatan perbedaan mekanisme penyimpanan tersedia pada bagian pengelolaan data.','Dataset formation uses approved records from active police sectors. The data-management section records the source differences in saving behavior.'],
    5:['Naskah lama menyebut Polsek mengelola aktivitas. Acuan final portfolio menetapkan rekap Polsek sebagai read-only sesuai penugasan.','Earlier thesis wording describes Polsek activity management. The approved portfolio reference uses assigned-sector read-only activity records.'],
    8:['Form mendokumentasikan “Simpan Rekap” dan “Simpan & Setujui”. Kode layanan lokal yang ditinjau memberi status Disetujui otomatis setelah validasi. Dua label tombol belum membuktikan dua status penyimpanan berbeda. Acuan dan ketidaksesuaian sumber tetap dicatat.','The form documents “Save Recap” and “Save & Approve”. The reviewed local service automatically approves validated records. Two button labels do not establish two distinct saved statuses. The approved reference and source discrepancy remain documented.'],
    9:['Diagram ini menjelaskan fungsi integrasi. Status akun pengujian atau operasional produksi belum dikonfirmasi.','This diagram explains the integration. Whether the documented account is a test or production account has not been confirmed.'],
    10:['Diagram hak akses konseptual, bukan screenshot aplikasi. Screenshot final Polsek read-only belum tersedia dalam berkas yang dapat diakses.','A conceptual access diagram, not an application screenshot. The final read-only Polsek capture is not available among the accessible files.'],
    15:['DBI skripsi dan catatan aplikasi run #11 dipertahankan terpisah. Kesetaraan seluruh input dan parameter serta penyebab selisihnya belum diverifikasi.','The thesis DBI and documented application run #11 remain separate. Input and parameter equivalence, and the cause of their difference, have not been verified.'],
    17:['Angka 25 adalah hasil yang dilaporkan dalam skripsi. Skenario Polsek masih mencakup membuat dan mengirim draf rekap. Perubahan menjadi read-only membutuhkan bukti uji yang sesuai; angka ini bukan klaim uji ulang seluruh perilaku final.','The 25 scenarios are the thesis testing record. A Polsek scenario still includes creating and submitting draft records. The read-only change requires matching test evidence; this total is not a claim of retesting all final behavior.']
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
  function platformList() {
    return `<div class="platforms" aria-label="${text('Enam variabel jumlah publikasi','Six publication-count variables')}">${platforms.map((p,i)=>`<span class="platform"><span class="platform-mark" aria-hidden="true">${marks[i]}</span>${p}</span>`).join('')}</div>`;
  }
  function screenshot(key, size = '') {
    const asset = assets[key];
    if (!asset) return `<p class="visual-caption">${text('Dokumentasi asli belum tersedia.','Original documentation is not available.')}</p>`;
    const date = new Date(asset.captured+'T12:00:00').toLocaleDateString(language==='id'?'id-ID':'en-GB',{day:'numeric',month:'short',year:'numeric'});
    return `<figure class="screenshot ${size}"><div class="capture-bar"><span>${text('Arsip aplikasi','Application archive')} · ${date}</span><button class="capture-expand" data-image="${key}">${text('Perbesar','Enlarge')}</button></div><button class="capture-view" data-image="${key}" aria-label="${text('Perbesar screenshot','Enlarge screenshot')}: ${esc(asset.title)}"><img src="${esc(asset.file)}" alt="${esc(asset.title)} — ${text('screenshot asli arsip aplikasi','original archived application screenshot')}" loading="${size==='cover-image'?'eager':'lazy'}" width="${asset.width}" height="${asset.height}" ${size==='cover-image'?'fetchpriority="high"':''}></button><figcaption><strong>${esc(asset.title)}</strong><br>${text('Periode data','Data period')}: ${esc(asset.dataPeriod)}.<details class="capture-detail"><summary>${text('Keterangan sumber','Source context')}</summary><p>${esc(language==='id'?asset.limitation:asset.limitationEN)}</p></details></figcaption></figure>`;
  }
  function imageButton(key, label) { return assets[key] ? `<button class="text-button" data-image="${key}">${esc(label)}</button>` : ''; }
  function flowNode(icon, heading, detail, classes='') {return `<div class="flow-node ${classes}"><span class="flow-icon" aria-hidden="true">${icon}</span><div><h3>${heading}</h3><p>${detail}</p></div></div>`;}
  function pills() { return `<div class="cluster-strip"><span class="cluster-pill high">${text('Kinerja Tinggi','High Performance')}</span><span class="cluster-pill medium">${text('Kinerja Sedang','Medium Performance')}</span><span class="cluster-pill low">${text('Kinerja Rendah','Low Performance')}</span></div>`; }
  function roleVisual() {
    const isPolres = role === 'polres';
    const items = isPolres ? [text('Mengelola rekap seluruh Polsek','Manage records across police sectors'),text('Mengelola pengguna dan penugasan','Manage users and assignments'),text('Membentuk dataset dan preprocessing','Prepare datasets and preprocessing'),text('Menjalankan K-Means dan evaluasi DBI','Run K-Means and DBI evaluation')] : [text('Melihat rekap Polsek penugasan','View assigned-sector activity records'),text('Melihat hasil dan laporan sesuai cakupan','View results and reports within scope'),text('Menggunakan profil dan komunikasi','Use profile and communication functions')];
    return `<div class="visual-panel"><div class="visual-label">${text('Dua role, kewenangan berbeda','Two roles, distinct permissions')}</div><div class="segmented" role="group" aria-label="${text('Pilih role','Choose role')}"><button data-role="polres" aria-pressed="${isPolres}" class="${isPolres?'active':''}">Admin Polres</button><button data-role="polsek" aria-pressed="${!isPolres}" class="${!isPolres?'active':''}">Admin Polsek</button></div><h3 class="role-title">Admin Humas ${isPolres?'Polres':'Polsek'}</h3><p class="role-scope">${isPolres?text('Pengelolaan terpusat · cakupan 21 Polsek','Central administration · scope of 21 police sectors'):text('Pemantauan unit · sesuai penugasan akun','Sector monitoring · scoped to user assignment')}</p><ul class="capability-list">${items.map(i=>`<li>${i}</li>`).join('')}${!isPolres?`<li class="restricted">${text('Rekap read-only; tanpa kewenangan mengubah','Read-only activity records; no editing permission')}</li>`:''}</ul><div class="role-foot">${text('Kontrol data: role pengguna + identitas Polsek pada sesi.','Data access: user role + assigned police sector in the session.')}</div></div><div class="gate"><span>${text('Kelayakan dataset','Dataset eligibility')}</span>${text('Disetujui + Polsek aktif','Approved + active police sector')}</div>`;
  }
  function managementVisual() {
    const configs = {polsek:[text('Identitas & status Polsek','Police sector identity & status'),text('Data unit menjadi referensi rekap dan pembentukan dataset. Status aktif memengaruhi kelayakan data.','Sector records support activity recapitulation and dataset formation. Active status affects data eligibility.')],users:[text('Akun, role & penugasan','Accounts, roles & assignments'),text('Akun pengguna dihubungkan dengan kewenangan dan Polsek penugasan. Admin Polres mengelola akun secara terpusat.','User accounts are linked to permissions and police sector assignments. Admin Polres manages accounts centrally.')]};
    return `<div class="segmented" role="group" aria-label="${text('Area pengelolaan','Management area')}">${[['polsek','Polsek'],['users',text('Pengguna','Users')],['recap',text('Rekap','Records')]].map(([v,l])=>`<button data-management="${v}" class="${management===v?'active':''}" aria-pressed="${management===v}">${l}</button>`).join('')}</div>${management==='recap'?screenshot('recap'):`<div class="visual-panel"><div class="visual-label">${text('Fungsi terkonfirmasi · diagram penjelasan','Confirmed function · explanatory diagram')}</div><h3 class="visual-heading">${configs[management][0]}</h3><p class="feature-note">${configs[management][1]}</p><div class="gate"><span>Admin Humas Polres</span>${text('Pengelola terpusat','Central administrator')}</div></div>`}<p class="visual-caption">${text('Enam input rekap merupakan jumlah publikasi per platform.','The six record inputs represent publication counts by platform.')}</p>`;
  }
  function algorithmVisual() {
    const steps = [
      [text('Normalisasi','Normalization'),text('Enam fitur, satu rentang skala','Six features, one common range'),text('Nilai setiap platform dinormalisasi ke rentang 0–1 berdasarkan minimum dan maksimum dalam snapshot yang sama.','Each platform is normalized to a 0–1 range using the minimum and maximum within the same snapshot.'),'preprocessing'],
      [text('Centroid awal','Initial centroids'),'Deterministic farthest-first',text('Pusat pertama berasal dari rata-rata vektor terkecil. Pusat berikutnya dipilih dengan nearest squared distance maksimum terhadap pusat yang sudah terpilih.','The first center has the smallest vector average. Subsequent centers maximize their nearest squared distance to the centers already selected.'),null],
      [text('Iterasi','Iterations'),text('Penempatan, pembaruan, pemeriksaan','Assign, update, check'),text('Polsek ditempatkan ke centroid terdekat. Centroid diperbarui dengan rata-rata anggota; proses berulang sampai anggota stabil atau pergeseran memenuhi toleransi.','Police sectors are assigned to their nearest centroid. Centers are updated from member averages until assignments stabilize or movement meets the tolerance.'),null],
      [text('Hasil akhir','Final results'),text('Tiga kelompok aktivitas publikasi','Three publication activity groups'),text('Label Tinggi, Sedang, dan Rendah mengikuti urutan rata-rata centroid akhir. C1, C2, dan C3 adalah identitas klaster, bukan label kinerja yang tetap.','High, Medium, and Low labels follow the final centroid averages. C1, C2, and C3 are cluster identifiers, not fixed performance labels.'),'kmeans'],
      ['DBI',text('Evaluasi sebaran dan pemisahan','Evaluate spread and separation'),text('Davies-Bouldin Index menggunakan sebaran anggota terhadap centroid dan jarak antarpusat. DBI mengevaluasi hasil; penetapan kelompok dilakukan oleh K-Means.','The Davies-Bouldin Index uses member spread around centroids and distances between centers. DBI evaluates the result; K-Means produces the groups.'),'dbi']
    ];
    const step=steps[algorithmStep];
    return `<div class="visual-panel"><div class="step-tabs" role="group" aria-label="${text('Tahap analitik','Analytical stage')}">${steps.map((s,i)=>`<button data-step="${i}" class="${i===algorithmStep?'active':''}" aria-pressed="${i===algorithmStep}" aria-label="${esc(s[0])}">${esc(s[0])}</button>`).join('')}</div><div class="step-canvas" aria-live="polite"><div class="step-count">${pad(algorithmStep+1)} / 05 · ${esc(step[0]).toUpperCase()}</div><h3>${step[1]}</h3><p>${step[2]}</p>${algorithmStep===0?'<div class="equation">x′ = (x − min) / (max − min)</div>':algorithmStep===2?'<div class="equation">d(x,c) = √Σ<sub>j=1…6</sub> (x<sub>j</sub> − c<sub>j</sub>)²</div>':algorithmStep===3?pills():''}${step[3]?imageButton(step[3],text('Lihat dokumentasi asli','View original documentation')):''}</div><div class="algorithm-track" aria-hidden="true">${steps.map((_,i)=>`<span class="${i<=algorithmStep?'active':''}"></span>`).join('')}</div></div><p class="visual-caption">${text('Diagram menjelaskan proses. Arsip aplikasi tersedia terpisah melalui tombol dokumentasi.','The diagram explains the process. Original application archives are available separately through the documentation buttons.')}</p>`;
  }
  const clusters = {
    high:{count:2,labelID:'Kinerja Tinggi',labelEN:'High Performance',members:['Pamanukan','Purwadadi']},
    medium:{count:3,labelID:'Kinerja Sedang',labelEN:'Medium Performance',members:['Pagaden','Pusakanagara','Subang']},
    low:{count:16,labelID:'Kinerja Rendah',labelEN:'Low Performance',members:['Binong','Blanakan','Ciasem','Cibogo','Cijambe','Cikaum','Cipeundeuy','Cisalak','Compreng','Jalancagak','Kalijati','Legonkulon','Pabuaran','Patokbeusi','Segalaherang','Tanjungsiang']}
  };
  function resultsVisual() {
    const selected=clusters[selectedCluster];
    return `<div class="visual-panel"><div class="visual-label">${text('Hasil penelitian · September 2025','Research results · September 2025')}</div><div class="cluster-bars">${Object.entries(clusters).map(([key,c])=>`<button class="cluster-row ${key}" data-cluster="${key}" aria-pressed="${selectedCluster===key}"><span>${esc(language==='id'?c.labelID:c.labelEN)}<b>${c.count} <small>Polsek</small></b></span><span class="bar-track"><i style="width:${c.count/21*100}%"></i></span></button>`).join('')}</div><div class="cluster-member-detail" aria-live="polite"><h4>${esc(language==='id'?selected.labelID:selected.labelEN)} · ${selected.count} Polsek</h4><p>${esc(selected.members.join(' · '))}</p></div></div><div class="dbi-comparison"><div class="dbi-value"><span>${text('DBI · dilaporkan dalam skripsi','DBI · thesis report')}</span><strong>${text('0,4860797654','0.4860797654')}</strong><small>${text('Hasil penelitian','Research result')}</small></div><div class="dbi-value"><span>${text('DBI · catatan aplikasi run #11','DBI · application run #11 record')}</span><strong>${text('0,48621367','0.48621367')}</strong><small>${text('Catatan Screenshot Collection','Screenshot Collection record')}</small></div></div><p class="visual-caption">${text('21 Polsek · K = 3 · konvergen pada iterasi kedua dalam penelitian ini. Nilai aplikasi di atas berasal dari catatan dokumentasi, terpisah dari tabel hasil naskah.','21 police sectors · K = 3 · second-iteration convergence in this research. The application value comes from the documentation record, separate from the thesis result table.')}</p>${imageButton('kmeans',text('Lihat arsip hasil aplikasi','View archived application results'))}`;
  }
  function visual(n) {
    switch(n) {
      case 1:return `<div class="cover-tagline">${text('Data operasional. Insight terstruktur.','Operational records. Structured insights.')}</div>${screenshot('dashboard','cover-image')}<div class="cover-bottom"><span><strong>21</strong>Polsek</span><span><strong>6</strong>${text('variabel publikasi','publication variables')}</span><span><strong>3</strong>${text('klaster','clusters')}</span></div>`;
      case 2:return `<div class="stats-grid">${[['21',text('Polsek dalam cakupan','Police sectors in scope')],['6',text('Variabel jumlah publikasi','Publication-count variables')],['2',text('Role pengguna','User roles')],['3',text('Kelompok K-Means','K-Means clusters')]].map(([v,l])=>`<div class="stat"><strong>${v}</strong><span>${l}</span></div>`).join('')}</div>${platformList()}${pills()}<p class="visual-caption">${text('Variabel = jumlah publikasi pada setiap platform.','Variables = publication counts for each platform.')}</p>`;
      case 3:return `<div class="visual-label">AS-IS BUSINESS PROCESS</div><div class="flow manual">${flowNode('P',text('Publikasi oleh Polsek','Police sector publications'),text('Konten dipublikasikan ke media sosial.','Content is published on social media.'))}${flowNode('W','WhatsApp',text('Tautan dikirim ke grup Humas.','Links are submitted to the Humas group.'))}${flowNode('H',text('Penghitungan manual','Manual counting'),text('Admin Humas Polres menghitung publikasi.','Admin Humas Polres counts publications.'))}${flowNode('E','Microsoft Excel',text('Rekap disusun per Polsek dan platform.','Records are organized by sector and platform.'))}</div>`;
      case 4:return `<div class="visual-label">TO-BE · ${text('ALUR IMPLEMENTASI ACUAN','APPROVED IMPLEMENTATION WORKFLOW')}</div><div class="workflow-grid">${flowNode('IN',text('Input rekap terpusat','Central record entry'),text('Polsek, tanggal, enam jumlah publikasi.','Sector, date, six publication counts.'))}${flowNode('SV',text('Pilihan penyimpanan','Saving options'),text('Simpan Rekap / Simpan & Setujui.','Save Recap / Save & Approve.'))}${flowNode('✓',text('Kelayakan data','Data eligibility'),text('Disetujui + Polsek aktif.','Approved + active police sector.'),'accent')}${flowNode('DS',text('Dataset bulanan','Monthly dataset'),text('Agregasi per Polsek dan periode.','Aggregation by sector and period.'))}${flowNode('MM',text('Snapshot & preprocessing','Snapshot & preprocessing'),text('Min-Max dan riwayat pengolahan.','Min-Max and processing history.'))}${flowNode('KM','K-Means',text('Euclidean · tiga kelompok.','Euclidean · three clusters.'))}${flowNode('DB',text('Evaluasi DBI','DBI evaluation'),text('Evaluasi kualitas klaster.','Clustering quality evaluation.'))}${flowNode('RP',text('Ranking & laporan','Rankings & reports'),text('Penyajian hasil sesuai cakupan.','Results within the user’s scope.'))}</div><p class="visual-caption">${text('Admin Polsek mengakses rekap penugasannya secara read-only. DBI mengevaluasi hasil klaster; ranking dan laporan menyajikan hasil analisis.','Admin Polsek accesses assigned-sector records as read-only. DBI evaluates clusters; rankings and reports present the analytical results.')}</p>`;
      case 5:return roleVisual();
      case 6:return `<div class="architecture"><div class="architecture-row"><strong>Web Browser</strong><span>Admin Humas Polres · Admin Humas Polsek</span></div><div class="architecture-connector">REQUEST / RESPONSE</div><div class="architecture-row backend"><strong>Apache · PHP Native</strong><span>${text('Autentikasi & otorisasi','Authentication & authorization')}<br>Controller · Service · Repository · View</span></div><div class="architecture-columns"><div class="architecture-row"><strong>MySQL / MariaDB</strong><span>PDO · ${text('penyimpanan data','data storage')}</span></div><div class="architecture-row external"><strong>Instagram Graph API</strong><span>${text('Modul crawling · pendukung','Crawling module · supporting')}</span></div></div></div><p class="visual-caption">${text('Diagram komponen konseptual. Jalur enam variabel K-Means berasal dari Rekap Aktivitas.','Conceptual component diagram. The six K-Means variables originate from Activity Records.')}</p>`;
      case 7:return `${screenshot('dashboard')}<div class="outcome-list"><span>${text('Ringkasan','Summaries')}</span><span>${text('Aktivitas bulanan','Monthly activity')}</span><span>${text('Distribusi platform','Platform distribution')}</span></div>`;
      case 8:return managementVisual();
      case 9:return `<div class="api-node main"><span>SUPPORTING INTEGRATION</span><h3>Instagram Graph API</h3><span>${text('Akun yang dikonfigurasi','Configured account')}</span></div><div class="api-node"><div class="visual-label">${text('Permintaan & hasil tersimpan','Requests & stored results')}</div><div class="api-fields">${[text('Rentang tanggal','Date range'),text('Riwayat pekerjaan','Job history'),text('Keterangan & tautan','Captions & links'),text('Suka & komentar','Likes & comments')].map(s=>`<span>${s}</span>`).join('')}</div></div><div class="gate"><span>${text('Input K-Means','K-Means inputs')}</span>${text('Rekap jumlah publikasi enam platform','Six-platform publication records')}</div><p class="visual-caption">${text('Diagram fungsi integrasi, bukan screenshot atau data akun buatan.','Integration diagram, not an application screenshot or invented account data.')}</p>`;
      case 10:return `<div class="read-only-panel"><div class="visual-label">${text('CAKUPAN PENGGUNA','USER SCOPE')}</div><span class="access-chip">READ-ONLY · ${text('REKAP AKTIVITAS','ACTIVITY RECORDS')}</span><h3>Admin Humas Polsek</h3><p>${text('Informasi yang relevan dengan Polsek penugasan akun.','Information relevant to the account’s assigned police sector.')}</p><div class="read-only-grid"><div><span>${text('Cakupan rekap','Record scope')}</span><strong>${text('Polsek penugasan','Assigned police sector')}</strong></div><div><span>${text('Kewenangan rekap','Record permission')}</span><strong>${text('Melihat','View records')}</strong></div></div><div class="read-only-features"><span>${text('Ringkasan','Summary')}</span><span>${text('Rekap terbaru','Recent records')}</span><span>${text('Ranking & laporan','Rankings & reports')}</span><span>${text('Pengumuman','Announcements')}</span></div></div><p class="visual-caption">${text('Diagram konseptual berdasarkan ketentuan akses final. Profil dan komunikasi memiliki kewenangan tersendiri.','Conceptual diagram based on the final access policy. Profile and communication functions have their own permissions.')}</p>`;
      case 11:return `<div class="segmented" role="group" aria-label="${text('Dokumentasi hasil','Results documentation')}"><button data-report="ranking" class="${reportTab==='ranking'?'active':''}" aria-pressed="${reportTab==='ranking'}">Ranking</button><button data-report="report" class="${reportTab==='report'?'active':''}" aria-pressed="${reportTab==='report'}">${text('Laporan','Reports')}</button></div>${screenshot(reportTab)}<p class="comparison-note">${reportTab==='ranking'?text('Dasar urutan pada kode lokal: prioritas klaster, skor normalisasi, lalu jarak centroid. DBI mengevaluasi klaster.','Local ranking order: cluster priority, normalized score, then centroid distance. DBI evaluates clustering.'):text('Arsip laporan September 2026 / run #8 memiliki distribusi berbeda (7/8/6). Digunakan untuk menunjukkan fitur laporan, bukan hasil penelitian September 2025.','This September 2026 / run #8 report has a different distribution (7/8/6). It demonstrates reporting functionality, not the September 2025 research results.')}</p>`;
      case 12:return `<div class="communication"><div class="communication-block"><div class="communication-label">ANNOUNCEMENTS</div><h3>${text('Informasi sesuai audiens','Information for the intended audience')}</h3><p>${text('Admin Polres mengelola pengumuman untuk seluruh pengguna, seluruh Admin Polsek, atau satu Polsek.','Admin Polres manages announcements for all users, all Admin Polsek users, or one police sector.')}</p><div class="communication-path"><span>Admin Polres</span><b></b><span>${text('Audiens terpilih','Selected audience')}</span></div></div><div class="communication-block"><div class="communication-label">INTERNAL MESSAGES</div><h3>${text('Percakapan dalam konteks unit','Conversations in sector context')}</h3><p>${text('Pesan dua arah dikelompokkan berdasarkan Polsek.','Two-way messages are organized by police sector.')}</p><div class="communication-path"><span>Admin Polres</span><b></b><span>Admin Polsek</span></div></div></div><p class="visual-caption">${text('Diagram fungsi komunikasi. Isi percakapan dan pengumuman internal tidak ditampilkan.','Communication function diagram. Internal message and announcement content is not displayed.')}</p>`;
      case 13:return `<div class="visual-panel"><div class="visual-label">${text('STRUKTUR DATASET PENELITIAN','RESEARCH DATASET STRUCTURE')} · 21 × 6</div><div class="dataset-matrix"><span>Polsek</span>${marks.map(m=>`<span>${m}</span>`).join('')}<span>${text('Setiap Polsek','Each sector')}</span>${marks.map((_,i)=>`<span class="matrix-dim">x<sub>${i+1}</sub></span>`).join('')}<span>…</span>${marks.map(()=>'<span class="matrix-dim">…</span>').join('')}</div><p class="visual-caption">${text('Representasi struktur, tanpa nilai contoh buatan. Baris: Polsek. Kolom: enam jumlah publikasi.','Structural representation without invented example values. Rows: police sectors. Columns: six publication counts.')}</p><div class="formula">x′ = (x − min) / (max − min)<small>${text('Per variabel · rentang 0–1 · fitur konstan ditetapkan 0','Per variable · 0–1 range · constant features are set to 0')}</small></div><div class="outcome-list"><span>Snapshot</span><span>Min-Max</span><span>${text('Riwayat preprocessing','Preprocessing history')}</span></div></div><div class="capture-detail">${imageButton('dataset',text('Arsip dataset · Juli 2026','Dataset archive · July 2026'))}${imageButton('preprocessing',text('Arsip normalisasi · Sep 2025','Normalization archive · Sep 2025'))}</div><p class="visual-caption">${text('Kedua arsip berperiode berbeda; tidak disajikan sebagai pasangan sebelum/sesudah dari snapshot yang sama.','The two archives have different periods; they are not presented as a before/after pair from one snapshot.')}</p>`;
      case 14:return algorithmVisual();
      case 15:return resultsVisual();
      case 16:return `<div class="stack-grid">${[['INTERFACE','HTML · CSS · JavaScript','Bootstrap'],['APPLICATION','PHP Native','Controller · Service · Repository · View'],['DATA','PDO · MySQL / MariaDB',text('Basis data relasional','Relational data storage')],['VISUALIZATION','Chart.js',text('Grafik aplikasi','Application charts')],['ANALYTICS','K-Means · DBI','Min-Max · Euclidean'],['ENVIRONMENT','Apache · XAMPP','Visual Studio Code']].map(([a,b,c],i)=>`<div class="stack-item ${i===1?'featured':''}"><span>${a}</span><strong>${b}</strong><p>${c}</p></div>`).join('')}</div><p class="visual-caption">${text('Stack di atas adalah aplikasi penelitian. Website portfolio ini menggunakan HTML, CSS, dan Vanilla JavaScript, siap untuk GitHub Pages.','The stack above belongs to the research application. This portfolio uses HTML, CSS, and Vanilla JavaScript and is ready for GitHub Pages.')}</p>`;
      case 17:return `<div class="visual-panel"><span class="test-record-label">${text('DILAPORKAN DALAM SKRIPSI','REPORTED IN THE THESIS')}</span><div class="test-total"><strong>25</strong><span>${text('skenario black box dengan hasil sesuai harapan dalam naskah','black-box scenarios reported as meeting expected outcomes')}</span></div><div class="test-breakdown"><div><strong>16</strong><span>Admin Humas Polres</span></div><div><strong>9</strong><span>Admin Humas Polsek</span></div></div><div class="outcome-list"><span>${text('Fungsi utama','Core functions')}</span><span>${text('Validasi masukan','Input validation')}</span><span>${text('Cakupan akses','Access scope')}</span></div></div><p class="visual-caption">${text('Catatan pengujian penelitian. Penyesuaian hak akses final memerlukan bukti pengujian yang sesuai.','Research testing record. Final access-policy changes require matching testing evidence.')}</p>`;
      case 18:return `<div class="closing-visual"><span>PROJECT CASE STUDY · 2026</span><h3>Social Media Activity Monitoring & Clustering System</h3><div class="closing-areas"><span>${text('Pengembangan sistem informasi','Information systems development')}</span><span>${text('Pengelolaan & pengolahan data','Data management & processing')}</span><span>${text('Analisis & dokumentasi hasil','Analysis & result documentation')}</span></div><button class="closing-button" data-go="1">${text('Kembali ke Project Overview','Back to Project Overview')}</button></div>`;
      default:return '';
    }
  }

  const chapterNamesID=['Pengenalan Proyek','Desain Sistem','Eksplorasi Aplikasi','Analisis Data','Evaluasi & Kontribusi'];
  const titlesID=['','Social Media Activity Monitoring & Clustering System','Ringkasan Proyek','Latar Belakang Proyek','Solusi yang Dikembangkan','Hak Akses & Tata Kelola Data','Arsitektur Sistem','Dashboard Admin Humas Polres','Pengelolaan Data Terpusat','Integrasi API Instagram','Dashboard Admin Humas Polsek','Ranking & Laporan','Komunikasi Internal','Dari Rekap Menjadi Dataset','Cara Kerja K-Means','Hasil Klasterisasi & Insight','Teknologi & Rekayasa Sistem','Pengujian & Hasil Proyek','Kontribusi & Penutup'];
  const subtitlesID=['','Sistem informasi berbasis web untuk Humas Polres Subang.','Cakupan sistem, pengguna, dan tujuan analisis.','Memahami proses rekap sebelum aplikasi dikembangkan.','Menghubungkan pengelolaan rekap dengan hasil analisis.','Kewenangan yang jelas dan proses data yang dapat ditelusuri.','Hubungan antarmuka, logika aplikasi, basis data, dan integrasi.','Ringkasan aktivitas publikasi seluruh Polsek dalam cakupan sistem.','Mengelola data Polsek, penugasan pengguna, dan rekap publikasi.','Fitur pendukung pengambilan informasi publikasi Instagram.','Pemantauan yang berfokus pada Polsek penugasan akun.','Menyajikan hasil analisis untuk monitoring dan pelaporan.','Pengumuman terarah dan percakapan sesuai konteks Polsek.','Menyiapkan data yang memenuhi syarat sebelum klasterisasi.','Mengelompokkan Polsek berdasarkan enam variabel publikasi.','Membaca hasil dengan periode dan sumber yang jelas.','Teknologi yang digunakan dan tanggung jawab setiap komponen.','Bukti pengujian penelitian dan batas penerapannya pada versi final.','Menghubungkan kebutuhan organisasi dengan aplikasi yang dikembangkan.'];
  const noteLabels={2:['Tentang variabel publikasi','About publication variables'],4:['Ketentuan data untuk analisis','Data eligibility for analysis'],5:['Perbedaan hak akses dalam sumber','Access-policy source differences'],8:['Perbedaan status rekap antar-sumber','Record-status source differences'],9:['Konteks akun Instagram','Instagram account context'],10:['Diagram akses final Polsek','Final Polsek access diagram'],15:['Perbedaan nilai DBI antar-sumber','DBI source differences'],17:['Konteks pengujian versi skripsi','Thesis-version testing context']};
  function slideTitle(s){return language==='id'?titlesID[s.id]:s.id===1?titlesID[1]:s.title;}
  function chapterTitle(index){return language==='id'?chapterNamesID[index]:chapters[index].name;}
  function renderSlides() {
    $('#presentation').innerHTML=content.map(s=>{
      const chapterIndex=chapterFor(s.id);
      const parts=(language==='id'?s.bodyID:s.bodyEN).split(/\n\s*\n/);
      const visibleCount=s.id===1?1:2;
      const visible=parts.slice(0,visibleCount).join('\n\n');
      const rest=parts.slice(visibleCount).join('\n\n');
      const note=notes[s.id];
      const title=slideTitle(s);
      const official='Implementasi Algoritma K-Means untuk Klasterisasi Aktivitas Viralisasi Media Sosial Polsek pada Sistem Informasi Berbasis Web di Humas Polres Subang.';
      return `<section class="slide ${s.id===1?'cover':s.id===18?'closing':''}" id="${hashId(s.id)}" data-slide="${s.id}" aria-labelledby="title-${s.id}" ${s.id!==active?'hidden':''}><div class="slide-inner"><div class="slide-copy"><div class="eyebrow">${text('Bab','Chapter')} ${pad(chapterIndex+1)} · ${chapterTitle(chapterIndex)}</div><${s.id===1?'h1':'h2'} class="slide-title" id="title-${s.id}">${esc(title)}</${s.id===1?'h1':'h2'}><p class="slide-subtitle">${inline(language==='id'?subtitlesID[s.id]:s.subtitle)}</p><div class="slide-lede">${paragraphs(visible)}</div>${[8,13].includes(s.id)?`<p class="variable-list"><strong>${text('Jumlah publikasi:','Publication counts:')}</strong> ${platforms.join(' · ')}</p>`:''}${s.id===1?`<div class="author"><div class="author-mark" aria-hidden="true">DE</div><div><strong>Dewi Embun Permata Dini, S.Kom.</strong><span>${text('Sistem Informasi','Information Systems')} · Universitas Mandiri · 2026</span></div></div>`:''}${s.id===18?`<div class="closing-name">Dewi Embun Permata Dini, S.Kom.</div><div class="closing-degree">${text('Sistem Informasi','Information Systems')} · Universitas Mandiri · 2026</div>`:''}${note?`<button class="source-indicator" data-open-notes="${s.id}">${esc(noteLabels[s.id][language==='id'?0:1])}</button>`:''}<details class="project-notes"><summary>${text('Baca detail & referensi','Read details & references')}</summary><div class="notes-content">${s.id===1?`<h3>${text('Judul resmi skripsi','Official research title')}</h3><p>${official}</p>`:''}${rest?`<h3>${text('Penjelasan lengkap','Further explanation')}</h3>${paragraphs(rest)}`:''}${note?`<div class="source-note"><h3>${text('Catatan sumber','Source note')}</h3><p>${esc(note[language==='id'?0:1])}</p></div>`:''}<h3>${text('Untuk recruiter','For recruiters')}</h3>${paragraphs(language==='id'?s.hrID:hrEN[s.id-1])}<h3>${text('Referensi','References')}</h3>${references(s.references)}</div></details></div><div class="slide-visual" id="visual-${s.id}">${visual(s.id)}</div></div></section>`;
    }).join('');
    renderNavigation();
    document.documentElement.lang=language;
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
    $('#chapter-navigation').innerHTML=chapters.map((c,i)=>`<div class="chapter-group ${chapterFor(active)===i?'current':''}" data-chapter="${i}"><a class="chapter-link ${chapterFor(active)===i?'current':''}" href="#${hashId(c.first)}"><span class="chapter-index">${pad(i+1)}</span>${chapterTitle(i)}</a><div class="slide-links">${content.filter(s=>s.id>=c.first&&s.id<=c.last).map(s=>`<a class="slide-link ${s.id===active?'active':''}" href="#${hashId(s.id)}" ${s.id===active?'aria-current="step"':''}>${s.id===1?text('Sampul proyek','Project cover'):esc(slideTitle(s))}</a>`).join('')}</div></div>`).join('');
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
    $('#dialog-image').alt=a.title;
    $('#dialog-image').classList.remove('zoomed');
    $('#image-dialog-title').textContent=a.title;
    $('#image-dialog-caption').textContent=`${text('Arsip aplikasi','Application archive')} · ${a.captured} · ${text('Periode data','Data period')}: ${a.dataPeriod}. ${language==='id'?a.limitation:a.limitationEN}`;
    $('[data-close-dialog]').textContent=text('Tutup','Close');
    $('#image-dialog').showModal();
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');
    const nav=event.target.closest('a[href^="#slide-"]');
    if(nav){event.preventDefault();go(Number(nav.hash.match(/\d+/)[0]));return;}
    if(!button)return;
    if(button.dataset.openNotes){const detail=$('#'+hashId(Number(button.dataset.openNotes))+' .project-notes');if(detail){detail.open=true;$('summary',detail).focus({preventScroll:true});}return;}
    if(button.dataset.language){if(language===button.dataset.language)return;language=button.dataset.language;try{localStorage.setItem('portfolio-language',language);}catch(_){}const n=active;renderSlides();go(n,false);return;}
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
    if($('#image-dialog').open||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('button,a,summary,input,textarea,select,[contenteditable]'))return;
    if(['ArrowRight','PageDown'].includes(event.key)){event.preventDefault();go(active+1);}
    if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();go(active-1);}
    if(event.key==='Home'){event.preventDefault();go(1);}if(event.key==='End'){event.preventDefault();go(18);}
  });
  window.addEventListener('hashchange',()=>{const n=Number(location.hash.match(/slide-(\d+)/)?.[1]);if(n>=1&&n<=18)go(n,false);});
  window.addEventListener('resize',syncMobileInert);
  const previouslyOpen=[];
  window.addEventListener('beforeprint',()=>{$$('.story,.official-title').forEach(d=>{previouslyOpen.push([d,d.open]);d.open=true;});});
  window.addEventListener('afterprint',()=>{previouslyOpen.splice(0).forEach(([d,open])=>{d.open=open;});});
  renderSlides();
  requestAnimationFrame(()=>go(active,false));
})();
