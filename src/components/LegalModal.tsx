import React, { useState } from 'react';
import { X, ShieldAlert, Scale, FileCheck, RefreshCw, Lock } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface LegalModalProps {
  initialTab?: 'terms' | 'privacy' | 'refund' | 'license' | 'disclaimer';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ initialTab = 'disclaimer', onClose }) => {
  const { t, language } = useTranslation();
  const [tab, setTab] = useState(initialTab);

  const tabs = [
    { id: 'disclaimer', label: t.legal.disclaimerTab, icon: ShieldAlert },
    { id: 'license', label: t.legal.licenseTab, icon: FileCheck },
    { id: 'refund', label: t.legal.refundTab, icon: RefreshCw },
    { id: 'terms', label: t.legal.termsTab, icon: Scale },
    { id: 'privacy', label: t.legal.privacyTab, icon: Lock },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0b1120] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/40 my-6 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#070b14]">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-400" />
            <h3 className="font-heading font-bold text-white text-base">
              {t.legal.modalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-white/5 bg-[#090d16] overflow-x-auto scrollbar-none">
          {tabs.map((tabItem) => {
            const Icon = tabItem.icon;
            const isActive = tab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tabItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto text-xs text-zinc-300 leading-relaxed space-y-4">
          
          {tab === 'disclaimer' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>
                  {language === 'id' ? 'PERINGATAN RISIKO PERDAGANGAN WAJIB' : 'MANDATORY TRADING RISK DISCLAIMER'}
                </span>
              </div>
              <p>
                {language === 'id' 
                  ? 'Perdagangan Valuta Asing (Forex), Emas (XAUUSD), Indeks Saham, Komoditas, dan Aset Kripto memiliki tingkat risiko tinggi dan tidak selalu cocok bagi semua investor. Penggunaan leverage tinggi dapat menguntungkan maupun memperbesar kerugian finansial Anda.'
                  : 'Trading Foreign Exchange (Forex), Gold (XAUUSD), Indices, Commodities, and Cryptocurrencies carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you.'}
              </p>
              <p>
                <strong>{language === 'id' ? 'Bukan Nasihat Finansial:' : 'No Financial Advice:'}</strong>{' '}
                {language === 'id'
                  ? 'Indikator TradingView, skrip Pine Script, dan perangkat analitis yang disediakan oleh Aemeth Trader Analysis murni merupakan instrumen visualisasi pasar teknikal. Produk ini tidak memberikan rekomendasi investasi, nasihat keuangan, maupun sinyal eksekusi otomatis.'
                  : 'The TradingView indicators, Pine Script code, and technical analysis tools provided by Aemeth Trader Analysis are software analytical tools engineered for technical market visualization. They do not constitute personalized financial, investment, or trading advice.'}
              </p>
              <p>
                <strong>{language === 'id' ? 'Kinerja Masa Lalu:' : 'Past Performance Not Indicative:'}</strong>{' '}
                {language === 'id'
                  ? 'Hasil simulasi atau performa historis memiliki keterbatasan bawaan. Kinerja indikator di masa lalu bukan merupakan jaminan hasil di masa mendatang. Jangan pernah memperdagangkan modal yang Anda tidak mampu menanggung risikonya.'
                  : 'Hypothetical or simulated performance results have certain inherent limitations. Past performance of any indicator does not guarantee future results. You should never trade with capital you cannot afford to lose.'}
              </p>
            </div>
          )}

          {tab === 'license' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">
                {language === 'id' ? 'Perjanjian Lisensi Pengguna Tunggal' : 'Single-User Commercial License Agreement'}
              </h4>
              <p>
                {language === 'id'
                  ? 'Dengan membeli indikator dari Aemeth Trader Analysis, Anda diberikan hak lisensi pengguna tunggal non-eksklusif, tidak dapat dipindahtangankan, dan dapat dibatalkan untuk menerapkan indikator pada grafik TradingView pribadi Anda.'
                  : 'By purchasing an indicator from Aemeth Trader Analysis, you are granted a non-exclusive, non-transferable, revocable single-user license to use the indicator on your personal TradingView charts.'}
              </p>
              <p>
                <strong>{language === 'id' ? 'Larangan Redistribusi Kode Sumber:' : 'Source Code Redistribution Prohibited:'}</strong>{' '}
                {language === 'id'
                  ? 'Untuk produk open-source Pine Script, Anda berhak memodifikasi kode untuk kebutuhan trading pribadi. Anda DILARANG KERAS menjual kembali, mendistribusikan ulang, memublikasikan ke publik, atau membagikan kode sumber kepada pihak ketiga.'
                  : 'For open-source Pine Script products, you may modify the code for personal trading use. You may NOT resell, redistribute, sub-license, publish publicly, or share the source code with third parties.'}
              </p>
              <p>
                {language === 'id'
                  ? 'Hash lisensi dan tanda air pesanan disematkan ke dalam pengiriman file untuk mencegah penyalahgunaan distribusi tidak sah.'
                  : 'Watermarked order references and verification hashes are embedded into delivered files to prevent unauthorized distribution.'}
              </p>
            </div>
          )}

          {tab === 'refund' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">
                {language === 'id' ? 'Kebijakan Pengembalian Dana Produk Digital' : 'Digital Product Refund Policy'}
              </h4>
              <p>
                {language === 'id'
                  ? 'Mengingat sifat pengiriman digital instan berupa file kode sumber .pine yang tidak dapat ditarik kembali atau otorisasi hak akses skrip invite-only pada akun TradingView Anda, semua transaksi bersifat final dan tidak dapat dikembalikan (non-refundable) setelah file diunduh atau hak akses skrip diaktifkan.'
                  : 'Due to the immediate digital delivery and non-tangible nature of uncompiled Pine Script code and TradingView invite authorizations, all purchases are non-refundable once digital files have been downloaded or script access has been granted to your TradingView username.'}
              </p>
              <p>
                {language === 'id'
                  ? 'Apabila Anda mengalami kendala teknis saat memuat atau menambahkan indikator ke grafik TradingView Anda, tim bantuan teknis kami siap memandu langsung sampai berhasil.'
                  : 'If you encounter any technical difficulty installing or adding an indicator to your TradingView charts, our technical support desk will work directly with you to resolve the issue.'}
              </p>
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">
                {language === 'id' ? 'Syarat & Ketentuan Layanan' : 'Terms of Service'}
              </h4>
              <p>
                {language === 'id'
                  ? 'Dengan mengakses situs web ini dan melakukan pembelian barang digital, Anda menyetujui untuk terikat dengan Syarat Layanan ini. Anda menyatakan bahwa Anda berusia minimal 18 tahun dan cakap hukum untuk membuat perjanjian mengikat.'
                  : 'By accessing this website and purchasing digital goods, you agree to be bound by these Terms of Service. You represent that you are at least 18 years of age and legally authorized to enter into binding agreements.'}
              </p>
              <p>
                {language === 'id'
                  ? 'Aemeth Trader Analysis berhak mencabut hak akses atau menonaktifkan izin invite-only TradingView jika ditemukan pelanggaran pembagian lisensi tidak sah atau klaim sengketa pembayaran palsu.'
                  : 'Aemeth Trader Analysis reserves the right to terminate access or revoke TradingView invite permissions for any user found violating single-user redistribution terms or engaging in fraudulent payment chargebacks.'}
              </p>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">
                {language === 'id' ? 'Kebijakan Privasi & Perlindungan Data' : 'Privacy & Data Protection'}
              </h4>
              <p>
                {language === 'id'
                  ? 'Kami menghargai privasi Anda. Kami hanya mengumpulkan data yang benar-benar esensial (alamat email untuk bukti transaksi dan username TradingView untuk otorisasi skrip) murni untuk memenuhi pesanan produk Anda.'
                  : 'We value your privacy. We collect only necessary customer information (such as email and TradingView username) strictly to fulfill indicator orders and provide license management.'}
              </p>
              <p>
                {language === 'id'
                  ? 'Kami tidak pernah menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak luar. Data pembayaran sensitif diproses langsung oleh mitra transaksi terkait dan tidak pernah disimpan dalam server kami.'
                  : 'We never sell, rent, or trade your personal information to third parties. Sensitive payment credentials are processed directly by authorized payment providers and are never stored on our database servers.'}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#070b14] border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-full cursor-pointer transition-colors"
          >
            {t.legal.close}
          </button>
        </div>

      </div>
    </div>
  );
};
