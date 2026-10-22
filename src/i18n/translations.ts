export type Language = 'id' | 'en';

export interface TranslationDict {
  nav: {
    home: string;
    indicators: string;
    bundles: string;
    howItWorks: string;
    faq: string;
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
    inviteNoticeTitle: string;
    inviteNoticeDesc: string;
    inviteStatusGranted: string;
    inviteStatusPending: string;
    howToLoadTitle: string;
    howToLoadSteps: string[];
    supportPrompt: string;
    contactSupport: string;
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
      openSourceNotice: 'Produk Open-Source: Anda berhak mengunduh file .pine dan menyalin kode sumber di bawah ini.',
      viewSourceCode: 'Lihat & Salin Kode Pine Script',
      downloadPine: 'Unduh File .pine',
      inviteNoticeTitle: 'Status Otorisasi Invite-Only TradingView:',
      inviteNoticeDesc: 'Akses langsung diberikan ke username TradingView Anda oleh penerbit Aemeth.',
      inviteStatusGranted: 'Akses Telah Diberikan di Akun TradingView Anda',
      inviteStatusPending: 'Antrean Otorisasi: Sedang diproses oleh Penerbit Aemeth',
      howToLoadTitle: 'Cara memuat indikator di TradingView setelah disetujui:',
      howToLoadSteps: [
        'Buka chart TradingView di browser atau aplikasi desktop.',
        'Klik tombol Indikator (Indicators, Metrics & Strategies) di toolbar atas.',
        'Pilih tab "Invite-Only Scripts" di bilah sebelah kiri.',
        'Klik indikator Aemeth Anda untuk langsung menerapkannya pada grafik.',
      ],
      supportPrompt: 'Butuh bantuan dengan pesanan Anda? Hubungi tim dukungan teknis kami dengan menyertakan Nomor Referensi Pesanan Anda.',
      contactSupport: 'Hubungi Bantuan Teknis',
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
      openSourceNotice: 'Open-Source Product: You are licensed to download the .pine file and copy the raw source code below.',
      viewSourceCode: 'View & Copy Pine Script',
      downloadPine: 'Download .pine File',
      inviteNoticeTitle: 'TradingView Invite-Only Authorization Status:',
      inviteNoticeDesc: 'Direct script access is provisioned to your TradingView username by Aemeth publisher.',
      inviteStatusGranted: 'Access Granted on Your TradingView Account',
      inviteStatusPending: 'Authorization Queued: Being processed by Aemeth Publisher',
      howToLoadTitle: 'How to load the indicator in TradingView once approved:',
      howToLoadSteps: [
        'Open any TradingView chart in your browser or desktop application.',
        'Click the "Indicators" button on the top toolbar.',
        'Select the "Invite-Only Scripts" tab in the left panel.',
        'Click your approved Aemeth indicator to apply it to your chart.',
      ],
      supportPrompt: 'Need assistance with your order? Contact our technical desk quoting your Order Reference Number.',
      contactSupport: 'Contact Technical Support',
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
