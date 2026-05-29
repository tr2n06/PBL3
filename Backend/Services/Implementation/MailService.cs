using Pbl3.Services.Interface;

namespace Pbl3.Services.Implementation
{
    using Microsoft.Extensions.Options;
    using Pbl3.Config;
    using System.Net;
    using System.Net.Mail;

    public class MailService : IMailService
    {
        private readonly MailSettings mailSettings;

        public MailService(IOptions<MailSettings> options)
        {
            mailSettings = options.Value;
        }

        public async Task SendMail(string toEmail, string subject, string body)
        {
            var smtp = new SmtpClient(mailSettings.Host)
            {
                Port = mailSettings.Port,
                Credentials = new NetworkCredential(
                    mailSettings.Email,
                    mailSettings.Password
                ),
                EnableSsl = true
            };

            var message = new MailMessage
            {
                From = new MailAddress(mailSettings.Email, mailSettings.DisplayName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(toEmail);

            await smtp.SendMailAsync(message);
        }
    }
}
