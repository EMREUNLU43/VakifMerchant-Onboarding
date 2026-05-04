import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';

declare var google: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMapsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  aktifSekme: string = 'ozluk';

  dolarKuru: string = 'Yükleniyor...';
  euroKuru: string = 'Yükleniyor...';

  iller: string[] = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
    'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
    'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
    'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
    'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
    'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
    'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
    'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
  ];

  yuklenenDosyalar: any = {
    vergiLevhasi: null,
    imzaSirkuleri: null,
    kimlik: null,
    ticaretSicilGazetesi: null,
    uyeIsyeriSozlesmesi: null
  };

  basvuruModel = {
    basvuruNo: '503124',
    tcKimlikNo: '',
    vergiNo: '',
    vadesizHesapNo: '00158007344740577',
    ticariSicilNo: '',
    kayitTarihi: '',
    tabelaAdi: '',
    yoneticiAdi: '',
    sicilKayitAdi: '',
    vergiDairesi: '',
    adres: '',
    il: 'İstanbul',
    ilce: '',
    postaKodu: '',
    telefon: '',
    email: '',
    webAdres: '',
    emailEkstre: true,
    basiliEkstre: false,
    sahipTc: '',
    sahipAd: '',
    sahipTel: '',
    enlem: 41.0082,
    boylam: 28.9784,
    posTipi: 'fiziki',
    masaustuPosSayisi: 0,
    mobilPosSayisi: 0,
    yazarkasaPosSayisi: 0,
    markaPaylasim: 'world',
    puan: 0.275,
    aylikCiro: '',
    ciroBirim: 'TRY',
    faaliyetKonusu: '',
    subeGorusu: ''
  };

  center: any = { lat: 41.0082, lng: 28.9784 };
  zoom = 12;
  markerPosition: any = { lat: 41.0082, lng: 28.9784 };

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.kurlariGetir();
  }

  kurlariGetir() {
    const apiUrl = 'https://open.er-api.com/v6/latest/USD';

    this.http.get(apiUrl).subscribe({
      next: (veri: any) => {
        const usdToTry = veri.rates.TRY;
        this.dolarKuru = usdToTry.toFixed(2) + ' ₺';

        const eurToTry = usdToTry / veri.rates.EUR;
        this.euroKuru = eurToTry.toFixed(2) + ' ₺';
      },
      error: (hata: any) => {
        console.error('Gerçek kurlar çekilirken ağ hatası oluştu:', hata);
        this.dolarKuru = 'Bağlantı Hatası';
        this.euroKuru = 'Bağlantı Hatası';
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  sekmeDegistir(sekmeAdi: string) { this.aktifSekme = sekmeAdi; }
  sayfayaGit(rota: string) { this.router.navigate([rota]); }

  sadeceRakam(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  sadeceHarf(event: any): boolean {
    const charStr = event.key;
    if (charStr && charStr.length === 1 && !/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(charStr)) {
      return false;
    }
    return true;
  }

  haritayaTiklandi(event: any) {
    if (event.latLng) {
      const secilenEnlem = event.latLng.lat();
      const secilenBoylam = event.latLng.lng();

      this.markerPosition = { lat: secilenEnlem, lng: secilenBoylam };
      this.basvuruModel.enlem = secilenEnlem;
      this.basvuruModel.boylam = secilenBoylam;

      this.adresiCoz(secilenEnlem, secilenBoylam);
    }
  }

  adresiCoz(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        this.basvuruModel.adres = results[0].formatted_address;

        const adresBilesenleri = results[0].address_components;
        let bulunanIl = '';
        let bulunanIlce = '';

        for (let bilesen of adresBilesenleri) {
          if (bilesen.types.includes('administrative_area_level_1')) {
            bulunanIl = bilesen.long_name;
          }
          if (bilesen.types.includes('administrative_area_level_2') || bilesen.types.includes('sublocality_level_1')) {
            bulunanIlce = bilesen.long_name;
          }
        }

        if (bulunanIl) {
          this.basvuruModel.il = bulunanIl.replace(' Province', '');
        }
        if (bulunanIlce) {
          this.basvuruModel.ilce = bulunanIlce;
        }

      } else {
        console.error("Adres çözümlenemedi:", status);
      }
    });
  }

  dosyaSecildi(event: any, belgeTipi: string) {
    const dosya = event.target.files[0];
    if (dosya) {
      this.yuklenenDosyalar[belgeTipi] = dosya;
      console.log(`${belgeTipi} başarıyla eklendi:`, dosya.name);
    }
  }

  basvuruyuKaydet(form: NgForm) {
    // 1. KONTROL: Metin Alanları
    if (!this.basvuruModel.tcKimlikNo || !this.basvuruModel.vergiNo || !this.basvuruModel.tabelaAdi || !this.basvuruModel.telefon || form.invalid) {
      Swal.fire({
        title: 'Eksik Form Bilgisi!',
        text: 'Lütfen Özlük, İletişim ve POS bilgileri sekmelerindeki zorunlu alanları eksiksiz doldurun.',
        icon: 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // 🚀 YENİ KONTROL: Sicil Kayıt Tarihi boş bırakılamaz
    if (!this.basvuruModel.kayitTarihi) {
      Swal.fire({
        title: 'Eksik Form Bilgisi!',
        text: 'Lütfen Sicil Kayıt Tarihi alanını doldurunuz.',
        icon: 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // 2. KONTROL: Ticari Sicil No
    if (this.basvuruModel.ticariSicilNo && !/^[0-9]+$/.test(this.basvuruModel.ticariSicilNo)) {
      Swal.fire({
        title: 'Geçersiz Veri!',
        text: 'Ticari Sicil Numarası sadece rakamlardan oluşmalıdır (Harf kullanılamaz).',
        icon: 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // 3. KONTROL: İşyeri GSM No
    if (this.basvuruModel.telefon && !/^0[0-9]{10}$/.test(this.basvuruModel.telefon)) {
      Swal.fire({
        title: 'Geçersiz Telefon Numarası!',
        text: 'Lütfen telefon numaranızı başında sıfır (0) olacak şekilde, tam 11 haneli olarak giriniz. (Örn: 05551234567)',
        icon: 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // 4. KONTROL: İşyeri Sahibi TC Kimlik No
    if (this.basvuruModel.sahipTc && !/^[0-9]{11}$/.test(this.basvuruModel.sahipTc)) {
      Swal.fire({
        title: 'Geçersiz TC Kimlik Numarası!',
        text: 'İşyeri Sahibi TC Kimlik Numarası tam 11 haneli olmalı ve sadece rakamlardan oluşmalıdır.',
        icon: 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // 5. KONTROL: İşyeri Sahibi Cep Telefonu
    if (this.basvuruModel.sahipTel && !/^0[0-9]{10}$/.test(this.basvuruModel.sahipTel)) {
      Swal.fire({
        title: 'Geçersiz Cep Telefonu!',
        text: 'İşyeri Sahibi Cep Telefonu başında sıfır (0) olacak şekilde, tam 11 haneli olarak girilmelidir. (Örn: 05551234567)',
        icon: 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // 6. KONTROL: İlçe Sadece Harf Olmalı
    if (this.basvuruModel.ilce && !/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(this.basvuruModel.ilce)) {
      Swal.fire({
        title: 'Geçersiz İlçe Bilgisi!',
        text: 'İlçe alanına rakam veya özel karakter girilemez. Lütfen sadece harf kullanınız.',
        icon: 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // 7. KONTROL: Posta Kodu 5 Haneli Rakam Olmalı
    if (this.basvuruModel.postaKodu && !/^[0-9]{5}$/.test(this.basvuruModel.postaKodu)) {
      Swal.fire({
        title: 'Geçersiz Posta Kodu!',
        text: 'Posta Kodu tam 5 haneli rakamlardan oluşmalıdır (Örn: 34000).',
        icon: 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // 8. KONTROL: Yönetici Adı Soyadı Sadece Harf Olmalı
    if (this.basvuruModel.yoneticiAdi && !/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(this.basvuruModel.yoneticiAdi)) {
      Swal.fire({
        title: 'Geçersiz Yönetici Adı!',
        text: 'Yönetici Adı Soyadı alanına rakam veya özel karakter girilemez. Lütfen sadece harf kullanınız.',
        icon: 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // 9. KONTROL: İşyeri Sahibi Adı Soyadı Sadece Harf Olmalı
    if (this.basvuruModel.sahipAd && !/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(this.basvuruModel.sahipAd)) {
      Swal.fire({
        title: 'Geçersiz İşyeri Sahibi Adı!',
        text: 'İşyeri Sahibi Adı Soyadı alanına rakam veya özel karakter girilemez. Lütfen sadece harf kullanınız.',
        icon: 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    // 10. KONTROL: Dokümanlar
    if (!this.yuklenenDosyalar.vergiLevhasi || !this.yuklenenDosyalar.kimlik) {
      Swal.fire({
        title: 'Eksik Doküman!',
        text: 'Lütfen Dokümanlar sekmesine giderek "Vergi Levhası" ve "Kimlik Fotokopisi" belgelerini yükleyin.',
        icon: 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    const formData = new FormData();

    formData.append('CompanyName', this.basvuruModel.tabelaAdi || 'Girilmedi');
    formData.append('TaxNumber', this.basvuruModel.vergiNo);
    formData.append('TaxOffice', this.basvuruModel.vergiDairesi || 'Girilmedi');
    formData.append('ManagerName', this.basvuruModel.yoneticiAdi || 'Girilmedi');
    formData.append('ManagerTcNo', this.basvuruModel.tcKimlikNo);
    formData.append('Email', this.basvuruModel.email || 'test@test.com');
    formData.append('Address', this.basvuruModel.adres || 'Girilmedi');
    formData.append('City', this.basvuruModel.il || 'İstanbul');
    formData.append('District', this.basvuruModel.ilce || 'Girilmedi');
    formData.append('WebAddress', this.basvuruModel.webAdres || 'www.test.com');
    formData.append('BusinessCategory', this.basvuruModel.faaliyetKonusu || 'Girilmedi');

    formData.append('EstimatedTurnover', (parseFloat(this.basvuruModel.aylikCiro) || 0).toString().replace('.', ','));
    formData.append('Latitude', this.basvuruModel.enlem.toString().replace('.', ','));
    formData.append('Longitude', this.basvuruModel.boylam.toString().replace('.', ','));

    formData.append('HomePhone', "02120000000");
    formData.append('WorkPhone', this.basvuruModel.telefon || "05550000000");
    formData.append('MobilePhone', this.basvuruModel.sahipTel || "05550000000");

    if (this.yuklenenDosyalar.vergiLevhasi) {
      formData.append('VergiLevhasi', this.yuklenenDosyalar.vergiLevhasi);
    }
    if (this.yuklenenDosyalar.imzaSirkuleri) {
      formData.append('ImzaSirkuleri', this.yuklenenDosyalar.imzaSirkuleri);
    }
    if (this.yuklenenDosyalar.kimlik) {
      formData.append('KimlikFotokopisi', this.yuklenenDosyalar.kimlik);
    }
    if (this.yuklenenDosyalar.ticaretSicilGazetesi) {
      formData.append('TicaretSicilGazetesi', this.yuklenenDosyalar.ticaretSicilGazetesi);
    }
    if (this.yuklenenDosyalar.uyeIsyeriSozlesmesi) {
      formData.append('UyeIsyeriSozlesmesi', this.yuklenenDosyalar.uyeIsyeriSozlesmesi);
    }

    const apiUrl = 'https://localhost:7286/api/MerchantApplications';

    this.http.post(apiUrl, formData).subscribe({
      next: (cevap: any) => {
        Swal.fire({
          title: 'Tebrikler!',
          text: 'Başvuru ve belgeler sisteme başarıyla kaydedildi.',
          icon: 'success',
          confirmButtonText: 'Listeye Git',
          confirmButtonColor: '#ffc107',
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/basvuru-listesi']);
          }
        });
      },
      error: (hata: any) => {
        const mesaj = hata.error?.Message || hata.error?.message || "Sunucuya bağlanılamadı.";
        Swal.fire({
          title: 'Hata!',
          text: mesaj,
          icon: 'error',
          confirmButtonText: 'Tekrar Dene',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
}
