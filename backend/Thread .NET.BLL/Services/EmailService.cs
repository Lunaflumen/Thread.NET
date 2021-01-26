using MimeKit;
using MailKit.Net.Smtp;
using System.Threading.Tasks;
using System.IO;

namespace Thread_.NET.BLL.Services
{
    public sealed class EmailService
    {
        public async Task SendEmailAsync(string email, string subject, string userName = "", string avatar = "", string body = "", string img = "", string href = "")
        {
            if (subject == "New Like!")
            {
                var emailMessage = new MimeMessage();
                string path = Path.GetFullPath("like-email.html");

                using (StreamReader sr = new StreamReader(path))
                {
                    string message = await sr.ReadToEndAsync();

                    if (img != "")
                    {
                        message = message.Replace("<!--img-->", img);
                    }
                    else
                    {
                        message = message.Remove(5108, 173);
                    }

                    emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                    {
                        Text = message
                            .Replace("<!--avatar-->", avatar)
                            .Replace("<!--userName-->", userName)
                            .Replace("<!--body-->", body)
                            .Replace("<!--href-->", href)
                    };
                }

                emailMessage.From.Add(new MailboxAddress("Thread.NET", "Email"));
                emailMessage.To.Add(new MailboxAddress("", email));
                emailMessage.Subject = subject;

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync("smtp.gmail.com", 465, true);
                    await client.AuthenticateAsync("Email", "Password");
                    await client.SendAsync(emailMessage);

                    await client.DisconnectAsync(true);
                }
            }
            else if(subject == $"{userName} send you a post.")
            {
                var emailMessage = new MimeMessage();
                string path = Path.GetFullPath("post-email.html");

                using (StreamReader sr = new StreamReader(path))
                {
                    string message = await sr.ReadToEndAsync();

                    if (img != "")
                    {
                        message = message.Replace("<!--img-->", img);
                    }
                    else
                    {
                        message = message.Remove(5147, 173);
                    }

                    emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                    {
                        Text = message
                            .Replace("<!--userName-->", userName)
                            .Replace("<!--avatar-->", avatar)
                            .Replace("<!--userName-->", userName)
                            .Replace("<!--body-->", body)
                            .Replace("<!--href-->", href)
                    };
                }

                emailMessage.From.Add(new MailboxAddress("Thread.NET", "Email"));
                emailMessage.To.Add(new MailboxAddress("", email));
                emailMessage.Subject = subject;

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync("smtp.gmail.com", 465, true);
                    await client.AuthenticateAsync("Email", "Password");
                    await client.SendAsync(emailMessage);

                    await client.DisconnectAsync(true);
                }
            }
            else if (subject == "Reset Password")
            {
                var emailMessage = new MimeMessage();

                emailMessage.From.Add(new MailboxAddress("Thread.NET", "Email"));
                emailMessage.To.Add(new MailboxAddress("", email));
                emailMessage.Subject = subject;
                emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                {
                    Text = body
                };

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync("smtp.gmail.com", 465, true);
                    await client.AuthenticateAsync("Email", "Password");
                    await client.SendAsync(emailMessage);

                    await client.DisconnectAsync(true);
                }
            }
        }
    }
}
