namespace VakifMerchant.API.DTOs
{
    public class MerchantApplicationSearchDto
    {
        public string? TaxNumber { get; set; }
        public string? CompanyName { get;set; }
        public int? Status{ get;set; }  
        public string? City { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public int PageNumber { get; set; } = 1; 
        public int PageSize { get; set; } = 10;


    }
}
