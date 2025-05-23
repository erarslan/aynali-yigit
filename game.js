//Temel değişkenler
const cn = document.getElementById("gameCanvas");
const ctx = cn.getContext("2d");
const levelNumberElement = document.getElementById("level-number");
const musicStatusElement = document.getElementById("music-status");

//Müzik değişkenleri
//Arkaplan müziği
const muzik = new Audio(
  "assets/Daft Punk - Horizon (Japan CD) (Official Audio).mp3"
);
muzik.loop = true;
muzik.volume = 0.2;
let muzikAcik = true;

//İlerleme sesi
const ilerlemeSesi = new Audio("assets/progress.wav");
ilerlemeSesi.volume = 0.6;
let ilerlemeSesiCaliniyor = false;

//Seviye tamamlama sesi
const levelUpSesi = new Audio("assets/levelup.mp3");
levelUpSesi.volume = 0.7;

//Final sesi
const finalSesi = new Audio("assets/final.mp3");
finalSesi.volume = 0.7;
let finalSesiCalindiMi = false;

//Herhangi bir tuşa basınca müziği başlatma
document.addEventListener("keydown", function () {
  if (muzikAcik && muzik.paused) {
    muzik.play().catch((err) => console.log("Müzik başlatılamadı: ", err));
  }
});

//Oyun sabitleri
const OYUNCU_BOYUT = 50;
const AYNA_UZUNLUK = 40;
const HEDEF_BOYUT = 50;
const OYUNCU_HIZ = 1;
const AYNA_DONUS_HIZ = 0.002;
const ISIK_KALINLIK = 3;
const ISIK_RENK = "rgba(255, 255, 0, 0.8)";
const DOLUM_HIZI = 0.003; //Her karede artış miktarı

//Derece-Radyan dönüşüm fonksiyonları
function dereceToRadyan(derece) {
  return (derece * Math.PI) / 180;
}

function radyanToDerece(radyan) {
  return (radyan * 180) / Math.PI;
}

//Tüm seviyeler
const SEVIYELER = [
  //Seviye 1
  {
    oyuncu: { x: 100, y: 300 },
    kaynak: { x: 50, y: 100, aci: 60 },
    hedef: { x: 400, y: 500 },
    engeller: [
      { x: 300, y: 200, genislik: 40, yukseklik: 200 },
      { x: 500, y: 300, genislik: 200, yukseklik: 40 },
      { x: 190, y: 400, genislik: 150, yukseklik: 30 },
    ],
    aynalar: [
      { x: 400, y: 150, uzunluk: 80, aci: 30 },
      { x: 700, y: 450, uzunluk: 80, aci: -60 },
    ],
  },
  //Seviye 2
  {
    oyuncu: { x: 100, y: 100 },
    kaynak: { x: 50, y: 500, aci: 30 },
    hedef: { x: 700, y: 100 },
    engeller: [
      { x: 200, y: 200, genislik: 400, yukseklik: 30 },
      { x: 300, y: 400, genislik: 30, yukseklik: 150 },
    ],
    aynalar: [
      { x: 350, y: 250, uzunluk: 80, aci: -10 },
      { x: 600, y: 500, uzunluk: 80, aci: -15 },
    ],
  },
  //Seviye 3
  {
    oyuncu: { x: 400, y: 300 },
    kaynak: { x: 100, y: 100, aci: 0 },
    hedef: { x: 700, y: 500 },
    engeller: [
      { x: 400, y: 200, genislik: 400, yukseklik: 30 },
      { x: 350, y: 400, genislik: 30, yukseklik: 200 },
      { x: 500, y: 350, genislik: 30, yukseklik: 250 },
    ],
    aynalar: [
      { x: 300, y: 150, uzunluk: 80, aci: 120 },
      { x: 450, y: 400, uzunluk: 80, aci: 10 },
      { x: 540, y: 250, uzunluk: 80, aci: 10 },
    ],
  },
  //Seviye 4
  {
    oyuncu: { x: 100, y: 400 },
    kaynak: { x: 50, y: 50, aci: 45 },
    hedef: { x: 740, y: 400 },
    engeller: [
      { x: 150, y: 50, genislik: 30, yukseklik: 200 },
      { x: 400, y: 0, genislik: 30, yukseklik: 300 },
      { x: 450, y: 400, genislik: 200, yukseklik: 30 },
    ],
    aynalar: [
      { x: 100, y: 500, uzunluk: 80, aci: 10 },
      { x: 270, y: 50, uzunluk: 80, aci: 5 },
      { x: 300, y: 500, uzunluk: 80, aci: 10 },
      { x: 600, y: 40, uzunluk: 80, aci: 0 },
    ],
  },
  //Seviye 5
  {
    oyuncu: { x: 400, y: 300 },
    kaynak: { x: 100, y: 300, aci: 0 },
    hedef: { x: 680, y: 150 },
    engeller: [
      { x: 600, y: 50, genislik: 30, yukseklik: 350 },
      { x: 420, y: 130, genislik: 45, yukseklik: 130 },
    ],
    aynalar: [
      { x: 50, y: 100, uzunluk: 80, aci: -20 },
      { x: 350, y: 400, uzunluk: 80, aci: -10 },
      { x: 50, y: 400, uzunluk: 80, aci: 30 },
      { x: 500, y: 50, uzunluk: 80, aci: 25 },
      { x: 550, y: 550, uzunluk: 80, aci: 10 },
    ],
  },
];

//Oyun durumu
let oyunDurumu = {
  mevcut_seviye: 0,
  oyun_bitti: false,
  oyuncu: {
    x: 100,
    y: 300,
    aynaAci: 45,
    tuslar: {
      yukari: false,
      asagi: false,
      sag: false,
      sol: false,
      aynaSol: false,
      aynaSag: false,
    },
  },
  kaynak: {
    x: 50,
    y: 100,
    aci: 60,
  },
  hedef: {
    x: 400,
    y: 500,
    boyut: HEDEF_BOYUT,
    dolulukOrani: 0,
  },
  engeller: [],
  aynalar: [],
  isik: {
    isinlar: [],
  },
  oyunKazanildi: false,
  seviye_gecis_zamani: 0,
};

//Oyunu yeniden başlat
function oyunuYenidenBaslat() {
  oyunDurumu.mevcut_seviye = 0;
  oyunDurumu.oyun_bitti = false;
  oyunDurumu.oyunKazanildi = false;
  finalSesiCalindiMi = false;
  seviyeYukle(0);
}

//Seviyeyi yükle
function seviyeYukle(seviye_no) {
  console.log(seviye_no);
  if (seviye_no == SEVIYELER.length) {
    oyunDurumu.oyun_bitti = true;
    //Son seviye tamamlandığında final sesini çal
    if (!finalSesiCalindiMi) {
      finalSesi
        .play()
        .catch((err) => console.log("Final sesi çalınamadı: ", err));
      finalSesiCalindiMi = true;
    }
    return;
  }

  const seviye = SEVIYELER[seviye_no];

  //Oyuncu konumu
  oyunDurumu.oyuncu.x = seviye.oyuncu.x;
  oyunDurumu.oyuncu.y = seviye.oyuncu.y;
  oyunDurumu.oyuncu.aynaAci = 45;

  //Işık kaynağı
  oyunDurumu.kaynak.x = seviye.kaynak.x;
  oyunDurumu.kaynak.y = seviye.kaynak.y;
  oyunDurumu.kaynak.aci = seviye.kaynak.aci;

  //Hedef
  oyunDurumu.hedef.x = seviye.hedef.x;
  oyunDurumu.hedef.y = seviye.hedef.y;
  oyunDurumu.hedef.dolulukOrani = 0;

  //Engeller ve aynalar
  oyunDurumu.engeller = JSON.parse(JSON.stringify(seviye.engeller)); //Deep Copy
  oyunDurumu.aynalar = JSON.parse(JSON.stringify(seviye.aynalar)); //Deep Copy

  //Oyun durumunu sıfırla
  oyunDurumu.oyunKazanildi = false;
  oyunDurumu.isik.isinlar = [];

  //İlerleme sesini sıfırla
  ilerlemeSesiCaliniyor = false;

  updateGameInfo();
}

//İlk seviyeyi yükle
seviyeYukle(0);

//Tuş eventleri
window.addEventListener("keydown", (e) => tusBas(e.key));
window.addEventListener("keyup", (e) => tusBirak(e.key));

function tusBas(tus) {
  switch (tus.toLowerCase()) {
    case "w":
      oyunDurumu.oyuncu.tuslar.yukari = true;
      break;
    case "s":
      oyunDurumu.oyuncu.tuslar.asagi = true;
      break;
    case "a":
      oyunDurumu.oyuncu.tuslar.sol = true;
      break;
    case "d":
      oyunDurumu.oyuncu.tuslar.sag = true;
      break;
    case "arrowleft":
      oyunDurumu.oyuncu.tuslar.aynaSol = true;
      break;
    case "arrowright":
      oyunDurumu.oyuncu.tuslar.aynaSag = true;
      break;
    case "m":
      muzikKontrol();
      break;
    case "y":
      if (oyunDurumu.oyun_bitti) {
        oyunuYenidenBaslat();
      }
      break;
  }
}

function tusBirak(tus) {
  switch (tus.toLowerCase()) {
    case "w":
      oyunDurumu.oyuncu.tuslar.yukari = false;
      break;
    case "s":
      oyunDurumu.oyuncu.tuslar.asagi = false;
      break;
    case "a":
      oyunDurumu.oyuncu.tuslar.sol = false;
      break;
    case "d":
      oyunDurumu.oyuncu.tuslar.sag = false;
      break;
    case "arrowleft":
      oyunDurumu.oyuncu.tuslar.aynaSol = false;
      break;
    case "arrowright":
      oyunDurumu.oyuncu.tuslar.aynaSag = false;
      break;
  }
}

//Müzik kontrol fonksiyonu
function muzikKontrol() {
  if (muzikAcik) {
    muzik.pause();
    muzikAcik = false;
  } else {
    muzik.play();
    muzikAcik = true;
  }
  // Müzik bilgisini güncelle
  updateGameInfo();
}

//Oyun bilgilerini güncelle
function updateGameInfo() {
  //Seviye bilgisini güncelle
  levelNumberElement.textContent = `${oyunDurumu.mevcut_seviye + 1}`;
  //Müzik bilgisini güncelle
  musicStatusElement.textContent = muzikAcik ? "Açık" : "Kapalı";
}

//Oyuncunun hareketi ve çarpışma kontrolü
function oyuncuKonumGuncelle() {
  const eskiX = oyunDurumu.oyuncu.x;
  const eskiY = oyunDurumu.oyuncu.y;

  //Karakter hareketi
  if (oyunDurumu.oyuncu.tuslar.yukari) oyunDurumu.oyuncu.y -= OYUNCU_HIZ;
  if (oyunDurumu.oyuncu.tuslar.asagi) oyunDurumu.oyuncu.y += OYUNCU_HIZ;
  if (oyunDurumu.oyuncu.tuslar.sol) oyunDurumu.oyuncu.x -= OYUNCU_HIZ;
  if (oyunDurumu.oyuncu.tuslar.sag) oyunDurumu.oyuncu.x += OYUNCU_HIZ;

  //Canvas sınırları
  oyunDurumu.oyuncu.x = Math.max(
    OYUNCU_BOYUT / 2,
    Math.min(oyunDurumu.oyuncu.x, cn.width - OYUNCU_BOYUT / 2)
  );
  oyunDurumu.oyuncu.y = Math.max(
    OYUNCU_BOYUT / 2,
    Math.min(oyunDurumu.oyuncu.y, cn.height - OYUNCU_BOYUT / 2)
  );

  //Çarpma kontrol
  if (carpismaKontrol()) {
    oyunDurumu.oyuncu.x = eskiX;
    oyunDurumu.oyuncu.y = eskiY;
  }

  //Aynanın dönmesi
  if (oyunDurumu.oyuncu.tuslar.aynaSol)
    oyunDurumu.oyuncu.aynaAci -= radyanToDerece(AYNA_DONUS_HIZ);
  if (oyunDurumu.oyuncu.tuslar.aynaSag)
    oyunDurumu.oyuncu.aynaAci += radyanToDerece(AYNA_DONUS_HIZ);
}

//Oyuncunun engellerle ve aynalarla çarpışmasının kontrolü
function carpismaKontrol() {
  const oyuncuYaricap = OYUNCU_BOYUT / 2;

  //Engeller ile çarpışma
  for (const engel of oyunDurumu.engeller) {
    const enYakinX = Math.max(
      engel.x,
      Math.min(oyunDurumu.oyuncu.x, engel.x + engel.genislik)
    );
    const enYakinY = Math.max(
      engel.y,
      Math.min(oyunDurumu.oyuncu.y, engel.y + engel.yukseklik)
    );

    const uzaklikX = oyunDurumu.oyuncu.x - enYakinX;
    const uzaklikY = oyunDurumu.oyuncu.y - enYakinY;
    const uzaklikKare = uzaklikX * uzaklikX + uzaklikY * uzaklikY;

    if (uzaklikKare < oyuncuYaricap * oyuncuYaricap) return true;
  }

  //Aynalar ile çarpışma
  for (const ayna of oyunDurumu.aynalar) {
    const aynaBaslangicX =
      ayna.x - (Math.cos(dereceToRadyan(ayna.aci)) * ayna.uzunluk) / 2;
    const aynaBaslangicY =
      ayna.y - (Math.sin(dereceToRadyan(ayna.aci)) * ayna.uzunluk) / 2;
    const aynaBitisX =
      ayna.x + (Math.cos(dereceToRadyan(ayna.aci)) * ayna.uzunluk) / 2;
    const aynaBitisY =
      ayna.y + (Math.sin(dereceToRadyan(ayna.aci)) * ayna.uzunluk) / 2;

    if (
      cizgiDaireCarpisma(
        aynaBaslangicX,
        aynaBaslangicY,
        aynaBitisX,
        aynaBitisY,
        oyunDurumu.oyuncu.x,
        oyunDurumu.oyuncu.y,
        oyuncuYaricap
      )
    )
      return true;
  }

  return false;
}

//Işığın hesaplanması
function isikGuncelle() {
  oyunDurumu.isik.isinlar = [];

  const ilkIsin = {
    baslangicX: oyunDurumu.kaynak.x,
    baslangicY: oyunDurumu.kaynak.y,
    aci: dereceToRadyan(oyunDurumu.kaynak.aci),
    bitisX: null,
    bitisY: null,
    carpisma: null, //Çarpışma tipi için
  };

  isikYoluTakip(ilkIsin);
  hedefIsabetKontrol();
}

function isikYoluTakip(isin) {
  //Işın yayılım izini hesapla
  const isinUzunluk = Math.max(cn.width, cn.height) * 2;
  let isinBitisX = isin.baslangicX + Math.cos(isin.aci) * isinUzunluk;
  let isinBitisY = isin.baslangicY + Math.sin(isin.aci) * isinUzunluk;

  //Kesişimler için değişkenler
  let enYakinKesisim = null;
  let enKisaUzaklik = Infinity;

  //Engeller ile kontrol
  for (const engel of oyunDurumu.engeller) {
    const kesisim = isinDikdortgenKesisim(
      isin.baslangicX,
      isin.baslangicY,
      isinBitisX,
      isinBitisY,
      engel.x,
      engel.y,
      engel.genislik,
      engel.yukseklik
    );

    if (kesisim && kesisim.uzaklik < enKisaUzaklik) {
      enKisaUzaklik = kesisim.uzaklik;
      enYakinKesisim = kesisim;
      enYakinKesisim.tip = "engel";
    }
  }

  //Aynalar ile kontrol
  for (const ayna of oyunDurumu.aynalar) {
    const aynaAciRadyan = dereceToRadyan(ayna.aci);
    const aynaBaslangicX =
      ayna.x - (Math.cos(aynaAciRadyan) * ayna.uzunluk) / 2;
    const aynaBaslangicY =
      ayna.y - (Math.sin(aynaAciRadyan) * ayna.uzunluk) / 2;
    const aynaBitisX = ayna.x + (Math.cos(aynaAciRadyan) * ayna.uzunluk) / 2;
    const aynaBitisY = ayna.y + (Math.sin(aynaAciRadyan) * ayna.uzunluk) / 2;

    const kesisim = isinCizgiKesisim(
      isin.baslangicX,
      isin.baslangicY,
      isinBitisX,
      isinBitisY,
      aynaBaslangicX,
      aynaBaslangicY,
      aynaBitisX,
      aynaBitisY
    );

    if (kesisim && kesisim.uzaklik < enKisaUzaklik) {
      enKisaUzaklik = kesisim.uzaklik;
      enYakinKesisim = kesisim;
      enYakinKesisim.tip = "ayna";
      enYakinKesisim.aci = aynaAciRadyan;
      enYakinKesisim.aynaNormalX = -Math.sin(aynaAciRadyan);
      enYakinKesisim.aynaNormalY = Math.cos(aynaAciRadyan);
    }
  }

  //Oyuncunun aynası ile kontrol
  const oyuncuAynaAciRadyan = dereceToRadyan(oyunDurumu.oyuncu.aynaAci);
  const oyuncuAynaBaslangicX =
    oyunDurumu.oyuncu.x - (Math.cos(oyuncuAynaAciRadyan) * AYNA_UZUNLUK) / 2;
  const oyuncuAynaBaslangicY =
    oyunDurumu.oyuncu.y - (Math.sin(oyuncuAynaAciRadyan) * AYNA_UZUNLUK) / 2;
  const oyuncuAynaBitisX =
    oyunDurumu.oyuncu.x + (Math.cos(oyuncuAynaAciRadyan) * AYNA_UZUNLUK) / 2;
  const oyuncuAynaBitisY =
    oyunDurumu.oyuncu.y + (Math.sin(oyuncuAynaAciRadyan) * AYNA_UZUNLUK) / 2;

  const oyuncuAynaKesisim = isinCizgiKesisim(
    isin.baslangicX,
    isin.baslangicY,
    isinBitisX,
    isinBitisY,
    oyuncuAynaBaslangicX,
    oyuncuAynaBaslangicY,
    oyuncuAynaBitisX,
    oyuncuAynaBitisY
  );

  if (oyuncuAynaKesisim && oyuncuAynaKesisim.uzaklik < enKisaUzaklik) {
    enKisaUzaklik = oyuncuAynaKesisim.uzaklik;
    enYakinKesisim = oyuncuAynaKesisim;
    enYakinKesisim.tip = "ayna";
    enYakinKesisim.aci = oyuncuAynaAciRadyan;
    enYakinKesisim.aynaNormalX = -Math.sin(oyuncuAynaAciRadyan);
    enYakinKesisim.aynaNormalY = Math.cos(oyuncuAynaAciRadyan);
  }

  //Hedef kontrol
  const hedefKesisimSonuc = isinDikdortgenKesisim(
    isin.baslangicX,
    isin.baslangicY,
    isinBitisX,
    isinBitisY,
    oyunDurumu.hedef.x,
    oyunDurumu.hedef.y,
    oyunDurumu.hedef.boyut,
    oyunDurumu.hedef.boyut
  );

  if (hedefKesisimSonuc && hedefKesisimSonuc.uzaklik < enKisaUzaklik) {
    enKisaUzaklik = hedefKesisimSonuc.uzaklik;
    enYakinKesisim = hedefKesisimSonuc;
    enYakinKesisim.tip = "hedef";
  }

  //Işının son noktası
  if (enYakinKesisim) {
    isin.bitisX = enYakinKesisim.x;
    isin.bitisY = enYakinKesisim.y;
    isin.carpisma = enYakinKesisim.tip;
  } else {
    isin.bitisX = isinBitisX;
    isin.bitisY = isinBitisY;
    isin.carpisma = null; //Herhangi bir çarpışma yok
  }

  //Işını pushla
  oyunDurumu.isik.isinlar.push(isin);

  //Işını yansıtma
  if (enYakinKesisim && enYakinKesisim.tip === "ayna") {
    //Işının geliş vekötürü
    const gelisX = Math.cos(isin.aci);
    const gelisY = Math.sin(isin.aci);

    //Ayna normali
    const normalX = enYakinKesisim.aynaNormalX;
    const normalY = enYakinKesisim.aynaNormalY;

    //Yansıma vektörü
    const carpim = gelisX * normalX + gelisY * normalY;
    const yansimaX = gelisX - 2 * carpim * normalX;
    const yansimaY = gelisY - 2 * carpim * normalY;

    //Yansıma açısı
    const yansimaAci = Math.atan2(yansimaY, yansimaX);

    //Sayısal hataları önlemek için yeni ışını kesişim noktasından biraz uzaklaştır
    const HASSASIYET_DUZELTME = 0.1; //Kaydırma miktarı
    const yeniBaslangicX = enYakinKesisim.x + yansimaX * HASSASIYET_DUZELTME;
    const yeniBaslangicY = enYakinKesisim.y + yansimaY * HASSASIYET_DUZELTME;

    //Yeni ışın
    const yeniIsin = {
      baslangicX: yeniBaslangicX,
      baslangicY: yeniBaslangicY,
      aci: yansimaAci,
      bitisX: null,
      bitisY: null,
      carpisma: null,
    };

    //Yansıyanı takip et - ta ki yansımayana kadar
    isikYoluTakip(yeniIsin);
  }
}

//Işının dikdörtgenle kesişim noktasını bul
function isinDikdortgenKesisim(
  isinX1,
  isinY1,
  isinX2,
  isinY2,
  dikdortgenX,
  dikdortgenY,
  genislik,
  yukseklik
) {
  //Dikdörtgenin kenarları
  const kenarlar = [
    //Sol kenar
    {
      x1: dikdortgenX,
      y1: dikdortgenY,
      x2: dikdortgenX,
      y2: dikdortgenY + yukseklik,
    },
    //Sağ kenar
    {
      x1: dikdortgenX + genislik,
      y1: dikdortgenY,
      x2: dikdortgenX + genislik,
      y2: dikdortgenY + yukseklik,
    },
    //Üst kenar
    {
      x1: dikdortgenX,
      y1: dikdortgenY,
      x2: dikdortgenX + genislik,
      y2: dikdortgenY,
    },
    //Alt kenar
    {
      x1: dikdortgenX,
      y1: dikdortgenY + yukseklik,
      x2: dikdortgenX + genislik,
      y2: dikdortgenY + yukseklik,
    },
  ];

  let enYakinKesisim = null;
  let enKisaUzaklik = Infinity;

  //Her kenarla kesişimi kontrol et
  for (const kenar of kenarlar) {
    const kesisim = isinCizgiKesisim(
      isinX1,
      isinY1,
      isinX2,
      isinY2,
      kenar.x1,
      kenar.y1,
      kenar.x2,
      kenar.y2
    );

    if (kesisim && kesisim.uzaklik < enKisaUzaklik) {
      enKisaUzaklik = kesisim.uzaklik;
      enYakinKesisim = kesisim;
    }
  }

  return enYakinKesisim;
}

//Hedef isabet kontrolu
function hedefIsabetKontrol() {
  let isabet = false;

  //Tüm ışınları kontrol
  for (const isin of oyunDurumu.isik.isinlar) {
    if (isin.carpisma === "hedef") {
      isabet = true;
      break;
    }
  }

  //Işın hedefe isabet ediyorsa doluluk oranını artır
  if (isabet) {
    oyunDurumu.hedef.dolulukOrani += DOLUM_HIZI;

    //İlerleme sesini çal
    if (!ilerlemeSesiCaliniyor) {
      ilerlemeSesi.currentTime = 0;
      ilerlemeSesi
        .play()
        .catch((err) => console.log("İlerleme sesi çalınamadı: ", err));
      ilerlemeSesiCaliniyor = true;
    }

    //Doluluk oranını 1'den fazla olmasını engelle
    if (oyunDurumu.hedef.dolulukOrani >= 1) {
      oyunDurumu.hedef.dolulukOrani = 1;

      //Eğer henüz kazanma durumuna geçilmediyse seviye geçiş zamanını ayarla
      if (!oyunDurumu.oyunKazanildi) {
        oyunDurumu.oyunKazanildi = true;
        oyunDurumu.seviye_gecis_zamani = performance.now();

        //Seviye tamamlama sesini çal
        levelUpSesi.currentTime = 0;
        levelUpSesi
          .play()
          .catch((err) =>
            console.log("Seviye tamamlama sesi çalınamadı: ", err)
          );
      }
    }
  }
  //Işın hedefe isabet etmiyorsa doluluk oranını sıfırla
  else {
    oyunDurumu.hedef.dolulukOrani = 0;
    //İlerleme sesi çalınıyorsa durdur
    if (ilerlemeSesiCaliniyor) {
      ilerlemeSesi.pause();
      ilerlemeSesi.currentTime = 0;
      ilerlemeSesiCaliniyor = false;
    }
  }

  //Seviye geçişini kontrol et
  if (
    oyunDurumu.oyunKazanildi &&
    !oyunDurumu.oyun_bitti &&
    performance.now() - oyunDurumu.seviye_gecis_zamani > 2000
  ) {
    //2 saniye bekledikten sonra bir sonraki seviyeye geç
    oyunDurumu.mevcut_seviye++;
    seviyeYukle(oyunDurumu.mevcut_seviye);
  }
}

//Çizim Fonksiyonları

function oyuncuCiz() {
  //Oyuncu çemberi
  ctx.beginPath();
  ctx.arc(
    oyunDurumu.oyuncu.x,
    oyunDurumu.oyuncu.y,
    OYUNCU_BOYUT / 2,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.closePath();

  //Ayna
  const oyuncuAynaAciRadyan = dereceToRadyan(oyunDurumu.oyuncu.aynaAci);
  const aynaBaslangicX =
    oyunDurumu.oyuncu.x - (Math.cos(oyuncuAynaAciRadyan) * AYNA_UZUNLUK) / 2;
  const aynaBaslangicY =
    oyunDurumu.oyuncu.y - (Math.sin(oyuncuAynaAciRadyan) * AYNA_UZUNLUK) / 2;
  const aynaBitisX =
    oyunDurumu.oyuncu.x + (Math.cos(oyuncuAynaAciRadyan) * AYNA_UZUNLUK) / 2;
  const aynaBitisY =
    oyunDurumu.oyuncu.y + (Math.sin(oyuncuAynaAciRadyan) * AYNA_UZUNLUK) / 2;

  ctx.beginPath();
  ctx.moveTo(aynaBaslangicX, aynaBaslangicY);
  ctx.lineTo(aynaBitisX, aynaBitisY);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "silver";
  ctx.stroke();
  ctx.closePath();

  //Oyuncu merkez noktası
  ctx.beginPath();
  ctx.arc(oyunDurumu.oyuncu.x, oyunDurumu.oyuncu.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

function oyunNesneleriCiz() {
  //Engeller
  ctx.fillStyle = "gray";
  for (const engel of oyunDurumu.engeller) {
    ctx.fillRect(engel.x, engel.y, engel.genislik, engel.yukseklik);
  }

  //Aynalar
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  for (const ayna of oyunDurumu.aynalar) {
    const aynaAciRadyan = dereceToRadyan(ayna.aci);
    const baslangicX = ayna.x - (Math.cos(aynaAciRadyan) * ayna.uzunluk) / 2;
    const baslangicY = ayna.y - (Math.sin(aynaAciRadyan) * ayna.uzunluk) / 2;
    const bitisX = ayna.x + (Math.cos(aynaAciRadyan) * ayna.uzunluk) / 2;
    const bitisY = ayna.y + (Math.sin(aynaAciRadyan) * ayna.uzunluk) / 2;

    ctx.beginPath();
    ctx.moveTo(baslangicX, baslangicY);
    ctx.lineTo(bitisX, bitisY);
    ctx.stroke();
    ctx.closePath();
  }

  //Hedef
  ctx.fillStyle = oyunDurumu.oyunKazanildi ? "lime" : "red";
  ctx.fillRect(
    oyunDurumu.hedef.x,
    oyunDurumu.hedef.y,
    oyunDurumu.hedef.boyut,
    oyunDurumu.hedef.boyut
  );

  //Doluluk çubuğu
  if (oyunDurumu.hedef.dolulukOrani > 0 && !oyunDurumu.oyunKazanildi) {
    const barGenislik = oyunDurumu.hedef.boyut - 10;
    const barYukseklik = 8;

    //Çubuk arkaplanı
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(
      oyunDurumu.hedef.x + 5,
      oyunDurumu.hedef.y - 15,
      barGenislik,
      barYukseklik
    );

    ctx.fillStyle = "yellow";
    ctx.fillRect(
      oyunDurumu.hedef.x + 5,
      oyunDurumu.hedef.y - 15,
      barGenislik * oyunDurumu.hedef.dolulukOrani,
      barYukseklik
    );
  }

  //Işık kaynağı
  ctx.beginPath();
  ctx.arc(oyunDurumu.kaynak.x, oyunDurumu.kaynak.y, 10, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();
}

function isikCiz() {
  ctx.lineWidth = ISIK_KALINLIK;
  for (const isin of oyunDurumu.isik.isinlar) {
    ctx.beginPath();
    ctx.moveTo(isin.baslangicX, isin.baslangicY);
    ctx.lineTo(isin.bitisX, isin.bitisY);
    ctx.strokeStyle = ISIK_RENK;
    ctx.stroke();
    ctx.closePath();
  }

  //Başarı mesajı
  if (oyunDurumu.oyunKazanildi) {
    ctx.font = "30px Arial";
    ctx.textAlign = "center";

    if (oyunDurumu.oyun_bitti) {
      //Tebrik mesajı için arkaplan
      const tebrikMetin = "Tebrikler, tüm seviyeleri tamamladınız!";
      const yenidenBaslaMetin = "Yeniden oynamak isterseniz Y tuşuna basın.";

      //Metinlerin genişliğini hesapla
      const tebrikGenislik = ctx.measureText(tebrikMetin).width;
      const yenidenBaslaGenislik = ctx.measureText(yenidenBaslaMetin).width;
      const maxGenislik = Math.max(tebrikGenislik, yenidenBaslaGenislik);

      //Arkaplan çiz
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      //İlk mesaj arkaplanı
      ctx.fillRect(
        cn.width / 2 - maxGenislik / 2 - 20,
        20,
        maxGenislik + 40,
        40
      );
      //İkinci mesaj arkaplanı
      ctx.fillRect(
        cn.width / 2 - maxGenislik / 2 - 20,
        70,
        maxGenislik + 40,
        40
      );

      //Mesajları yaz
      ctx.fillStyle = "lime";
      ctx.fillText(tebrikMetin, cn.width / 2, 50);
      ctx.fillText(yenidenBaslaMetin, cn.width / 2, 100);
    } else {
      //Seviye tamamlandı mesajı için arkaplan
      const seviyeMetin = `Seviye ${oyunDurumu.mevcut_seviye + 1} Tamamlandı!`;
      const seviyeGenislik = ctx.measureText(seviyeMetin).width;

      //Arkaplan çiz
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(
        cn.width / 2 - seviyeGenislik / 2 - 20,
        20,
        seviyeGenislik + 40,
        40
      );

      //Mesajı yaz
      ctx.fillStyle = "lime";
      ctx.fillText(seviyeMetin, cn.width / 2, 50);
    }
  }
}

//Yardımcı geometrik fonksyonlar
function isinCizgiKesisim(
  isinBaslangicX,
  isinBaslangicY,
  isinBitisX,
  isinBitisY,
  cizgiBaslangicX,
  cizgiBaslangicY,
  cizgiBitisX,
  cizgiBitisY
) {
  //Işın ve çizgi yönü
  const isinYonX = isinBitisX - isinBaslangicX;
  const isinYonY = isinBitisY - isinBaslangicY;
  const cizgiYonX = cizgiBitisX - cizgiBaslangicX;
  const cizgiYonY = cizgiBitisY - cizgiBaslangicY;

  //Determinant
  const det = isinYonX * cizgiYonY - isinYonY * cizgiYonX;

  //Paralel çizgiler - ondalık sayıların hassasiyet problemlerinden ötürü 0'a eşitlenmemiştir
  if (Math.abs(det) < 0.0001) return null;

  //t: Işının parametrik denklemi için parametre (t >= 0 ise ışın yönünde kesişim var)
  //t değeri kesişim noktasının ışın üzerindeki konumunu belirtir
  const t =
    ((cizgiBaslangicX - isinBaslangicX) * cizgiYonY -
      (cizgiBaslangicY - isinBaslangicY) * cizgiYonX) /
    det;

  //u: Çizginin parametrik denklemi için parametre
  //u değeri kesişim noktasının çizgi üzerindeki göreceli pozisyonunu belirtir
  //u=0 ise çizginin başlangıç noktasında, u=1 ise bitiş noktasında, 0<u<1 ise çizgi üzerinde bir noktada kesişim var
  const u =
    ((cizgiBaslangicX - isinBaslangicX) * isinYonY -
      (cizgiBaslangicY - isinBaslangicY) * isinYonX) /
    det;

  //Kesişim kontrol
  if (t >= 0 && u >= 0 && u <= 1) {
    return {
      x: isinBaslangicX + t * isinYonX,
      y: isinBaslangicY + t * isinYonY,
      uzaklik: t * Math.sqrt(isinYonX * isinYonX + isinYonY * isinYonY),
    };
  }

  return null;
}

function cizgiDaireCarpisma(
  cizgiX1,
  cizgiY1,
  cizgiX2,
  cizgiY2,
  daireX,
  daireY,
  daireYaricap
) {
  //Çizgi uzunluğu
  const cizgiUzunluk = Math.sqrt(
    Math.pow(cizgiX2 - cizgiX1, 2) + Math.pow(cizgiY2 - cizgiY1, 2)
  );

  //En yakın nokta
  const nokta =
    ((daireX - cizgiX1) * (cizgiX2 - cizgiX1) +
      (daireY - cizgiY1) * (cizgiY2 - cizgiY1)) /
    (cizgiUzunluk * cizgiUzunluk);
  const enYakinX = cizgiX1 + nokta * (cizgiX2 - cizgiX1);
  const enYakinY = cizgiY1 + nokta * (cizgiY2 - cizgiY1);

  //Bu nokta çizginin üzerinde mi?
  const cizgiUzerinde = nokta >= 0 && nokta <= 1;

  if (!cizgiUzerinde) {
    const uzaklik1 = Math.sqrt(
      Math.pow(daireX - cizgiX1, 2) + Math.pow(daireY - cizgiY1, 2)
    );
    const uzaklik2 = Math.sqrt(
      Math.pow(daireX - cizgiX2, 2) + Math.pow(daireY - cizgiY2, 2)
    );
    return uzaklik1 <= daireYaricap || uzaklik2 <= daireYaricap;
  }

  //Mesafe kontrolü - Uzaklık pisagor teoremi kullanılarak hesaplanmıştır
  const uzaklik = Math.sqrt(
    Math.pow(daireX - enYakinX, 2) + Math.pow(daireY - enYakinY, 2)
  );
  return uzaklik <= daireYaricap;
}

//Oyun döngüsü
function oyunDongusu() {
  //Ekranı temizle
  ctx.clearRect(0, 0, cn.width, cn.height);

  //Oyunu güncelle
  oyuncuKonumGuncelle();
  isikGuncelle();

  //Çizimler
  oyunNesneleriCiz();
  oyuncuCiz();
  isikCiz();

  //Sonraki kare
  requestAnimationFrame(oyunDongusu);
}

//Oyunu başlat
updateGameInfo();
oyunDongusu();
