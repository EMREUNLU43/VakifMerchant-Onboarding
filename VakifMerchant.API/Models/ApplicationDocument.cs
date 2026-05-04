using System;
using System.Collections.Generic;

namespace VakifMerchant.API.Models;

public partial class ApplicationDocument
{
    public int Id { get; set; }

    public int MerchantApplicationId { get; set; }

    public string DocumentType { get; set; } = null!;

    public string FilePath { get; set; } = null!;

    public DateTime UploadedDate { get; set; }

    public string? OriginalFileName { get; set; }

    public virtual MerchantApplication MerchantApplication { get; set; } = null!;
}
