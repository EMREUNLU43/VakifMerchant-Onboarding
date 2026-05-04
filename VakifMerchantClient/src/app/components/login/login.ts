import { Component, OnInit } from '@angular/core'; // 🚀 OnInit eklendi
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit { // 🚀 implements OnInit eklendi
  email: string = '';
  password: string = '';

  constructor(private router: Router) { }

  // 🚀 YENİLİK: Kullanıcı bu sayfaya (Login'e) geldiği an anahtarı yok et (Çıkış yap)
  ngOnInit() {
    localStorage.removeItem('token');
  }

  onLogin() {
    if (this.email === 'admin@vakifbank.com' && this.password === 'admin') {
      // 🚀 YENİLİK: replaceUrl silindi. Normal yönlendiriyoruz ki geri tuşuna basabilsin.
      // Geri tuşuna bastığında ise yukarıdaki ngOnInit çalışıp anahtarı silecek.
      localStorage.setItem('token', 'gecici-admin-anahtari');
      this.router.navigate(['/dashboard']);
    } else if (this.email === '' || this.password === '') {
      alert("Lütfen tüm alanları doldurunuz!");
    } else {
      alert("Hatalı e-posta veya şifre!");
    }
  }
}
