using System;
using System.Collections.Generic;
using VakifMerchant.API.Enums;
namespace VakifMerchant.API.Models;

public partial class MerchantApplication
{
    public int Id { get; set; }

    public string CompanyName { get; set; } = null!;

    public string TaxNumber { get; set; } = null!;

    public string TaxOffice { get; set; } = null!;

    public string ManagerName { get; set; } = null!;

    public string ManagerTcNo { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Address { get; set; } = null!;

    public string City { get; set; } = null!;

    public string District { get; set; } = null!;

    public string? WebAddress { get; set; }

    public string BusinessCategory { get; set; } = null!;

    public decimal EstimatedTurnover { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public decimal? ExchangeRate { get; set; }

    public byte Status { get; set; }

    public DateTime ApplicationDate { get; set; }

    public string? HomePhone { get; set; }

    public string? WorkPhone { get; set; }

    public string? MobilePhone { get; set; }

    public virtual ICollection<ApplicationDocument> ApplicationDocuments { get; set; } = new List<ApplicationDocument>();

    public virtual ICollection<ApplicationHistory> ApplicationHistories { get; set; } = new List<ApplicationHistory>();
}
