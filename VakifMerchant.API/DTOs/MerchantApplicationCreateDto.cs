using Microsoft.AspNetCore.Http; // 🚀 EKLENDİ

namespace VakifMerchant.API.DTOs
{
    public class MerchantApplicationCreateDto
    {
        public string CompanyName { get; set; }
        public string TaxNumber { get; set; }
        public string TaxOffice { get; set; }
        public string ManagerName { get; set; }
        public string ManagerTcNo { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string WebAddress { get; set; }
        public string BusinessCategory { get; set; }
        public decimal EstimatedTurnover { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string HomePhone { get; set; }
        public string WorkPhone { get; set; }
        public string MobilePhone { get; set; }

        // 🚀 YENİ EKLENEN DOSYA ÖZELLİKLERİ
        public IFormFile? VergiLevhasi { get; set; }
        public IFormFile? ImzaSirkuleri { get; set; }
        public IFormFile? KimlikFotokopisi { get; set; }
    }
}