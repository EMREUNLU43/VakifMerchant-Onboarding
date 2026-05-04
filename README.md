# 🏢 Üye İşyeri Başvuru ve Yönetim Sistemi -- Merchant Onboarding

Bu proje, bankacılık ve ödeme sistemleri altyapılarına uygun olarak tasarlanmış, tam kapsamlı (Full-Stack) bir Üye İşyeri (Merchant) Başvuru ve Yönetim sistemidir. Kullanıcıların güvenli ve hızlı bir şekilde POS/Sanal POS başvurusu yapabilmesini ve yöneticilerin bu başvuruları tek bir panel üzerinden yönetebilmesini sağlar.

## Kullanılan Teknolojiler
**Frontend (İstemci Tarafı):**
*   Angular (Standalone Components)
*   TypeScript, HTML5, CSS3
*   Google Maps API (Konum Entegrasyonu)
*   XLSX (Excel Çıktısı Alma)
*   SweetAlert2 (Gelişmiş Kullanıcı Uyarıları)
**Backend (Sunucu Tarafı):**
*   .NET Core Web API (C#)
*   Entity Framework Core (Code-First / DB-First Yaklaşımı)
*   RESTful Mimari
**Veritabanı:**
*   Microsoft SQL Server
##  Temel Özellikler
*   **Çok Sekmeli Başvuru Formu:** Özlük, POS, Çalışma Şartları ve Kredibilite bilgilerinin modüler bir yapıda (Wizard) alınması.
*   **Google Maps Entegrasyonu:** Başvuru sırasında işyeri adres koordinatlarının harita üzerinden interaktif olarak seçilmesi.
*   **Dinamik Belge Yükleme:** Vergi Levhası, İmza Sirküleri, Kimlik Fotokopisi gibi zorunlu belgelerin sisteme güvenli şekilde yüklenmesi.
*   **Yönetici Listeleme Ekranı:** Başvuruların Vergi No, TCKN, Şehir, Tarih ve Durum gibi gelişmiş filtrelerle aranabilmesi.
*   **Detaylı İnceleme Modalı:** Yönetici panelinde seçilen başvurunun tüm metinsel detaylarının ve yüklenen belgelerinin tek bir ekranda önizlenmesi.
*   **Onay/Red Mekanizması:** Gelen başvuruların durumlarının anlık olarak güncellenmesi.
*   **Dinamik Excel Export:** Sadece ekranda listelenen veya özel olarak (Checkbox ile) seçilen başvuru kayıtlarının tüm detaylarıyla Excel formatında dışa aktarılması.

##  Güvenlik ve Mimari Yaklaşımlar
*   Yüklenen hassas müşteri belgeleri (Kimlik, Sicil Gazetesi vb.) public repolardan gizlenmiş olup, `.gitignore` kuralları ile izole edilmiştir.
*   Geliştirme aşamasında API anahtarları (Google Maps vb.) güvenlik standartlarına uygun olarak konfigüre edilmiştir.
*   Veritabanı işlemleri Entity Framework üzerinden güvenli bir şekilde sağlanmaktadır.
