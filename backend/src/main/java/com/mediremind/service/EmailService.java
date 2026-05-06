package com.mediremind.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.backend-url:http://localhost:8080}")
    private String backendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Patient notifications (plain text is fine here)
    // ─────────────────────────────────────────────────────────────────────────

    @Async
    public void sendMedicineReminder(String toEmail, String userName,
                                     String medicineName, String dosage,
                                     String notes, String reminderTime) {
        sendHtml(toEmail,
                "MediRemind — Time to take your medicine! 💊",
                buildMedicineReminderHtml(userName, medicineName, dosage, notes, reminderTime));
    }

    @Async
    public void sendAppointmentReminder(String toEmail, String userName,
                                        String doctorName, String location,
                                        String appointmentDate) {
        sendHtml(toEmail,
                "MediRemind — Appointment Reminder Tomorrow! 📅",
                buildAppointmentReminderHtml(userName, doctorName, location, appointmentDate));
    }

    @Async
    public void sendWeeklyReport(String toEmail, String userName,
                                 long taken, long missed) {
        sendHtml(toEmail,
                "MediRemind — Your Weekly Medicine Report 📊",
                buildWeeklyReportHtml(userName, taken, missed));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Observer notifications
    // ─────────────────────────────────────────────────────────────────────────

    @Async
    public void sendObserverMedicineReminder(List<String> observerEmails,
                                             String patientName, String medicineName,
                                             String dosage, String notes, String reminderTime) {
        String subject = "MediRemind — " + patientName + " has a medicine reminder 💊";
        String html    = buildMedicineReminderHtml(patientName + " (your care recipient)",
                medicineName, dosage, notes, reminderTime);
        observerEmails.forEach(email -> sendHtml(email, subject, html));
    }

    @Async
    public void sendObserverMissedDoseAlert(List<String> observerEmails,
                                            String patientName, String medicineName,
                                            String dosage, String scheduledTime) {
        String subject = "⚠️ MediRemind — " + patientName + " missed a dose";
        String html = "<div style='font-family:sans-serif;max-width:520px;margin:auto;padding:32px 24px'>"
                + "<h2 style='color:#dc2626'>⚠️ Missed Dose Alert</h2>"
                + "<p><strong>" + patientName + "</strong> missed their scheduled dose:</p>"
                + "<table style='width:100%;border-collapse:collapse;margin:16px 0'>"
                + row("Medicine",  medicineName)
                + row("Dosage",    nvl(dosage))
                + row("Scheduled", scheduledTime)
                + "</table>"
                + "<p style='color:#6b7280'>Please check in with them if possible.</p>"
                + footer()
                + "</div>";
        observerEmails.forEach(email -> sendHtml(email, subject, html));
    }

    @Async
    public void sendObserverAppointmentReminder(List<String> observerEmails,
                                                String patientName, String doctorName,
                                                String location, String appointmentDate) {
        String subject = "MediRemind — " + patientName + "'s appointment is tomorrow 📅";
        String html    = buildAppointmentReminderHtml(
                patientName + " (your care recipient)", doctorName, location, appointmentDate);
        observerEmails.forEach(email -> sendHtml(email, subject, html));
    }

    @Async
    public void sendObserverWeeklyReport(List<String> observerEmails,
                                         String patientName, long taken, long missed) {
        String subject = "MediRemind — Weekly Report for " + patientName + " 📊";
        String html    = buildWeeklyReportHtml(patientName + " (your care recipient)", taken, missed);
        observerEmails.forEach(email -> sendHtml(email, subject, html));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Observer INVITE — HTML email with a proper "Accept Invite" button
    //  (no raw token URL shown to the user)
    // ─────────────────────────────────────────────────────────────────────────

    @Async
    public void sendObserverInvite(String toEmail, String patientName,
                                   String relationshipLabel, String token) {

        String acceptUrl = backendUrl + "/api/observers/accept?token=" + token;
        String subject   = patientName + " added you as their health guardian on MediRemind 🛡️";

        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Health Guardian Invitation</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f0fafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0fafa;padding:40px 16px;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(14,82,89,0.10);">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1ea3a8 0%%,#106771 100%%);padding:36px 40px;text-align:center;">
                        <div style="font-size:48px;margin-bottom:12px;">🛡️</div>
                        <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;letter-spacing:-0.3px;">
                          You've been invited as a<br>Health Guardian
                        </h1>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:36px 40px;">
                        <p style="font-size:16px;color:#374151;line-height:1.7;margin:0 0 20px;">
                          Hi there! <strong style="color:#1ea3a8;">%s</strong> has added you as their
                          <strong>"%s"</strong> on MediRemind — a health tracking app that helps
                          manage medicines and appointments.
                        </p>

                        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
                          As a guardian, you'll receive automatic email alerts when:
                        </p>

                        <!-- Notification list -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0fafa;border-radius:14px;padding:20px 24px;margin-bottom:28px;">
                          <tr><td style="padding:6px 0;font-size:14px;color:#374151;">💊&nbsp; Medicine reminder time</td></tr>
                          <tr><td style="padding:6px 0;font-size:14px;color:#374151;">⚠️&nbsp; A dose has been missed</td></tr>
                          <tr><td style="padding:6px 0;font-size:14px;color:#374151;">📅&nbsp; Upcoming appointment tomorrow</td></tr>
                          <tr><td style="padding:6px 0;font-size:14px;color:#374151;">📊&nbsp; Weekly health adherence report</td></tr>
                        </table>

                        <!-- CTA Button -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                          <tr>
                            <td align="center">
                              <a href="%s"
                                 style="display:inline-block;background:linear-gradient(135deg,#1ea3a8,#106771);
                                        color:#ffffff;font-size:16px;font-weight:700;
                                        text-decoration:none;padding:16px 48px;
                                        border-radius:14px;letter-spacing:0.2px;
                                        box-shadow:0 4px 20px rgba(30,163,168,0.40);">
                                ✅ &nbsp;Accept Invite
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;margin:0;">
                          No app or account needed — just click the button above.<br>
                          If you didn't expect this, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f0f0f0;text-align:center;">
                        <p style="font-size:12px;color:#9ca3af;margin:0;">
                          Sent by <strong style="color:#1ea3a8;">MediRemind</strong> on behalf of %s
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(patientName, relationshipLabel, acceptUrl, patientName);

        sendHtml(toEmail, subject, html);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  HTML builders for other email types
    // ─────────────────────────────────────────────────────────────────────────

    private String buildMedicineReminderHtml(String userName, String medicineName,
                                             String dosage, String notes, String time) {
        return wrap("💊 Medicine Reminder", "#1ea3a8",
                "<p style='font-size:16px;color:#374151;margin:0 0 20px;'>Hello <strong>" + userName + "</strong>,</p>"
                        + "<p style='color:#374151;margin:0 0 16px;'>It's time to take your medicine:</p>"
                        + "<table style='width:100%;border-collapse:collapse;margin:0 0 20px'>"
                        + row("Medicine", medicineName)
                        + row("Dosage",   nvl(dosage))
                        + (notes != null && !notes.isBlank() ? row("Notes", notes) : "")
                        + row("Time",     time)
                        + "</table>"
                        + "<p style='color:#6b7280;font-size:14px;'>Please mark it as taken in the app.</p>");
    }

    private String buildAppointmentReminderHtml(String userName, String doctorName,
                                                String location, String date) {
        return wrap("📅 Appointment Tomorrow", "#8b5cf6",
                "<p style='font-size:16px;color:#374151;margin:0 0 20px;'>Hello <strong>" + userName + "</strong>,</p>"
                        + "<p style='color:#374151;margin:0 0 16px;'>You have an upcoming appointment:</p>"
                        + "<table style='width:100%;border-collapse:collapse;margin:0 0 20px'>"
                        + row("Doctor",   doctorName)
                        + row("Location", nvl(location))
                        + row("Date",     date)
                        + "</table>"
                        + "<p style='color:#6b7280;font-size:14px;'>Please be prepared!</p>");
    }

    private String buildWeeklyReportHtml(String name, long taken, long missed) {
        long total = taken + missed;
        int  pct   = total > 0 ? (int) Math.round((taken * 100.0) / total) : 0;
        String color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
        String msg   = pct >= 80 ? "Great job this week! Keep it up! 🎉"
                : pct >= 50 ? "Room to improve — try to stay consistent!"
                : "Please try to improve adherence next week.";
        return wrap("📊 Weekly Medicine Report", "#f59e0b",
                "<p style='font-size:16px;color:#374151;margin:0 0 20px;'>Hello <strong>" + name + "</strong>,</p>"
                        + "<p style='color:#374151;margin:0 0 16px;'>Here's your weekly summary:</p>"
                        + "<table style='width:100%;border-collapse:collapse;margin:0 0 16px'>"
                        + row("✅ Taken",  String.valueOf(taken))
                        + row("❌ Missed", String.valueOf(missed))
                        + "</table>"
                        + "<div style='text-align:center;margin:20px 0'>"
                        + "<span style='font-size:40px;font-weight:800;color:" + color + "'>" + pct + "%</span>"
                        + "<p style='color:#6b7280;font-size:13px;margin:4px 0 0;'>Adherence rate</p></div>"
                        + "<p style='color:#374151;font-size:14px;text-align:center;'>" + msg + "</p>");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private String wrap(String title, String color, String content) {
        return "<!DOCTYPE html><html><body style='margin:0;padding:0;background:#f0fafa;font-family:sans-serif;'>"
                + "<table width='100%' style='padding:32px 16px;'><tr><td align='center'>"
                + "<table width='520' style='background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(14,82,89,0.08);'>"
                + "<tr><td style='background:" + color + ";padding:28px 32px;'>"
                + "<h2 style='color:#fff;margin:0;font-size:20px;'>" + title + "</h2>"
                + "</td></tr>"
                + "<tr><td style='padding:28px 32px;'>" + content + footer() + "</td></tr>"
                + "</table></td></tr></table>"
                + "</body></html>";
    }

    private String row(String label, String value) {
        return "<tr>"
                + "<td style='padding:8px 12px;background:#f9fafb;font-size:12px;font-weight:600;"
                + "color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;width:35%;border-radius:6px;'>" + label + "</td>"
                + "<td style='padding:8px 12px;font-size:14px;color:#374151;'>" + value + "</td>"
                + "</tr>";
    }

    private String footer() {
        return "<p style='font-size:12px;color:#9ca3af;margin-top:24px;border-top:1px solid #f0f0f0;padding-top:16px;'>— MediRemind Team</p>";
    }

    private void sendHtml(String to, String subject, String htmlContent) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);   // true = isHtml
            mailSender.send(msg);
        } catch (MessagingException e) {
            // Fallback to plain text so reminders never fail silently
            throw new RuntimeException("Failed to send email to " + to, e);
        }
    }

    private String nvl(String s) { return s != null && !s.isBlank() ? s : "—"; }
}
