using FluentValidation;
using VakifMerchant.API.DTOs;

namespace VakifMerchant.API.Validators
{
    public class MerchantApplicationCreateDtoValidator : AbstractValidator<MerchantApplicationCreateDto>
    {
        public MerchantApplicationCreateDtoValidator()
        {
            // Firma Adı Kontrolü
            RuleFor(x => x.CompanyName)
                .NotEmpty().WithMessage("Firma adı boş bırakılamaz.")
                .MaximumLength(200).WithMessage("Firma adı en fazla 200 karakter olabilir.");

            // 🚀 VERGİ NUMARASI: Sadece ve kesinlikle 10 hane olmalı
            RuleFor(x => x.TaxNumber)
                .NotEmpty().WithMessage("Vergi numarası zorunludur.")
                .Length(10).WithMessage("Vergi numarası tam 10 haneli olmalıdır.")
                .Matches("^[0-9]*$").WithMessage("Vergi Numarası sadece rakamlardan oluşmalıdır.");

            // 🚀 TC KİMLİK NUMARASI: Sadece ve kesinlikle 11 hane olmalı
            RuleFor(x => x.ManagerTcNo)
                .NotEmpty().WithMessage("TC Kimlik numarası zorunludur.")
                .Length(11).WithMessage("TC Kimlik numarası tam 11 haneli olmalıdır.")
                .Matches("^[0-9]*$").WithMessage("TC Kimlik numarası sadece rakamlardan oluşmalıdır.");

            // Email Format Kontrolü
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email adresi zorunludur.")
                .EmailAddress().WithMessage("Lütfen geçerli bir email formatı giriniz (örn: info@firma.com).");

            // Telefon Numarası Kontrolü 
            RuleFor(x => x.MobilePhone)
                .NotEmpty().WithMessage("Cep telefonu numarası zorunludur.")
                .Matches("^[0-9]*$").WithMessage("Telefon numarası sadece rakamlardan oluşmalıdır.");

            // İl ve İlçe Kontrolü
            RuleFor(x => x.City).NotEmpty().WithMessage("İl bilgisi zorunludur.");
            RuleFor(x => x.District).NotEmpty().WithMessage("İlçe bilgisi zorunludur.");
        }
    }
}