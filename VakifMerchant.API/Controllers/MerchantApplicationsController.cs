using Microsoft.AspNetCore.Mvc;
using VakifMerchant.API.DTOs;
using VakifMerchant.API.Models;
using VakifMerchant.API.Enums;
using System.IO;
using System.Linq;
using System;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace VakifMerchant.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MerchantApplicationsController : ControllerBase
    {
        private readonly VakifMerchantDbContext _context;

        public MerchantApplicationsController(VakifMerchantDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> CreateApplication([FromForm] MerchantApplicationCreateDto request)
        {
            bool isTaxNumberExists = _context.MerchantApplications.Any(x => x.TaxNumber == request.TaxNumber);

            if (isTaxNumberExists)
            {
                return BadRequest(new { Message = "Bu vergi numarası ile sistemimizde zaten devam eden bir başvuru bulunmaktadır." });
            }

            var newApplication = new MerchantApplication
            {
                CompanyName = request.CompanyName,
                TaxNumber = request.TaxNumber,
                TaxOffice = request.TaxOffice,
                ManagerName = request.ManagerName,
                ManagerTcNo = request.ManagerTcNo,
                Email = request.Email,
                Address = request.Address,
                City = request.City,
                District = request.District,
                WebAddress = request.WebAddress,
                BusinessCategory = request.BusinessCategory,
                EstimatedTurnover = request.EstimatedTurnover,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                HomePhone = request.HomePhone,
                WorkPhone = request.WorkPhone,
                MobilePhone = request.MobilePhone,
                Status = (byte)ApplicationStatus.Bekliyor, // 🚀 Ufak bir düzeltme: Burayı da byte yaptık ki ileride sorun çıkmasın
                ApplicationDate = DateTime.Now
            };

            _context.MerchantApplications.Add(newApplication);
            await _context.SaveChangesAsync();

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 1. Vergi Levhası
            if (request.VergiLevhasi != null && request.VergiLevhasi.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(request.VergiLevhasi.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.VergiLevhasi.CopyToAsync(stream);
                }

                _context.ApplicationDocuments.Add(new ApplicationDocument
                {
                    MerchantApplicationId = newApplication.Id,
                    FilePath = "/uploads/" + fileName,
                    DocumentType = "Vergi Levhası"
                });
            }

            // 2. İmza Sirküleri
            if (request.ImzaSirkuleri != null && request.ImzaSirkuleri.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(request.ImzaSirkuleri.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.ImzaSirkuleri.CopyToAsync(stream);
                }

                _context.ApplicationDocuments.Add(new ApplicationDocument
                {
                    MerchantApplicationId = newApplication.Id,
                    FilePath = "/uploads/" + fileName,
                    DocumentType = "İmza Sirküleri"
                });
            }

            // 3. Kimlik Fotokopisi
            if (request.KimlikFotokopisi != null && request.KimlikFotokopisi.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(request.KimlikFotokopisi.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.KimlikFotokopisi.CopyToAsync(stream);
                }

                _context.ApplicationDocuments.Add(new ApplicationDocument
                {
                    MerchantApplicationId = newApplication.Id,
                    FilePath = "/uploads/" + fileName,
                    DocumentType = "Kimlik Fotokopisi"
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Başvurunuz ve belgeleriniz başarıyla alınmıştır." });
        }


        [HttpGet]
        public IActionResult GetAllApplications([FromQuery] MerchantApplicationSearchDto search)
        {
            var query = _context.MerchantApplications.AsQueryable();

            if (!string.IsNullOrEmpty(search.TaxNumber))
            {
                query = query.Where(x => x.TaxNumber == search.TaxNumber);
            }

            if (!string.IsNullOrEmpty(search.CompanyName))
            {
                query = query.Where(x => x.CompanyName.Contains(search.CompanyName));
            }

            if (search.Status.HasValue)
            {
                query = query.Where(x => x.Status == search.Status.Value);
            }

            if (!string.IsNullOrEmpty(search.City))
            {
                query = query.Where(x => x.City == search.City);
            }

            if (search.StartDate.HasValue)
            {
                query = query.Where(x => x.ApplicationDate >= search.StartDate.Value);
            }

            if (search.EndDate.HasValue)
            {
                query = query.Where(x => x.ApplicationDate <= search.EndDate.Value);
            }

            var totalRecords = query.Count();

            var applications = query
                .OrderByDescending(x => x.ApplicationDate)
                .Skip((search.PageNumber - 1) * search.PageSize)
                .Take(search.PageSize)
                .ToList();

            return Ok(new
            {
                TotalRecords = totalRecords,
                TotalPages = (int)Math.Ceiling((double)totalRecords / search.PageSize),
                CurrentPage = search.PageNumber,
                Data = applications
            });
        }

        [HttpPost("{id}/documents")]
        public async Task<IActionResult> UploadDocuments(int id, List<IFormFile> files)
        {
            var application = _context.MerchantApplications.Find(id);
            if (application == null)
            {
                return NotFound(new { Message = "Belirtilen başvuru bulunamadı." });
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var document = new ApplicationDocument
                    {
                        MerchantApplicationId = id,
                        FilePath = "/uploads/" + uniqueFileName,
                        DocumentType = "Evrak"
                    };

                    _context.ApplicationDocuments.Add(document);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = $"{files.Count} adet dosya başarıyla yüklendi." });
        }

        // 🚀 YENİ EKLENDİ: Angular'ın çağırdığı Onayla/Reddet kapısı (Endpoint'i)
        [HttpPut("ChangeStatus/{id}")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] int newStatus)
        {
            var application = await _context.MerchantApplications.FindAsync(id);

            if (application == null)
            {
                return NotFound(new { message = "Başvuru bulunamadı." });
            }

            // 🚀 ÇÖZÜM BURADA: Gelen int değerini byte formatına açıkça çeviriyoruz (cast)
            application.Status = (byte)newStatus;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Durum başarıyla güncellendi." });
        }
    }
}