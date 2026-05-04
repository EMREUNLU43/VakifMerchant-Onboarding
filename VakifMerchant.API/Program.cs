using FluentValidation;
using FluentValidation.AspNetCore;
using VakifMerchant.API.Validators;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using VakifMerchant.API.Services;

var builder = WebApplication.CreateBuilder(args);



builder.Services.AddControllers();

builder.Services.AddDbContext<VakifMerchant.API.Models.VakifMerchantDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<MerchantApplicationCreateDtoValidator>();

// 🚀 YENİ: DOSYA YÜKLEME KAPASİTESİNİ ARTIRMA (PDF'ler için şart)
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = int.MaxValue;
    options.MemoryBufferThreshold = int.MaxValue;
});

// --- 1. ADIM: CORS KURALINI YAZDIĞIMIZ YER (Servislere Ekliyoruz) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", builder =>
    {
        builder.WithOrigins("http://localhost:4200")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- 1. GECE BEKÇİSİ ROBOTUN FİŞİNİ TAK ---
builder.Services.AddHostedService<ApplicationTimeoutService>();

// --- 2. GÜVENLİK (JWT) SİSTEMİNİN FİŞİNİ TAK ---
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!))
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.UseCors("AllowAngular");
app.UseStaticFiles(); // 🚀 Dosyaların dışarıya açılması için bu şart, zaten eklemişsin mükemmel!
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();