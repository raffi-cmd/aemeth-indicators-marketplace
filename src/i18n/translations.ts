export type Language = 'id' | 'en';

export interface TranslationDict {
  nav: {
    home: string;
    indicators: string;
    bundles: string;
    howItWorks: string;
    faq: string;
    installationGuide: string;
    trackOrder: string;
    cart: string;
  };
  hero: {
    tag: string;
    headlinePart1: string;
    headlinePart2: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
  };
  bento: {
    sectionTag: string;
    quoteTitle: string;
    quoteHighlight1: string;
    quoteHighlight2: string;
    card1Badge: string;
    card1Title: string;
    card1Desc: string;
    card1Cta: string;
    card2Title: string;
    card2Subtitle: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    ecosystemTitle: string;
  };
  catalog: {
    sectionTag: string;
    title: string;
    description: string;
    activeScriptsCount: string;
    searchPlaceholder: string;
    allTypes: string;
    openSourceType: string;
    privateType: string;
    bundleType: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    allCategories: string;
    catLiquidity: string;
    catVolume: string;
    catTrend: string;
    catReversal: string;
    catBundle: string;
    emptyTitle: string;
    emptyDesc: string;
    resetFilters: string;
    viewDetails: string;
    getAccess: string;
    lifetimeUpdates: string;
    antiRepaintLock: string;
  };
  productDetail: {
    openSourceBadge: string;
    privateBadge: string;
    bundleBadge: string;
    technicalOverview: string;
    antiRepaintDirectiveTitle: string;
    antiRepaintDirectiveDesc: string;
    keyFeatures: string;
    deliveryMethodTitle: string;
    openSourceDeliveryDesc: string;
    privateDeliveryDesc: string;
    bundleDeliveryDesc: string;
    riskDisclaimerTitle: string;
    riskDisclaimerDesc: string;
    pricingLabel: string;
    proceedToCheckout: string;
    close: string;
  };
  checkout: {
    title: string;
    orderSummary: string;
    itemsToPurchase: string;
    totalDue: string;
    customerDetails: string;
    emailLabel: string;
    emailPlaceholder: string;
    tvUsernameLabel: string;
    tvUsernameNote: string;
    tvUsernamePlaceholder: string;
    paymentMethodTitle: string;
    bankTransfer: string;
    bankTransferDesc: string;
    cryptoDeposit: string;
    cryptoDepositDesc: string;
    paypal: string;
    paypalDesc: string;
    termsAgreement: string;
    termsLink: string;
    generateInvoice: string;
    validatingServer: string;
    orderReference: string;
    amountDue: string;
    bankAccountTitle: string;
    copy: string;
    copied: string;
    uploadReceiptTitle: string;
    confirmBankPayment: string;
    cryptoDestinationTitle: string;
    cryptoTxidLabel: string;
    cryptoTxidPlaceholder: string;
    confirmCryptoPayment: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
    trackOrderCta: string;
  };
  orderStatus: {
    title: string;
    subtitle: string;
    lookupTitle: string;
    orderNumberPlaceholder: string;
    tokenPlaceholder: string;
    lookupButton: string;
    searching: string;
    orderNotFound: string;
    orderFoundTitle: string;
    statusLabel: string;
    paymentMethodLabel: string;
    dateLabel: string;
    customerEmailLabel: string;
    tvUsernameLabel: string;
    purchasedItems: string;
    statusAwaiting: string;
    statusVerifying: string;
    statusPaid: string;
    statusCancelled: string;
    openSourceNotice: string;
    viewSourceCode: string;
    downloadPine: string;
    downloadTxt: string;
    installationGuideButton: string;
    inviteNoticeTitle: string;
    inviteNoticeDesc: string;
    inviteStatusGranted: string;
    inviteStatusPending: string;
    howToLoadTitle: string;
    howToLoadSteps: string[];
    supportPrompt: string;
    contactSupport: string;
    contactWhatsApp: string;
    contactTelegram: string;
    supportHoursNotice: string;
  };
  installationGuide: {
    sectionTag: string;
    title: string;
    subtitle: string;
    tabSteps: string;
    tabTroubleshooting: string;
    stepsTitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    step5Title: string;
    step5Desc: string;
    troubleshootTitle: string;
    err1Title: string;
    err1Desc: string;
    err1Fix: string;
    err2Title: string;
    err2Desc: string;
    err2Fix: string;
    err3Title: string;
    err3Desc: string;
    err3Fix: string;
    err4Title: string;
    err4Desc: string;
    err4Fix: string;
    needManualHelp: string;
    needManualHelpDesc: string;
    askOnWhatsApp: string;
    askOnTelegram: string;
    supportNote: string;
  };
  howItWorks: {
    sectionTag: string;
    title: string;
    subtitle: string;
    step1Num: string;
    step1Title: string;
    step1Desc: string;
    step2Num: string;
    step2Title: string;
    step2Desc: string;
    step3Num: string;
    step3Title: string;
    step3Desc: string;
    step4Num: string;
    step4Title: string;
    step4Desc: string;
    openSourceCardBadge: string;
    openSourceCardTitle: string;
    openSourceCardDesc: string;
    inviteCardBadge: string;
    inviteCardTitle: string;
    inviteCardDesc: string;
  };
  faq: {
    sectionTag: string;
    title: string;
    subtitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
    q6: string;
    a6: string;
    q7: string;
    a7: string;
  };
  legal: {
    modalTitle: string;
    disclaimerTab: string;
    licenseTab: string;
    refundTab: string;
    termsTab: string;
    privacyTab: string;
    close: string;
  };
  footer: {
    tagline: string;
    antiRepaintDirective: string;
    marketplaceHeading: string;
    legalHeading: string;
    adminAccess: string;
    regulatoryDisclaimer: string;
    copyright: string;
    tradingViewTrademark: string;
  };
}

export const translations: Record<Language, TranslationDict> = {
  id: {
    nav: {
      home: 'Beranda',
      indicators: 'Indikator',
      bundles: 'Paket Bundle',
      howItWorks: 'Cara Pembelian',
      installationGuide: 'Panduan Instalasi',
      faq: 'FAQ',
      trackOrder: 'Cek Pesanan',
      cart: 'Keranjang',
    },
    hero: {
      tag: 'Marketplace Indikator TradingView Aemeth',
      headlinePart1: 'Analisis Lebih Terarah.',
      headlinePart2: 'Keputusan Lebih Terukur.',
      description: 'Temukan indikator TradingView Aemeth untuk membantu analisis teknikal dengan fitur, panduan, dan informasi produk yang transparan tanpa manipulasi sinyal.',
      ctaPrimary: 'Jelajahi Indikator',
      ctaSecondary: 'Cara Pembelian',
      pillar1Title: 'Pine Script v5/v6',
      pillar1Desc: 'Standar kode resmi TradingView tanpa lag eksekusi',
      pillar2Title: 'Directive Candle-1',
      pillar2Desc: 'Kalkulasi terkunci pada closed bar (Bebas Repaint)',
      pillar3Title: 'Pengiriman Transparan',
      pillar3Desc: 'Kode sumber terbuka atau otorisasi invite-only resmi',
    },
    bento: {
      sectionTag: 'Metodologi Analitis Aemeth',
      quoteTitle: 'Kami merancang indikator dengan transparansi algoritma penuh, memastikan setiap',
      quoteHighlight1: 'sinyal teknikal',
      quoteHighlight2: 'dapat dieksekusi secara terukur.',
      card1Badge: 'Arsitektur Sinyal Institusional',
      card1Title: 'Suite Likuiditas & Aliran Volume',
      card1Desc: 'Tanpa indikator lagging. Menghitung fair value gap, liquidity sweep, dan volume absorption berdasarkan data candle tertutup.',
      card1Cta: 'Lihat Detail Indikator',
      card2Title: 'Standar Eksekusi Nol-Repaint',
      card2Subtitle: 'Protokol Candle 1 Terkunci',
      card2Desc: 'Semua proyeksi matematika hanya dihitung saat candle sebelumnya telah ditutup sempurna. Tidak ada sinyal yang berpindah atau hilang.',
      card3Title: 'Transparansi Tipe Produk',
      card3Desc: 'Pilihan jelas antara kode sumber terbuka (.pine) yang dapat diedit atau indikator privat invite-only di akun TradingView Anda.',
      ecosystemTitle: 'KOMPATIBILITAS PLATFORM:',
    },
    catalog: {
      sectionTag: 'Katalog Produk',
      title: 'Koleksi Indikator TradingView Resmi',
      description: 'Pilih antara kode Pine Script terbuka untuk dipelajari/diedit atau akses skrip invite-only resmi untuk analisa langsung di chart Anda.',
      activeScriptsCount: 'Katalog Indikator Terverifikasi',
      searchPlaceholder: 'Cari indikator (contoh: Liquidity, Volume, Trend)...',
      allTypes: 'Semua Tipe Pengiriman',
      openSourceType: 'Open-Source (File .pine)',
      privateType: 'Invite-Only TradingView',
      bundleType: 'Paket Bundle (Lengkap)',
      sortNewest: 'Urutkan: Rilis Terbaru',
      sortPriceAsc: 'Harga: Termurah ke Termahal',
      sortPriceDesc: 'Harga: Termahal ke Termurah',
      allCategories: 'Semua Kategori',
      catLiquidity: 'Likuiditas & Order Block',
      catVolume: 'Volume Delta & Absorpsi',
      catTrend: 'Trend Multi-Timeframe',
      catReversal: 'Reversal & Divergensi',
      catBundle: 'Paket Suite Lengkap',
      emptyTitle: 'Tidak ada indikator yang sesuai dengan filter',
      emptyDesc: 'Coba ubah kata kunci pencarian atau reset filter kategori.',
      resetFilters: 'Reset Filter',
      viewDetails: 'Lihat Detail',
      getAccess: 'Beli Sekarang',
      lifetimeUpdates: 'Pembaruan versi gratis selamanya',
      antiRepaintLock: 'Anti-Repaint Candle 1',
    },
    productDetail: {
      openSourceBadge: 'Open-Source Pine Script v5',
      privateBadge: 'TradingView Invite-Only Resmi',
      bundleBadge: 'Paket Suite (Semua 4 Indikator)',
      technicalOverview: 'Deskripsi & Spesifikasi Teknis',
      antiRepaintDirectiveTitle: 'DIREKTIF INTI: ZERO-REPAINT CANDLE 1',
      antiRepaintDirectiveDesc: 'Setiap rumus matematis dan sinyal dikunci secara ketat pada bar tertutup (bar [1]). Sinyal tidak akan pernah bergeser atau hilang setelah penutupan candle.',
      keyFeatures: 'Fitur Utama & Spesifikasi',
      deliveryMethodTitle: 'Metode Pengiriman Produk',
      openSourceDeliveryDesc: 'Setelah pembayaran terverifikasi, file kode sumber .pine dan .txt serta penampil kode langsung terbuka di layar pesanan Anda. Anda dapat menyalin kode atau mengunduh file untuk dibuka di Pine Editor TradingView.',
      privateDeliveryDesc: 'Cukup masukkan username TradingView Anda saat checkout atau pada halaman pelacakan pesanan. Tim Aemeth akan mengotorisasi hak akses invite-only script ke akun TradingView Anda.',
      bundleDeliveryDesc: 'Paket lengkap ini mencakup seluruh 4 indikator unggulan sekaligus. Anda menerima file kode sumber untuk indikator open-source dan otorisasi invite-only untuk indikator privat.',
      riskDisclaimerTitle: 'Peringatan Risiko Perdagangan',
      riskDisclaimerDesc: 'Trading Forex, Emas (XAUUSD), Indeks, dan Kripto mengandung risiko finansial nyata. Indikator Aemeth adalah alat bantu analitis teknikal, bukan jaminan keuntungan finansial atau nasihat investasi.',
      pricingLabel: 'Pembayaran Sekali • Lisensi Selamanya',
      proceedToCheckout: 'Lanjut ke Pembayaran',
      close: 'Tutup',
    },
    checkout: {
      title: 'Checkout Pembelian Tamu (Tanpa Akun)',
      orderSummary: 'Ringkasan Pesanan',
      itemsToPurchase: 'Produk yang Dipilih',
      totalDue: 'Total Pembayaran',
      customerDetails: 'Informasi Pengiriman Digital',
      emailLabel: 'Alamat Email (Untuk Tanda Terima & Token Akses) *',
      emailPlaceholder: 'nama@domain.com',
      tvUsernameLabel: 'Username TradingView',
      tvUsernameNote: '(Diperlukan untuk produk Invite-Only)',
      tvUsernamePlaceholder: 'contoh: username_tradingview',
      paymentMethodTitle: 'Pilih Metode Pembayaran',
      bankTransfer: 'Transfer Bank',
      bankTransferDesc: 'BCA / Mandiri / Wire Transfer',
      cryptoDeposit: 'Deposit Kripto',
      cryptoDepositDesc: 'USDT (TRC20/ERC20) & Bitcoin',
      paypal: 'PayPal',
      paypalDesc: 'Kartu Debit/Kredit Internasional',
      termsAgreement: 'Saya menyetujui Ketentuan Layanan, Lisensi Produk Digital, dan memahami Peringatan Risiko Perdagangan.',
      termsLink: 'Buka Kebijakan',
      generateInvoice: 'Buat Tagihan & Instruksi Pembayaran',
      validatingServer: 'Memvalidasi Harga di Server...',
      orderReference: 'Nomor Referensi Pesanan',
      amountDue: 'Jumlah Tagihan',
      bankAccountTitle: 'Nomor Rekening Pembayaran Resmi',
      copy: 'Salin',
      copied: 'Tersalin!',
      uploadReceiptTitle: 'Unggah Bukti Transfer / Struk (Opsional)',
      confirmBankPayment: 'Konfirmasi Pembayaran & Antrekan Verifikasi',
      cryptoDestinationTitle: 'Alamat Dompet Penerima Kripto',
      cryptoTxidLabel: 'Hash Transaksi Blockchain (TXID) *',
      cryptoTxidPlaceholder: 'Tempel hash transaksi (TXID)...',
      confirmCryptoPayment: 'Kirim TXID untuk Verifikasi Node',
      orderSuccessTitle: 'Pesanan Berhasil Dibuat!',
      orderSuccessDesc: 'Pesanan Anda telah dicatat di sistem. Anda dapat memantau status pesanan dan mengakses produk digital menggunakan Token Akses aman Anda.',
      trackOrderCta: 'Buka Halaman Status & Akses Produk',
    },
    orderStatus: {
      title: 'Pelacakan Pesanan & Pengiriman Digital',
      subtitle: 'Periksa status verifikasi pembayaran dan ambil file Pine Script atau status akses TradingView Anda tanpa perlu login.',
      lookupTitle: 'Lacak Pesanan Tamu Anda',
      orderNumberPlaceholder: 'Nomor Pesanan (contoh: AEM-8931204)',
      tokenPlaceholder: 'Token Akses Pesanan Tamu (contoh: tok_...)',
      lookupButton: 'Cari Pesanan',
      searching: 'Memeriksa Sistem...',
      orderNotFound: 'Pesanan tidak ditemukan. Pastikan Nomor Pesanan dan Token Akses sudah sesuai.',
      orderFoundTitle: 'Rincian Pesanan',
      statusLabel: 'Status Pesanan',
      paymentMethodLabel: 'Metode Pembayaran',
      dateLabel: 'Tanggal Transaksi',
      customerEmailLabel: 'Email Pembeli',
      tvUsernameLabel: 'Username TradingView',
      purchasedItems: 'Produk yang Dibeli',
      statusAwaiting: 'Menunggu Pembayaran',
      statusVerifying: 'Pembayaran Sedang Diverifikasi',
      statusPaid: 'Pembayaran Terverifikasi & Lunas',
      statusCancelled: 'Dibatalkan / Bukti Tidak Sesuai',
      openSourceNotice: 'Produk Kode Sumber (.pine / .txt): Anda berhak mengunduh file kode dan menyalin kode sumber untuk dipasang di TradingView Pine Editor.',
      viewSourceCode: 'Lihat & Salin Kode Sumber Pine Script',
      downloadPine: 'Unduh File .pine',
      downloadTxt: 'Unduh File .txt',
      installationGuideButton: 'Panduan Instalasi TradingView',
      inviteNoticeTitle: 'Otorisasi Akses Tambahan:',
      inviteNoticeDesc: 'Semua produk utama dikirimkan dalam bentuk file kode sumber langsung (.pine/.txt).',
      inviteStatusGranted: 'Akses Tambahan Terdaftar',
      inviteStatusPending: 'Antrean Otorisasi: Sedang diverifikasi',
      howToLoadTitle: 'Langkah Cepat Memuat Kode di TradingView:',
      howToLoadSteps: [
        'Buka chart TradingView di browser atau aplikasi desktop.',
        'Buka tab "Pine Editor" di bagian bawah layar chart Anda.',
        'Hapus template bawaan, lalu tempel kode sumber Pine Script Aemeth yang telah disalin/diunduh.',
        'Klik tombol "Save" (simpan nama skrip) lalu klik "Add to Chart".',
      ],
      supportPrompt: 'Butuh bantuan instalasi manual atau memiliki pertanyaan terkait pesanan? Tim kami siap membantu selama jam operasional.',
      contactSupport: 'Bantuan Instalasi',
      contactWhatsApp: 'Bantuan via WhatsApp',
      contactTelegram: 'Bantuan via Telegram',
      supportHoursNotice: 'Layanan bantuan aktif pada hari kerja (Senin - Sabtu, 09:00 - 21:00 WIB). Pesan Anda akan dibalas sesuai antrean.',
    },
    installationGuide: {
      sectionTag: 'Dokumentasi Resmi',
      title: 'Panduan Instalasi Pine Script di TradingView',
      subtitle: 'Panduan lengkap langkah demi langkah memasang kode sumber indikator Aemeth ke TradingView Pine Editor dan mengatasi kendala teknis.',
      tabSteps: 'Langkah Instalasi',
      tabTroubleshooting: 'Troubleshooting & Solusi Error',
      stepsTitle: '5 Langkah Memasang Indikator ke Chart TradingView',
      step1Title: 'Buka Platform TradingView & Masuk ke Chart',
      step1Desc: 'Buka situs TradingView (tradingview.com) atau aplikasi desktop TradingView, lalu buka grafik pasangan mata uang atau aset yang ingin Anda analisis (contoh: XAUUSD atau EURUSD).',
      step2Title: 'Buka Panel Pine Editor di Bagian Bawah',
      step2Desc: 'Di bagian bawah layar grafik TradingView, klik tab "Pine Editor". Jika panel belum terbuka, klik tombol "Pine Editor" di panel navigasi bawah.',
      step3Title: 'Hapus Template Bawaan & Tempel Kode Sumber',
      step3Desc: 'Klik tombol "Open" lalu "New indicator" (atau pilih semua kode template bawaan dan hapus). Tempel (Paste) seluruh kode Pine Script v5/v6 yang Anda peroleh dari file .pine/.txt pesanan Aemeth Anda.',
      step4Title: 'Simpan Indikator (Save Script)',
      step4Desc: 'Klik tombol "Save" di bilah kanan atas panel Pine Editor. Berikan nama indikator sesuai judul produk (contoh: "Aemeth Liquidity Matrix v5.2") lalu simpan ke pustaka skrip pribadi Anda.',
      step5Title: 'Terapkan ke Grafik (Add to Chart)',
      step5Desc: 'Klik tombol "Add to chart" di sebelah tombol Save. Indikator akan langsung terkompilasi dan garis visual serta sinyal akan muncul di grafik harga Anda!',
      troubleshootTitle: 'Penyelesaian Kendala Kompilasi Umum (Compiler Errors)',
      err1Title: 'Error: Could not find compiler version (//@version=...)',
      err1Desc: 'Pesan ini muncul jika baris pertama kode terhapus atau tertimpa saat menempel kode.',
      err1Fix: 'Pastikan baris paling awal skrip Anda diawali dengan `//@version=5` persis tanpa spasi di baris pertama.',
      err2Title: 'Error: Undeclared identifier / Variable not found',
      err2Desc: 'Terjadi apabila hanya sebagian kode yang tersalin atau ada baris yang terpotong di clipboard.',
      err2Fix: 'Gunakan tombol "Unduh File .pine" atau "Unduh File .txt" dari halaman pesanan Anda, buka dengan Text Editor (Notepad/VSCode), pilih Select All (Ctrl+A), lalu tempel ulang seluruh isinya.',
      err3Title: 'Error: Maximum number of plots/lines/boxes exceeded',
      err3Desc: 'TradingView memiliki batas maksimal objek visual pada akun tertentu.',
      err3Fix: 'Seluruh skrip Aemeth telah dikonfigurasi dengan batas parameter standar. Pastikan Anda tidak menggabungkan dua skrip berbeda ke dalam satu editor.',
      err4Title: 'Indikator Tidak Muncul di Grafik Setelah Add to Chart',
      err4Desc: 'Kemungkinan skala grafik tersembunyi atau time-frame aset memerlukan beberapa bar harga untuk kalkulasi.',
      err4Fix: 'Periksa pengaturan skala sumbu kanan (klik kanan sumbu harga -> Reset Price Scale), dan pastikan Anda menggunakan timeframe 1m, 5m, 15m, 1h, atau 4h sesuai rekomendasi produk.',
      needManualHelp: 'Butuh Bantuan Instalasi Manual Langsung?',
      needManualHelpDesc: 'Jika Anda mengalami kendala saat menempelkan kode atau memerlukan panduan via layar jarak jauh, admin Aemeth siap membantu memandu Anda.',
      askOnWhatsApp: 'Hubungi Admin via WhatsApp',
      askOnTelegram: 'Hubungi Admin via Telegram',
      supportNote: 'Penting: Jangan pernah membagikan password akun TradingView atau data perbankan sensitif kepada siapa pun. Dukungan teknis hanya memandu proses instalasi kode.',
    },
    howItWorks: {
      sectionTag: 'Alur Pembelian Transparan',
      title: 'Cara Pembelian & Pengiriman Produk',
      subtitle: 'Proses sederhana dari pemilihan indikator hingga penerapan pada grafik TradingView tanpa pendaftaran akun.',
      step1Num: '01',
      step1Title: 'Pilih Indikator',
      step1Desc: 'Jelajahi katalog dan tentukan apakah Anda membutuhkan kode terbuka (.pine) atau indikator invite-only.',
      step2Num: '02',
      step2Title: 'Checkout Tamu',
      step2Desc: 'Cukup masukkan email Anda dan username TradingView (jika produk bertipe invite-only) tanpa membuat password.',
      step3Num: '03',
      step3Title: 'Verifikasi Pembayaran',
      step3Desc: 'Pilih Transfer Bank (BCA/Mandiri), PayPal, atau Kripto. Pembayaran diverifikasi oleh server atau tim otorisasi.',
      step4Num: '04',
      step4Title: 'Terima Produk Digital',
      step4Desc: 'Langsung unduh kode sumber .pine atau terima otorisasi invite-only di TradingView Anda via halaman status pesanan.',
      openSourceCardBadge: 'Metode Pengiriman: Open Source',
      openSourceCardTitle: 'Hak Kepemilikan Kode Sumber',
      openSourceCardDesc: 'Untuk indikator open-source, Anda menerima kode mentah .pine dan .txt. Anda bebas memeriksa logika algoritma, memasang alert webhook, dan mengatur parameter di Pine Editor.',
      inviteCardBadge: 'Metode Pengiriman: Invite-Only',
      inviteCardTitle: 'Otorisasi Akun TradingView',
      inviteCardDesc: 'Untuk algoritma terlindungi, akses diberikan langsung ke username TradingView Anda oleh akun penerbit resmi Aemeth tanpa kebocoran kode rahasia.',
    },
    faq: {
      sectionTag: 'Tanya Jawab',
      title: 'Pertanyaan yang Sering Diajukan',
      subtitle: 'Informasi lengkap mengenai lisensi indikator, instalasi Pine Script, dan kebijakan pengiriman.',
      q1: 'Apakah saya perlu mendaftar akun untuk membeli indikator?',
      a1: 'Tidak. Pembelian dilakukan melalui checkout tamu (guest checkout). Anda hanya perlu memasukkan email untuk tanda terima dan token akses pesanan.',
      q2: 'Bagaimana cara memasang indikator open-source di TradingView?',
      a2: 'Buka halaman status pesanan Anda dengan token akses, lalu salin kode Pine Script yang disediakan. Di TradingView, buka panel "Pine Editor" di bagian bawah, klik "New", tempel kode tersebut, lalu klik "Add to Chart".',
      q3: 'Bagaimana cara kerja indikator privat invite-only?',
      a3: 'Akses diotorisasi langsung ke username TradingView Anda oleh akun penerbit Aemeth. Setelah diotorisasi, indikator akan muncul secara otomatis di tab "Invite-Only Scripts" pada jendela Indikator TradingView Anda.',
      q4: 'Apakah indikator Aemeth mengalami repaint?',
      a4: 'Tidak. Seluruh indikator Aemeth mengikuti direktif Anti-Repaint ketat: perhitungan dan sinyal dikunci secara eksklusif pada Candle 1 (Closed Bar). Setelah candle tertutup, sinyal tidak akan bergeser atau hilang.',
      q5: 'Metode pembayaran apa saja yang didukung?',
      a5: 'Kami mendukung Transfer Bank lokal (BCA, Mandiri, dan Wire Transfer), PayPal untuk pembayaran kartu internasional, serta Kripto (USDT jaringan TRC-20 dan ERC-20, serta Bitcoin).',
      q6: 'Apakah saya mendapatkan pembaruan jika versi baru dirilis?',
      a6: 'Ya. Pembelian indikator memberikan lisensi seumur hidup untuk pembaruan versi minor dan penyempurnaan logika teknikal di seri indikator tersebut.',
      q7: 'Bagaimana kebijakan pengembalian dana (refund)?',
      a7: 'Karena sifat produk digital (file kode sumber .pine yang langsung dapat diakses atau hak akses skrip invite-only yang telah diotorisasi), semua transaksi bersifat final setelah file diunduh atau akses diberikan. Tim dukungan kami siap membantu jika ada kendala instalasi teknis.',
    },
    legal: {
      modalTitle: 'Kebijakan Hukum & Regulasi Aemeth',
      disclaimerTab: 'Peringatan Risiko',
      licenseTab: 'Lisensi Digital',
      refundTab: 'Kebijakan Refund',
      termsTab: 'Syarat & Ketentuan',
      privacyTab: 'Kebijakan Privasi',
      close: 'Tutup Kebijakan',
    },
    footer: {
      tagline: '“Precision in Every Signal.” Alat bantu analitis TradingView Pine Script dan sistem visualisasi teknikal pasar.',
      antiRepaintDirective: 'Direktif Sinyal: Bebas Repaint • Terkunci pada Candle 1 (Closed Bar)',
      marketplaceHeading: 'Marketplace',
      legalHeading: 'Legal & Kepatuhan',
      adminAccess: 'Akses Administrator',
      regulatoryDisclaimer: 'Peringatan Risiko: Perdagangan valuta asing (Forex), komoditas (Gold/XAUUSD), indeks saham, dan mata uang kripto mengandung risiko kerugian finansial yang signifikan. Indikator teknikal Aemeth dirancang murni sebagai alat analisis grafik dan bukan merupakan nasihat keuangan atau ajakan investasi.',
      copyright: '© 2026 AEMETH TRADER ANALYSIS. Seluruh Hak Cipta Dilindungi.',
      tradingViewTrademark: 'TradingView® adalah merek dagang terdaftar milik TradingView, Inc.',
    },
  },
  en: {
    nav: {
      home: 'Home',
      indicators: 'Indicators',
      bundles: 'Bundles',
      howItWorks: 'How It Works',
      installationGuide: 'Installation Guide',
      faq: 'FAQ',
      trackOrder: 'Track Order',
      cart: 'Cart',
    },
    hero: {
      tag: 'Aemeth TradingView Indicator Marketplace',
      headlinePart1: 'Analyze With Clarity.',
      headlinePart2: 'Trade With Discipline.',
      description: 'Explore Aemeth TradingView indicators with transparent product details, practical documentation, and clear delivery instructions without signal manipulation.',
      ctaPrimary: 'Explore Indicators',
      ctaSecondary: 'How It Works',
      pillar1Title: 'Pine Script v5/v6',
      pillar1Desc: 'Official TradingView code standard with zero latency',
      pillar2Title: 'Candle-1 Directive',
      pillar2Desc: 'Calculations locked to closed bar (Zero Repaint)',
      pillar3Title: 'Transparent Delivery',
      pillar3Desc: 'Open-source source code or authorized invite-only script',
    },
    bento: {
      sectionTag: 'Aemeth Analytical Methodology',
      quoteTitle: 'We engineer indicators with full algorithmic transparency, ensuring every',
      quoteHighlight1: 'technical signal',
      quoteHighlight2: 'delivers measurable, disciplined execution.',
      card1Badge: 'Institutional Signal Architecture',
      card1Title: 'Liquidity & Volume Absorption Suite',
      card1Desc: 'Zero lagging indicators. Projects real session fair value gaps, liquidity pools, and volume absorption based strictly on closed bar telemetry.',
      card1Cta: 'View Indicator Details',
      card2Title: 'Zero-Repaint Execution Standard',
      card2Subtitle: 'Locked Candle-1 Protocol',
      card2Desc: 'Every calculation is performed exclusively on the completed bar. Signals never repaint, shift, or disappear after bar close.',
      card3Title: 'Product Type Transparency',
      card3Desc: 'Clear choice between open-source editable Pine Script (.pine) and official invite-only script access on your TradingView account.',
      ecosystemTitle: 'PLATFORM COMPATIBILITY:',
    },
    catalog: {
      sectionTag: 'Product Catalog',
      title: 'Institutional TradingView Indicator Storefront',
      description: 'Choose between open-source Pine Script code to study and adapt, or official invite-only script access directly on your TradingView charts.',
      activeScriptsCount: 'Verified Indicator Catalog',
      searchPlaceholder: 'Search indicators (e.g., Liquidity, Volume, Trend)...',
      allTypes: 'All Delivery Types',
      openSourceType: 'Open-Source (.pine file)',
      privateType: 'TradingView Invite-Only',
      bundleType: 'Suite Bundle (All-In-One)',
      sortNewest: 'Sort by: Newest Releases',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      allCategories: 'All Categories',
      catLiquidity: 'Liquidity & Order Blocks',
      catVolume: 'Volume Delta & Absorption',
      catTrend: 'Multi-Timeframe Trend',
      catReversal: 'Reversal & Divergence',
      catBundle: 'Complete Suites',
      emptyTitle: 'No indicators match your filter',
      emptyDesc: 'Try adjusting your search query or reset category filters.',
      resetFilters: 'Reset Filters',
      viewDetails: 'View Details',
      getAccess: 'Buy Now',
      lifetimeUpdates: 'Lifetime minor updates included',
      antiRepaintLock: 'Anti-Repaint Candle 1',
    },
    productDetail: {
      openSourceBadge: 'Open-Source Pine Script v5',
      privateBadge: 'TradingView Invite-Only Access',
      bundleBadge: 'Suite Bundle (All 4 Included)',
      technicalOverview: 'Technical Specifications & Overview',
      antiRepaintDirectiveTitle: 'CORE DIRECTIVE: ZERO-REPAINT CANDLE 1',
      antiRepaintDirectiveDesc: 'Every formula and signal is anchored strictly to closed historical bars (bar [1]). Signals will never repaint, shift, or disappear once the bar closes.',
      keyFeatures: 'Key Features & Capabilities',
      deliveryMethodTitle: 'How Product Delivery Works',
      openSourceDeliveryDesc: 'Following verified payment, uncompiled .pine and .txt source files together with an instant code viewer unlock immediately on your order status page. You can copy the code directly or download the file into TradingView Pine Editor.',
      privateDeliveryDesc: 'Simply provide your TradingView username during guest checkout or on your order tracking page. The Aemeth publisher account will authorize script access directly to your TradingView account.',
      bundleDeliveryDesc: 'This comprehensive suite provisions all 4 flagship indicators simultaneously. You receive full open-source Pine Script files for open components and invite-only authorization for protected scripts.',
      riskDisclaimerTitle: 'Regulatory Risk Disclosure',
      riskDisclaimerDesc: 'Trading Forex, Gold (XAUUSD), Indices, and Cryptocurrencies carries substantial financial risk. Aemeth indicators are technical analytical visualization tools and do not constitute financial advice or profit guarantees.',
      pricingLabel: 'One-Time Payment • Lifetime Access',
      proceedToCheckout: 'Proceed to Checkout',
      close: 'Close',
    },
    checkout: {
      title: 'Guest Checkout (No Account Required)',
      orderSummary: 'Order Summary',
      itemsToPurchase: 'Selected Indicators',
      totalDue: 'Total Due',
      customerDetails: 'Digital Delivery Details',
      emailLabel: 'Email Address (For Receipt & Order Access Token) *',
      emailPlaceholder: 'name@domain.com',
      tvUsernameLabel: 'TradingView Username',
      tvUsernameNote: '(Required for Invite-Only scripts)',
      tvUsernamePlaceholder: 'e.g., your_tv_username',
      paymentMethodTitle: 'Select Payment Method',
      bankTransfer: 'Bank Transfer',
      bankTransferDesc: 'BCA / Mandiri / Wire Transfer',
      cryptoDeposit: 'Crypto Deposit',
      cryptoDepositDesc: 'USDT (TRC20/ERC20) & Bitcoin',
      paypal: 'PayPal',
      paypalDesc: 'Worldwide Credit / Debit Cards',
      termsAgreement: 'I accept the Terms of Service, Digital Product License, and understand the Trading Risk Disclosure.',
      termsLink: 'View Policies',
      generateInvoice: 'Generate Invoice & Payment Instructions',
      validatingServer: 'Validating Prices on Server...',
      orderReference: 'Order Reference Number',
      amountDue: 'Amount Due',
      bankAccountTitle: 'Official Bank Account Details',
      copy: 'Copy',
      copied: 'Copied!',
      uploadReceiptTitle: 'Upload Transfer Receipt / Proof (Optional)',
      confirmBankPayment: 'Confirm Transfer & Queue Verification',
      cryptoDestinationTitle: 'Crypto Destination Wallet Address',
      cryptoTxidLabel: 'Blockchain Transaction Hash (TXID) *',
      cryptoTxidPlaceholder: 'Paste transaction hash (TXID)...',
      confirmCryptoPayment: 'Submit TXID for Node Verification',
      orderSuccessTitle: 'Order Created Successfully!',
      orderSuccessDesc: 'Your order has been recorded. You can monitor your payment status and access your digital indicators using your secure Guest Access Token.',
      trackOrderCta: 'View Order Status & Access Products',
    },
    orderStatus: {
      title: 'Guest Order Status & Digital Delivery',
      subtitle: 'Check payment verification status and access your Pine Script source files or TradingView invite status without creating an account.',
      lookupTitle: 'Look Up Your Guest Order',
      orderNumberPlaceholder: 'Order Reference (e.g., AEM-8931204)',
      tokenPlaceholder: 'Guest Access Token (e.g., tok_...)',
      lookupButton: 'Look Up Order',
      searching: 'Verifying System Records...',
      orderNotFound: 'Order not found. Please verify your Order Reference Number and Access Token.',
      orderFoundTitle: 'Order Details',
      statusLabel: 'Order Status',
      paymentMethodLabel: 'Payment Method',
      dateLabel: 'Order Date',
      customerEmailLabel: 'Customer Email',
      tvUsernameLabel: 'TradingView Username',
      purchasedItems: 'Purchased Indicators',
      statusAwaiting: 'Awaiting Payment',
      statusVerifying: 'Payment Under Review',
      statusPaid: 'Payment Verified & Delivered',
      statusCancelled: 'Cancelled / Invalid Proof',
      openSourceNotice: 'Source Code Product (.pine / .txt): You are licensed to download the source files and copy the code to install inside TradingView Pine Editor.',
      viewSourceCode: 'View & Copy Pine Script Source Code',
      downloadPine: 'Download .pine File',
      downloadTxt: 'Download .txt File',
      installationGuideButton: 'TradingView Installation Guide',
      inviteNoticeTitle: 'Additional Script Access:',
      inviteNoticeDesc: 'All primary products are delivered as raw, verifiable Pine Script source code (.pine/.txt).',
      inviteStatusGranted: 'Access Registered',
      inviteStatusPending: 'Verification Queue: Processing',
      howToLoadTitle: 'Quick Steps to Load Script in TradingView:',
      howToLoadSteps: [
        'Open any TradingView chart in your browser or desktop app.',
        'Click the "Pine Editor" tab at the bottom of the chart screen.',
        'Clear any default template code and paste the Aemeth source code you copied or downloaded.',
        'Click the "Save" button to name the script, then click "Add to chart".',
      ],
      supportPrompt: 'Need manual installation assistance or have questions regarding your order? Our team is available during operating hours.',
      contactSupport: 'Installation Support',
      contactWhatsApp: 'Chat via WhatsApp',
      contactTelegram: 'Chat via Telegram',
      supportHoursNotice: 'Support operates Monday through Saturday, 09:00 - 21:00 WIB (UTC+7). Inquiries are answered in queue order.',
    },
    installationGuide: {
      sectionTag: 'Official Documentation',
      title: 'TradingView Pine Script Installation Guide',
      subtitle: 'Complete step-by-step walkthrough for installing Aemeth indicator source code into TradingView Pine Editor and resolving common compiler issues.',
      tabSteps: 'Installation Steps',
      tabTroubleshooting: 'Troubleshooting & Compiler Errors',
      stepsTitle: '5 Simple Steps to Add Indicators to Your TradingView Chart',
      step1Title: 'Open TradingView Platform & Load Your Chart',
      step1Desc: 'Open tradingview.com in your browser or launch the desktop application, then open any market chart (e.g. XAUUSD or EURUSD).',
      step2Title: 'Open the Pine Editor Panel at the Bottom',
      step2Desc: 'Look at the bottom toolbar of your chart and click on the "Pine Editor" tab. If the panel is minimized, clicking it will expand the editor window.',
      step3Title: 'Clear Default Template & Paste Aemeth Source Code',
      step3Desc: 'Click "Open" -> "New indicator" (or select all default code and delete it). Paste the complete Pine Script v5/v6 source code obtained from your Aemeth order (.pine or .txt file).',
      step4Title: 'Save Script to Your Personal Library',
      step4Desc: 'Click the "Save" button on the top right of the Pine Editor. Give it a descriptive name matching your purchased indicator (e.g. "Aemeth Liquidity Matrix v5.2") and confirm.',
      step5Title: 'Add Script to Your Chart (Add to Chart)',
      step5Desc: 'Click the "Add to chart" button next to Save. The Pine Script compiler will immediately process the code, and visual zones, order blocks, and signals will render on your price bars!',
      troubleshootTitle: 'Common Compilation Errors & Resolutions',
      err1Title: 'Error: Could not find compiler version (//@version=...)',
      err1Desc: 'This occurs if the first line was accidentally deleted or overwritten when pasting.',
      err1Fix: 'Ensure the very first line of the editor reads `//@version=5` without any spaces or blank lines before it.',
      err2Title: 'Error: Undeclared identifier / Variable not found',
      err2Desc: 'Happens if the clipboard truncated the code or only a partial snippet was pasted.',
      err2Fix: 'Use the "Download .pine" or "Download .txt" button from your order status page, open it in a text editor (Notepad/VSCode), select all (Ctrl+A / Cmd+A), and re-paste the full code.',
      err3Title: 'Error: Maximum number of plots/lines/boxes exceeded',
      err3Desc: 'TradingView enforces strict graphic resource limits per script.',
      err3Fix: 'All Aemeth scripts are balanced within standard limits. Do not accidentally append two different scripts into the same editor window.',
      err4Title: 'Indicator Does Not Appear on Price Chart After Adding',
      err4Desc: 'The price scale may be shifted, or the algorithm may require closed price bars on the selected timeframe.',
      err4Fix: 'Right-click the right-hand price axis and select "Reset price scale". Make sure you are viewing a supported timeframe (1m, 5m, 15m, 1h, 4h) recommended in the indicator documentation.',
      needManualHelp: 'Need Personal Installation Assistance?',
      needManualHelpDesc: 'If you encounter any difficulty pasting or configuring your script, an Aemeth technical specialist is happy to walk you through it.',
      askOnWhatsApp: 'Contact via WhatsApp',
      askOnTelegram: 'Contact via Telegram',
      supportNote: 'Important: Never share your TradingView account passwords or financial credentials with anyone. Support only assists with Pine Script pasting and installation.',
    },
    howItWorks: {
      sectionTag: 'Transparent Fulfillment Workflow',
      title: 'How Purchasing & Delivery Work',
      subtitle: 'A straightforward process from indicator selection to TradingView execution without forced registration.',
      step1Num: '01',
      step1Title: 'Select Indicator',
      step1Desc: 'Browse the catalog and choose between uncompiled open-source code (.pine) or invite-only script access.',
      step2Num: '02',
      step2Title: 'Guest Checkout',
      step2Desc: 'Simply provide your email and TradingView username (for invite-only scripts) without setting a password.',
      step3Num: '03',
      step3Title: 'Payment Verification',
      step3Desc: 'Pay via Bank Transfer (BCA/Mandiri), PayPal, or Crypto. Payments are verified on the server or by authorized review.',
      step4Num: '04',
      step4Title: 'Digital Product Delivery',
      step4Desc: 'Download the .pine source code or receive invite-only access directly on TradingView via your order tracking page.',
      openSourceCardBadge: 'Delivery Method: Open Source',
      openSourceCardTitle: 'Full Source Code Ownership',
      openSourceCardDesc: 'For open-source products, you receive raw .pine and .txt source files. Inspect formulas, attach webhook alerts, and adjust parameters inside the TradingView Pine Editor.',
      inviteCardBadge: 'Delivery Method: Invite-Only',
      inviteCardTitle: 'Direct TradingView Account Authorization',
      inviteCardDesc: 'For proprietary algorithms, access is authorized directly to your TradingView username by the official Aemeth publisher account without source code leakage.',
    },
    faq: {
      sectionTag: 'FAQ',
      title: 'Frequently Asked Questions',
      subtitle: 'Transparent answers regarding indicator licensing, Pine Script installation, and delivery policies.',
      q1: 'Do I need an account to buy an indicator?',
      a1: 'No. Purchases are completed via guest checkout. You only provide an email address for your transaction receipt and secure order access token.',
      q2: 'How do I install an open-source Pine Script indicator in TradingView?',
      a2: 'Open your order status page using your access token, then copy the provided Pine Script code. In TradingView, open the "Pine Editor" panel at the bottom, click "New", paste the code, and click "Add to Chart".',
      q3: 'How do private invite-only indicators work?',
      a3: 'Access is authorized directly to your TradingView username by the Aemeth publisher account. Once authorized, the indicator appears under the "Invite-Only Scripts" tab in your TradingView Indicators dialog.',
      q4: 'Do Aemeth indicators repaint historical bars?',
      a4: 'No. All Aemeth indicators follow a strict Anti-Repaint Directive: calculations and signals lock exclusively to Candle 1 (Closed Bar). Once a bar closes, signals will never shift or disappear.',
      q5: 'What payment methods are supported?',
      a5: 'We support local Bank Transfers (BCA, Mandiri, and Wire Transfer), PayPal for international card payments, and Crypto Deposits (USDT on TRC-20 and ERC-20, plus Bitcoin).',
      q6: 'Do I get updates when new versions are released?',
      a6: 'Yes. Purchases include lifetime minor updates and technical algorithm refinements within that indicator series at no additional charge.',
      q7: 'What is your refund policy?',
      a7: 'Due to the non-returnable digital nature of downloadable Pine Script source code and invite-only script authorizations, all transactions are final once files are accessed or access has been granted. Our technical team is available to resolve any setup issues.',
    },
    legal: {
      modalTitle: 'Aemeth Legal & Regulatory Policies',
      disclaimerTab: 'Risk Disclaimer',
      licenseTab: 'Digital License',
      refundTab: 'Refund Policy',
      termsTab: 'Terms of Service',
      privacyTab: 'Privacy Policy',
      close: 'Close Policy',
    },
    footer: {
      tagline: '“Precision in Every Signal.” TradingView Pine Script technical indicators and market structure visualization tools.',
      antiRepaintDirective: 'Signal Directive: Zero Repaint • Locked to Candle 1 (Closed Bar)',
      marketplaceHeading: 'Marketplace',
      legalHeading: 'Legal & Compliance',
      adminAccess: 'Administrator Access',
      regulatoryDisclaimer: 'Risk Disclaimer: Trading foreign exchange (Forex), commodities (Gold/XAUUSD), stock indices, and cryptocurrencies carries a significant risk of financial loss. Aemeth indicators are technical chart visualization tools and do not constitute financial advice or investment recommendations.',
      copyright: '© 2026 AEMETH TRADER ANALYSIS. All Rights Reserved.',
      tradingViewTrademark: 'TradingView® is a registered trademark of TradingView, Inc.',
    },
  },
};
