using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace VakifMerchant.API.Models;

public partial class VakifMerchantDbContext : DbContext
{
    public VakifMerchantDbContext()
    {
    }

    public VakifMerchantDbContext(DbContextOptions<VakifMerchantDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ApplicationDocument> ApplicationDocuments { get; set; }

    public virtual DbSet<ApplicationHistory> ApplicationHistories { get; set; }

    public virtual DbSet<MerchantApplication> MerchantApplications { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:DefaultConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ApplicationDocument>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Applicat__3214EC071713D366");

            entity.Property(e => e.DocumentType).HasMaxLength(50);
            entity.Property(e => e.OriginalFileName).HasMaxLength(255);
            entity.Property(e => e.UploadedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.MerchantApplication).WithMany(p => p.ApplicationDocuments)
                .HasForeignKey(d => d.MerchantApplicationId)
                .HasConstraintName("FK_ApplicationDocuments_MerchantApplications");
        });

        modelBuilder.Entity<ApplicationHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Applicat__3214EC072104B4FA");

            entity.ToTable("ApplicationHistory");

            entity.Property(e => e.ActionDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ActionDescription).HasMaxLength(250);
            entity.Property(e => e.ActionUser).HasMaxLength(50);

            entity.HasOne(d => d.MerchantApplication).WithMany(p => p.ApplicationHistories)
                .HasForeignKey(d => d.MerchantApplicationId)
                .HasConstraintName("FK_ApplicationHistory_MerchantApplications");
        });

        modelBuilder.Entity<MerchantApplication>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Merchant__3214EC071E4AE765");

            // 🚀 İŞTE SİHİRLİ ÇÖZÜM KODU BURADA: Entity Framework'e Trigger'ı tanıtıyoruz
            entity.ToTable(tb => tb.HasTrigger("trg_MerchantApplications_AfterInsert"));

            entity.HasIndex(e => e.City, "IX_MerchantApplications_City");

            entity.HasIndex(e => e.Status, "IX_MerchantApplications_Status");

            entity.HasIndex(e => e.TaxNumber, "UQ_MerchantApplications_TaxNumber").IsUnique();

            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.ApplicationDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.BusinessCategory).HasMaxLength(100);
            entity.Property(e => e.City).HasMaxLength(50);
            entity.Property(e => e.CompanyName).HasMaxLength(200);
            entity.Property(e => e.District).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.EstimatedTurnover).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ExchangeRate).HasColumnType("decimal(10, 4)");
            entity.Property(e => e.HomePhone)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Latitude).HasColumnType("decimal(10, 8)");
            entity.Property(e => e.Longitude).HasColumnType("decimal(11, 8)");
            entity.Property(e => e.ManagerName).HasMaxLength(100);
            entity.Property(e => e.ManagerTcNo)
                .HasMaxLength(11)
                .IsUnicode(false);
            entity.Property(e => e.MobilePhone)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.TaxNumber)
                .HasMaxLength(11)
                .IsUnicode(false);
            entity.Property(e => e.TaxOffice).HasMaxLength(100);
            entity.Property(e => e.WebAddress).HasMaxLength(100);
            entity.Property(e => e.WorkPhone)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}