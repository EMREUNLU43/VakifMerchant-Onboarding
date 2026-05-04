using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using VakifMerchant.API.Models;
using VakifMerchant.API.Enums;

namespace VakifMerchant.API.Services
{
    public class ApplicationTimeoutService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ApplicationTimeoutService> _logger;

        public ApplicationTimeoutService(IServiceProvider serviceProvider, ILogger<ApplicationTimeoutService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("⏳ Gece Bekçisi Robotu (Cron Job) çalışmaya başladı...");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndCancelExpiredApplications();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Gece Bekçisi Robotu çalışırken bir hata oluştu!");
                }

                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }
        }

        private async Task CheckAndCancelExpiredApplications()
        {
            _logger.LogInformation("Gece Bekçisi Robotu uyandı, kasayı (veritabanını) kontrol ediyor...");

            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<VakifMerchantDbContext>();

                var timeLimit = DateTime.Now.AddHours(-48);

                var expiredApplications = dbContext.MerchantApplications
                    .Where(x => x.Status == (int)ApplicationStatus.Bekliyor && x.ApplicationDate <= timeLimit)
                    .ToList();

                if (expiredApplications.Any())
                {
                    foreach (var app in expiredApplications)
                    {
                        app.Status = (int)ApplicationStatus.IptalEdildi;
                        _logger.LogWarning($"DİKKAT: {app.TaxNumber} vergi numaralı başvuru 48 saati geçtiği için otomatik iptal edildi!");
                    }

                    await dbContext.SaveChangesAsync();
                }
                else
                {
                    _logger.LogInformation("Zaman aşımına uğramış başvuru bulunamadı. Robot tekrar uykuya geçiyor.");
                }
            }
        }
    }
}