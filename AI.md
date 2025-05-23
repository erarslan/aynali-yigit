> _Işının ve bir çizginin kesişimini geometrik fonksiyon olacak şekilde parametrik denklemleri kullanarak oluşturur musun?_
>
> > **Not:** Bu fonksiyonun yorum satırları benim tarafımdan oluşturulduğu için yapay zekanın yazdığı yorum satırlarını sildim.

```
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
  const isinYonX = isinBitisX - isinBaslangicX;
  const isinYonY = isinBitisY - isinBaslangicY;
  const cizgiYonX = cizgiBitisX - cizgiBaslangicX;
  const cizgiYonY = cizgiBitisY - cizgiBaslangicY;

  const det = isinYonX * cizgiYonY - isinYonY * cizgiYonX;


  if (Math.abs(det) < 0.0001) return null;

  const t =
    ((cizgiBaslangicX - isinBaslangicX) * cizgiYonY -
      (cizgiBaslangicY - isinBaslangicY) * cizgiYonX) /
    det;

  const u =
    ((cizgiBaslangicX - isinBaslangicX) * isinYonY -
      (cizgiBaslangicY - isinBaslangicY) * isinYonX) /
    det;

  if (t >= 0 && u >= 0 && u <= 1) {
    return {
      x: isinBaslangicX + t * isinYonX,
      y: isinBaslangicY + t * isinYonY,
      uzaklik: t * Math.sqrt(isinYonX * isinYonX + isinYonY * isinYonY),
    };
  }

  return null;
}
```

> _Işığın yansıma ilkesini kullanarak yaptığım Aynalı Yiğit adlı web oyununa favicon oluşturur musun?_\
> **Mevcut favicon.ico'yu oluşturdu.**

> _Bu projeyi açıklayacak bir README.md dosyası oluşturur musun? Oluştururken şunlara dikket et_:
>
> - Oyunun girişinden bir ekran görüntüsü olacak
> - Son seviyeyi bitirdikten sonraki ekrandan bir ekran görüntüsü olacak
> - Hedefin vurulduğu süre boyunca barın dolmasını gösteren bir gif olacak
> - Karakterin içindeki aynanın döndürmesini içeren bir gif olacak
> - Tanıtım ve oynanışı içeren Youtube videosunun linki olacak
>
> **Mevcut README.md'yi oluşturdu.**
>
> > **Not:** Bazı kısımları değiştirilerek kullanılmıştır.
