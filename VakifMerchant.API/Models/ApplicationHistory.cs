using System;
using System.Collections.Generic;

namespace VakifMerchant.API.Models;

public partial class ApplicationHistory
{
    public int Id { get; set; }

    public int MerchantApplicationId { get; set; }

    public DateTime ActionDate { get; set; }

    public string ActionDescription { get; set; } = null!;

    public byte? PreviousStatus { get; set; }

    public byte NewStatus { get; set; }

    public string ActionUser { get; set; } = null!;

    public virtual MerchantApplication MerchantApplication { get; set; } = null!;
}
