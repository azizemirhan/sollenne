/**
 * Dönem bazlı hızlı rapor içerikleri
 */

interface PeriodReport {
  title: string;
  content: string;
}

const REPORTS: Record<string, PeriodReport> = {
  "2026-01": {
    title: "Ocak 2026 Satın Alma Stratejik Değerlendirme Raporu",
    content: `Ocak 2026 Dönemi Satın Alma Veri Analizi ve Stratejik Değerlendirme Raporu

1. Yönetici Özeti (Executive Summary)

Ocak 2026 dönemi satın alma faaliyetleri, işletmenin hammadde arz güvenliğini sağlama ve operasyonel maliyet disiplinini koruma açısından kritik bir eşiği temsil etmektedir. Bu rapor, tedarik zinciri süreçlerinin sadece bir muhasebe kaydı değil, stratejik bir finansal kaldıraç olarak yönetilmesi gerektiğini vurgulayan veri odaklı bir analiz sunmaktadır. Mevcut veriler, satın alma departmanının üretim sürekliliği için agresif bir hammadde stoklaması yaptığını, ancak bu süreçte tedarikçi konsantrasyonu ve envanter kodlama disiplini noktalarında ciddi riskler üstlendiğini göstermektedir.

Ocak 2026 döneminde gerçekleştirilen toplam 4.850.499,07 ₺ tutarındaki harcama, büyük oranda panel grubu ("Sunta & MDF") yatırımlarından oluşmaktadır. Toplam harcamanın %60'ından fazlasının yalnızca Ateş Grup ve 5K Yüzey Teknolojileri üzerinde toplanması, tedarik zinciri sürdürülebilirliği açısından "tek kaynak" (single source) riskini gündeme getirmektedir. Ayrıca, ay sonundaki aşırı alım yoğunluğu, lojistik ve kalite kontrol birimleri üzerinde operasyonel bir baskı oluşturmuştur.

Bu genel bakışın ardından, operasyonun sayısal anatomisini ortaya koymak adına temel performans metrikleri detaylandırılmıştır.

2. Temel Performans Metrikleri ve Operasyonel Hacim

Satın alma operasyonunun finansal büyüklüğü, işletme sermayesinin ne kadarının stoklara ve tedarikçilere bağlandığını gösteren en temel göstergedir. İşlem hacmi ile birim maliyetler arasındaki asimetri, departmanın idari yükü ile stratejik odak noktaları arasındaki dengesizliği kanıtlamaktadır.

Ocak 2026 dönemine ait kesin metrikler aşağıdadır:

Metrik                          Değer
Toplam Harcama Tutarı (₺)       4.850.499,07 ₺
İşlem Hacmi (Satır Sayısı)      280
Benzersiz Tedarikçi Sayısı      45
Benzersiz Ürün/Stok Sayısı       192
Ortalama İşlem Tutarı           17.323,21 ₺
Medyan İşlem Tutarı             1.850,00 ₺
Dönem Aralığı                   02.01.2026 – 31.01.2026

Stratejik Not: Ortalama işlem tutarı (17.323 ₺) ile medyan (1.850 ₺) arasındaki devasa uçurum, departmanın vaktinin %80'ini düşük değerli "mikro satın almalar" (vida, bant, poşet) ile harcadığını, ancak bütçenin %80'inin birkaç "makro satın alma" (MDFLAM, mekanizmalar) tarafından tüketildiğini kanıtlamaktadır. Bu durum, düşük değerli kalemler için "Konsolide Tedarik" stratejisinin aciliyetini göstermektedir.

3. Kategori Bazlı Harcama Dağılım Analizi

Harcama kategorilerinin ağırlığı, işletmenin maliyet yapısının hammadde fiyat dalgalanmalarına olan hassasiyetini belirlemektedir. Ocak ayı verileri, üretim girdi kompozisyonunun panel bazlı ürünlere olan yüksek bağımlılığını teyit etmektedir.

Kategori                              Toplam Harcama (₺)    Genel Pay (%)
Sunta & MDF - Kontra - PVC             2.970.866,54         %61,25
Hırdavat & Mekanizma & Aksam           1.025.488,12         %21,14
Cam & Ayna Grubu                       482.512,83            %9,95
Kumaş Grubu                            193.429,56            %3,99
Statik Boya & Kimya & İşçilik          164.152,02            %3,38
Fabrika Bakım & ISG                    14.050,00             %0,29

Kritik Odak Noktaları:

1. Sunta & MDF Dominasyonu: Toplam bütçenin %61'ini yutan bu kategori, işletmenin en büyük risk alanıdır. Özellikle 26 Ocak'taki 475 bin ₺'lik tekil MDFLAM alımı gibi işlemler, hammadde fiyatlarındaki %1'lik bir artışın toplam kârlılığı nasıl doğrudan tehdit edebileceğini göstermektedir.
2. Hırdavat ve Dış Kaynaklı Hizmetler: Bu kategoride "Alkan Ağaç Torna" üzerinden 06.01.2026 tarihinde yapılan 11 farklı torna işçiliği girişi, üretimde bir "parti bazlı darboğaz" yaşandığına işaret etmektedir. Hizmet alımlarının malzeme alımları içinde erimesi, maliyet şeffaflığını zorlaştırmaktadır.
3. Cam & Ayna - Tek Kaynak Riski: Bu kategorideki harcamanın tamamına yakını Karataş Ayna üzerinden gerçekleşmiştir. Bu durum, tedarikçide yaşanabilecek bir aksamanın üretimi doğrudan durdurabileceği bir "Single Source" (Tek Kaynak) riskidir.

4. Tedarikçi Konsantrasyonu ve Risk Analizi

Tedarikçi bağımlılığı, satın alma gücünün mü yoksa tedarikçi insiyatifinin mi devrede olduğunu belirler. Ocak ayı verileri, pazar gücünün tedarikçiler lehine yoğunlaştığını göstermektedir.

Tedarikçi İsmi                    Toplam Tutar (₺)    Pay (%)
Ateş Grup Orman Ürünleri         1.598.710,88        %32,96
5K Yüzey Teknolojileri           830.914,00          %17,13
Karataş Ayna Krst. Cam           482.512,83          %9,95
Altın Büro Dayanıklı Tüketim     214.650,00          %4,43
Eksen CNC Ahşap Tasarım          164.000,00          %3,38
Yavuz Boya Ticaret               133.562,33          %2,75
Kasalar Kalıp Mobilya            133.000,00          %2,74
Bilgin Demir Çelik A.Ş.          128.508,22          %2,65
Yavuz Sünger A.Ş.                115.424,00          %2,38
Merve Orman Ürünleri             113.400,00          %2,34

Yoğunlaşma Analizi ve Stratejik Risk Notu: İlk 3 tedarikçinin (Ateş Grup, 5K Yüzey, Karataş Ayna) kümülatif payı %60,04'tür. Panel grubunda Ateş Grup ve 5K Yüzey'e olan kümülatif bağımlılık ise bütçenin yarısını aşmaktadır. Bu durum, piyasa dalgalanmalarına karşı işletmeyi savunmasız bırakmaktadır. Acilen bir "Çerçeve Sözleşme" (Frame Agreement) modeliyle fiyat sabitleme ve alternatif tedarikçi geliştirme (Third-party sourcing) süreçleri başlatılmalıdır.

5. Zamansal Harcama Trendleri ve Yoğunluk Takvimi

Satın alma işlemlerinin ay içindeki dağılımı, nakit akışı ve depo kabul verimliliği açısından incelenmiştir.

• Pik Noktaları (Stratejik Stoklanma): 26.01.2026 (475.023 ₺) ve 28.01.2026 (457.744 ₺) tarihlerindeki devasa MDFLAM alımları, ay sonu yığılmasının temel nedenidir.
• Alım Yoğunluğu Analizi: Harcamaların %45'inden fazlası ayın son 5 iş gününe sıkışmıştır. Bu durum, "Just-in-Time" (Tam Zamanında) prensibinden uzaklaşıldığını veya beklenen bir fiyat artışına karşı "Pre-emptive Buy" (Önleyici Alım) yapıldığını kanıtlamaktadır. Eğer bu bir planlı stoklama değilse, finansal maliyeti yüksek bir plansızlık göstergesidir.

6. Anomali Tespiti ve Kritik Dikkat Noktaları

Veri setindeki düzensizlikler, işletmenin denetim ve envanter yönetim disiplinindeki zayıflıkları ortaya koymaktadır.

Yüksek Değerli İşlemler:
Tarih        Tedarikçi           Ürün                        Tutar (₺)
26.01.2026   Ateş Grup          MDFLAM 18MM Çöl Beji         475.023,52
28.01.2026   5K Yüzey Tekn.     MDFLAM 18MM Lamiart         457.744,00
12.01.2026   Altın Büro         Yarasa Mekanizma Sinkron     214.650,00
19.01.2026   Eksen CNC          River Toplantı Masası       146.000,00
16.01.2026   Kasalar Kalıp      Carbon Koltuk Kolu Takımı   133.000,00

Kritik Yönetimsel Zafiyet: "MUHTELİF" Kodlama Krizi — Karataş Ayna verilerinde görülen "MUHTELİF AYNA" (MHT0000011) kodlu işlemler, birim fiyatların 495 ₺ ile 1.690 ₺ arasında kontrolsüzce değişmesine neden olmaktadır. Bu durum, stok kartı disiplininin çöktüğünü kanıtlamaktadır. "MUHTELİF" kodu kullanımı; fiyat benchmarking (kıyaslama) yapılmasını engeller, gizli fiyat artışlarını saklar ve dijital denetim mekanizmalarını devre dışı bırakır. Yüksek hacimli ürünlerde bu kodlama biçimi bir yönetim hatasıdır.

7. Stratejik Bulgular ve Aksiyon Önerileri

Stratejik Bulgular:

• Aşırı Bağımlılık: Harcamaların %50'si yalnızca iki tedarikçide (Ateş ve 5K) kilitlenmiştir.
• Envanter Körlüğü: "Muhtelif" kodlu harcamalar maliyet analizini imkansız kılmaktadır.
• Operasyonel Verimsizlik: 280 işlemin yarısından fazlası toplam bütçenin %5'ini bile oluşturmayan düşük değerli kalemlerdir; bu da satın alma departmanını operasyonel bir bataklığa sürüklemektedir.

Aksiyon Önerileri:

1. SKU Standardizasyonu: "Muhtelif" stok kodları derhal kapatılmalı; her cam ve ayna ölçüsü için benzersiz stok kartı açılarak fiyat dalgalanmaları sistem üzerinden izlenmelidir.
2. Stratejik Kaynak Planlaması: Panel grubu için Ateş Grup dışındaki üçüncü bir ana tedarikçiyle hacim taahhütlü "Yıllık Çerçeve Sözleşme" imzalanarak fiyat istikrarı sağlanmalıdır.
3. Konsolide Tedarik ve C-Sınıfı Ürün Yönetimi: Hırdavat ve kırtasiye gibi düşük değerli (C-Sınıfı) ürünler için aylık toplu alım veya otomata dayalı tedarik modeline geçilerek işlem hacmi (ve idari maliyet) %40 oranında azaltılmalıdır.

Ocak 2026 satın alma faaliyetleri, finansal açıdan yüksek hacimli ancak operasyonel açıdan riskli bir tablo çizmektedir. Yukarıdaki aksiyonların ivedilikle alınması, işletmenin kâr marjlarını korumak adına zorunludur.`,
  },

  "2026-03": {
    title: "Mart 2026 Satın Alma Stratejik Değerlendirme Raporu",
    content: `Mart 2026 Dönemi Satın Alma ve Malzeme Giriş Verilerinin Detaylı Finansal ve Operasyonel Analizi

Toplam 407 farklı kalemde gerçekleşen işlemlerin analizine göre, şirketin bu ayki satın alma stratejisinde hammadde (MDF/Sunta, Kumaş) ve makine yatırımı/bakımı kalemleri öne çıkmaktadır.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 GENEL HARCAMA TRENDLERİ VE MALİYET MERKEZLERİ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mart ayı içerisinde bütçenin en büyük kısmını Ahşap Grubu (Sunta, MDF, PVC), Tekstil (Kumaş, Deri) ve Makine Bakım/Yatırım kalemleri oluşturmaktadır.

Öne Çıkan Ana Kategoriler:

Orman Ürünleri (MDF/Sunta/Kontra):
En yüksek hacimli satın almalar bu grupta yapılmıştır. Özellikle proje bazlı veya seri üretim için yüksek miktarda "MDFLAM Çöl Beji" alımı dikkat çekmektedir.

Makine Bakım & Onarım:
Fabrika genel makine bakımları kapsamında özellikle Lazer CNC hattı için yapılan tekil ve büyük ölçekli harcama, bu kategoriyi en yüksek maliyet merkezlerinden biri yapmıştır.

Tekstil Ürünleri (Kumaş/Döşeme):
Yüksek metrajlı suni deri ve muhtelif kumaş alımları, döşemeli ürün gruplarında ciddi bir üretim hacmine işaret etmektedir.

Ambalaj Grubu:
Sevk edilecek ürünlerin güvenliği için çok yüksek miktarlarda özel ebatlı baskılı levha, köşe karton ve gripin naylon alımı yapılmıştır.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 EN YÜKSEK MALİYETLİ TEDARİKÇİLER (İLK 5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tedarikçi Adı                          Tedarik Edilen Ana Ürün Grubu
ATEŞ GRUP ORMAN ÜRÜNLERİ A.Ş.         Ham MDF, MDFLAM, Sunta
BODOR LASER TURKEY TİC.LTD.ŞTİ.       CNC Lazer Bakım / Makine Gideri
EK AMBALAJ GIDA SAN. TİC.LTD.ŞTİ.     Karton Levha, Kutu, Köşe Kartonu
PALA SUNİ DERİCİLİK SAN.LTD.ŞTİ.      Suni Deri (Günder Toskano) ve Kumaş
BAŞKENT AY AMBALAJ SAN.TİC.LTD.ŞTİ.   Baskılı/Baskısız Gripin Naylon

Not: Karataş Ayna ve Armada Orman Ürünleri de sırasıyla cam/ayna grubu ve PVC kenar bandı alımlarında yüksek hacimle bu listeyi takip etmektedir.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 EN YÜKSEK TUTARLI TEKİL SATIN ALMA KALEMLERİ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MDFLAM 2100x2800x18MM Çöl Beji (Yıldız VT_824)
Farklı tarihlerde toplam 767 plaka alım yapılmıştır. Bu tek kalemin toplam maliyeti yaklaşık 1.369.000 TL'yi aşarak ayın en büyük hammadde gideri olmuştur.

Lazer CNC Sac Kesim Makinesi (Bakım/Sarf)
Tek kalemde 467.500 TL tutarında faturalandırılmıştır.

Günder Toskano (Suni Deri/Kumaş)
Metraj bazında en çok alınan kumaştır. Ay sonuna doğru yapılan tek bir 2.029 metrelik alımın tutarı 374.350 TL'dir.

Baskılı / Baskısız Gripin Naylon Kağıtlı
Ambalaj standartları gereği yüksek tonajlı alım yapılmış olup toplam maliyeti 190.000 TL bandını geçmiştir.

Mercura 10mm Füme Rodajlı Temperli Cam (Çalışma & Toplantı Masası)
Proje veya özel seri üretimi için alınan bu camların toplam maliyeti 165.000 TL'dir.

Ofis Koltuk Ayakları (Manager / Elegant Krom Yıldız)
Kuzey Makina'dan alınan ofis sandalyesi/koltuğu alt takımları toplam 175.500 TL tutmuştur.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 OPERASYONEL ÇIKTILAR VE OPTİMİZASYON FIRSATLARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sipariş Sıklığı:
Hırdavat, elektrik ve boya (Yavuz Boya, Tamer Elektrik vb.) gruplarında ay içinde çok sık ve parçalı alımlar yapılmaktadır. Bu gruplarda aylık veya çeyreklik toplu alım sözleşmeleri yapılarak birim maliyetlerde avantaj sağlanabilir.

Ambalaj Standardizasyonu:
Kutu ve karton ambalajlarda "Ek Ambalaj", naylon grubunda "Başkent Ay" ile konsolide çalışıldığı görülüyor. Yüksek hacimli alımlar (Örn: 22.000 adetlik 3CM/9CM köşe kartonları) sipariş planlamasının doğru yapıldığını gösteriyor.

Fason ve İşçilik Yönetimi:
Toz boya işçiliğinin ağırlıklı olarak (Boyarsan) dışarıda yaptırıldığı görülüyor. Fason boya faturalarının sıklığı göz önüne alındığında, uzun vadede şirket içi bir boyahane hattının ROI (Yatırım Getirisi) hesaplaması masaya yatırılabilir.`,
  },
};

/** Aktif döneme göre rapor başlığı döndürür */
export function getQuickReportTitle(period: string): string {
  return REPORTS[period]?.title ?? REPORTS["2026-01"].title;
}

/** Aktif döneme göre rapor içeriği döndürür */
export function getQuickReportContent(period: string): string {
  return REPORTS[period]?.content ?? REPORTS["2026-01"].content;
}

// Geriye dönük uyumluluk
export const QUICK_REPORT_TITLE = REPORTS["2026-01"].title;
export const QUICK_REPORT_CONTENT = REPORTS["2026-01"].content;
