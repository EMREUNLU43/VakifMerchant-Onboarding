import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './application-list.html',
  styleUrl: './application-list.css'
})
export class ApplicationListComponent implements OnInit {
  basvurular: any[] = [];
  yukleniyor: boolean = true;

  toplamKayit: number = 0;
  toplamSayfa: number = 1;

  filtreler = {
    taxNumber: '',
    companyName: '',
    city: '',
    status: '',
    startDate: '',
    endDate: '',
    pageNumber: 1,
    pageSize: 10
  };

  istatistikler = {
    bekleyen: 0,
    onaylanan: 0,
    reddedilen: 0
  };

  secilenBasvuru: any = null;
  belgeler: any[] = [];

  // 🚀 YENİ: Master Checkbox için değişken
  hepsiSecili: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {
    this.basvurulariGetir();
  }

  sayfayaGit(rota: string) {
    this.router.navigate([rota]);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  basvurulariGetir() {
    this.yukleniyor = true;
    const apiUrl = 'https://localhost:7286/api/MerchantApplications';

    let params = new HttpParams()
      .set('PageNumber', this.filtreler.pageNumber)
      .set('PageSize', this.filtreler.pageSize);

    if (this.filtreler.taxNumber) params = params.set('TaxNumber', this.filtreler.taxNumber);
    if (this.filtreler.companyName) params = params.set('CompanyName', this.filtreler.companyName);
    if (this.filtreler.city) params = params.set('City', this.filtreler.city);
    if (this.filtreler.status) params = params.set('Status', this.filtreler.status);
    if (this.filtreler.startDate) params = params.set('StartDate', this.filtreler.startDate);
    if (this.filtreler.endDate) params = params.set('EndDate', this.filtreler.endDate);

    this.http.get(apiUrl, { params }).subscribe({
      next: (cevap: any) => {
        // Yeni veri gelince eski seçimleri temizliyoruz
        this.hepsiSecili = false;

        this.basvurular = cevap.data || cevap.Data || [];
        this.toplamKayit = cevap.totalRecords || 0;
        this.toplamSayfa = cevap.totalPages || 1;
        this.yukleniyor = false;

        this.istatistikleriHesapla();
        this.cdr.detectChanges();
      },
      error: (hata: any) => {
        console.error("Hata oluştu:", hata);
        this.yukleniyor = false;
        this.cdr.detectChanges();

        Swal.fire({
          title: 'Bağlantı Hatası!',
          text: 'Veriler sunucudan çekilirken bir sorun oluştu.',
          icon: 'error',
          confirmButtonText: 'Tamam',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // 🚀 YENİ: Ana checkbox işaretlendiğinde tüm listeyi seç/kaldır
  tumunuSecDegistir() {
    this.basvurular.forEach(b => b.secildi = this.hepsiSecili);
  }

  // 🚀 YENİ: Tekil bir checkbox tıklandığında kontrol et
  secimKontrol() {
    // Eğer tüm başvuruların 'secildi' özelliği true ise, master checkbox'ı da true yap
    this.hepsiSecili = this.basvurular.length > 0 && this.basvurular.every(b => b.secildi);
  }

  istatistikleriHesapla() {
    this.istatistikler.bekleyen = this.basvurular.filter(b => (b.status || b.Status) === 1).length;
    this.istatistikler.onaylanan = this.basvurular.filter(b => (b.status || b.Status) === 3).length;
    this.istatistikler.reddedilen = this.basvurular.filter(b => (b.status || b.Status) === 4).length;
  }

  filtrele() {
    this.filtreler.pageNumber = 1;
    this.basvurulariGetir();
  }

  filtreleriTemizle() {
    this.filtreler = { taxNumber: '', companyName: '', city: '', status: '', startDate: '', endDate: '', pageNumber: 1, pageSize: 10 };
    this.basvurulariGetir();
  }

  sayfaDegistir(yeniSayfa: number) {
    if (yeniSayfa >= 1 && yeniSayfa <= this.toplamSayfa) {
      this.filtreler.pageNumber = yeniSayfa;
      this.basvurulariGetir();
    }
  }

  getStatusName(statusCode: number): string {
    switch (statusCode) {
      case 1: return 'Bekliyor';
      case 2: return 'İncelemede';
      case 3: return 'Onaylandı';
      case 4: return 'Reddedildi';
      case 5: return 'İptal';
      default: return 'Bilinmiyor';
    }
  }

  getStatusClass(statusCode: number): string {
    switch (statusCode) {
      case 1: return 'bg-secondary';
      case 2: return 'bg-info text-dark';
      case 3: return 'bg-success';
      case 4: return 'bg-danger';
      case 5: return 'bg-dark';
      default: return 'bg-light text-dark';
    }
  }

  // 🚀 GÜNCELLENDİ: Artık sadece SEÇİLİ OLANLARI aktarıyor
  excelIndir() {
    // Listeden sadece 'secildi' özelliği true olanları al
    const aktarilacaklar = this.basvurular.filter(b => b.secildi);

    // Eğer kimseyi seçmemişse uyarı verip işlemi durdur
    if (aktarilacaklar.length === 0) {
      Swal.fire({
        title: 'Seçim Yapılmadı',
        text: 'Excel\'e aktarmak için lütfen listeden en az bir başvuru seçiniz.',
        icon: 'warning',
        confirmButtonText: 'Anladım',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    const excelVerisi = aktarilacaklar.map(b => ({
      'Firma / Tabela Adı': b.companyName || b.CompanyName || '-',
      'Vergi No': b.taxNumber || b.TaxNumber || '-',
      'Vergi Dairesi': b.taxOffice || b.TaxOffice || '-',
      'Yönetici Adı': b.managerName || b.ManagerName || '-',
      'Yönetici TC No': b.managerTcNo || b.ManagerTcNo || '-',
      'E-Posta': b.email || b.Email || '-',
      'Şehir': b.city || b.City || '-',
      'İlçe': b.district || b.District || '-',
      'Tam Adres': b.address || b.Address || '-',
      'İş Telefonu': b.workPhone || b.WorkPhone || '-',
      'Cep Telefonu': b.mobilePhone || b.MobilePhone || '-',
      'Faaliyet Konusu': b.businessCategory || b.BusinessCategory || '-',
      'Tahmini Ciro': b.estimatedTurnover || b.EstimatedTurnover || '-',
      'Web Adresi': b.webAddress || b.WebAddress || '-',
      'Başvuru Tarihi': new Date(b.applicationDate || b.ApplicationDate).toLocaleDateString('tr-TR'),
      'Güncel Durum': this.getStatusName(b.status || b.Status)
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelVerisi);

    const sutunGenislikleri = [
      { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 40 }, { wch: 15 },
      { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }
    ];
    worksheet['!cols'] = sutunGenislikleri;

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tüm Başvuru Detayları');

    XLSX.writeFile(workbook, 'Secili_Uye_Isyeri_Raporu.xlsx');
  }

  detayGoster(basvuru: any) {
    this.secilenBasvuru = basvuru;
    this.belgeler = [];

    const basvuruId = basvuru.id || basvuru.Id;
    if (basvuruId) {
      const url = `https://localhost:7286/api/MerchantApplications/${basvuruId}/documents`;

      this.http.get(url).subscribe({
        next: (res: any) => {
          this.belgeler = res || [];
        },
        error: (err) => {
          console.error("Belgeler çekilirken hata:", err);
        }
      });
    }
  }

  modalKapat() {
    this.secilenBasvuru = null;
    this.belgeler = [];
  }

  durumGuncelle(id: number, yeniDurum: number, durumAdi: string) {
    if (!id) {
      Swal.fire(
        'Eksik ID Hatası',
        'Başvuru ID numarası bulunamadı. Lütfen C# modelinizdeki ID kolonunun adını kontrol edin.',
        'error'
      );
      return;
    }

    Swal.fire({
      title: 'Emin misiniz?',
      text: `Bu başvuruyu "${durumAdi}" olarak işaretlemek üzeresiniz.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: yeniDurum === 3 ? '#198754' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Evet, ' + durumAdi,
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {

        const url = `https://localhost:7286/api/MerchantApplications/ChangeStatus/${id}`;
        const headers = { 'Content-Type': 'application/json' };

        this.http.put(url, yeniDurum, { headers }).subscribe({
          next: () => {
            Swal.fire('Başarılı!', `Başvuru ${durumAdi}.`, 'success');
            this.modalKapat();
            this.basvurulariGetir();
          },
          error: (err) => {
            console.error("Tam Hata Çıktısı:", err);

            let hataMesaji = 'Durum güncellenirken bilinmeyen bir sunucu hatası oluştu.';

            if (err.status === 404) {
              hataMesaji = "C# tarafında 'ChangeStatus' metodu bulunamadı (404). Lütfen Controller'ı kontrol edin.";
            } else if (err.status === 400) {
              hataMesaji = "C# gönderilen veriyi formata uygun bulmadı (400 Bad Request).";
            } else if (err.status === 415) {
              hataMesaji = "Medya tipi desteklenmiyor (415 Unsupported Media Type).";
            }

            Swal.fire({
              title: `Hata Kodu: ${err.status}`,
              text: hataMesaji,
              icon: 'error',
              confirmButtonText: 'Anladım'
            });
          }
        });
      }
    });
  }
}
