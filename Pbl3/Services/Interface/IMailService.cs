namespace Pbl3.Services.Interface
{
    public interface IMailService
    {
        Task SendMail(string toEmail, string subject, string body);
    }
}
