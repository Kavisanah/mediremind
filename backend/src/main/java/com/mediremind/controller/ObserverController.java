package com.mediremind.controller;

import com.mediremind.dto.request.ObserverInviteRequest;
import com.mediremind.dto.response.ApiResponse;
import com.mediremind.dto.response.ObserverLinkResponse;
import com.mediremind.service.ObserverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/observers")
@RequiredArgsConstructor
public class ObserverController {

    private final ObserverService observerService;

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<ObserverLinkResponse>> invite(
            @Valid @RequestBody ObserverInviteRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Invite sent successfully", observerService.inviteObserver(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ObserverLinkResponse>>> getMyObservers() {
        return ResponseEntity.ok(
                ApiResponse.success("Observers fetched", observerService.getMyObservers()));
    }

    @DeleteMapping("/{linkId}")
    public ResponseEntity<ApiResponse<Void>> revokeObserver(@PathVariable Long linkId) {
        observerService.revokeObserver(linkId);
        return ResponseEntity.ok(ApiResponse.success("Observer removed"));
    }

    @GetMapping("/watching")
    public ResponseEntity<ApiResponse<List<ObserverLinkResponse>>> getPatientsIWatch() {
        return ResponseEntity.ok(
                ApiResponse.success("Patients fetched", observerService.getPatientsIWatch()));
    }

    // ── Accept invite — returns styled HTML page, no JWT required ───────────

    @GetMapping(value = "/accept", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> acceptInvite(@RequestParam String token) {
        try {
            ObserverLinkResponse result = observerService.acceptInvite(token);
            return ResponseEntity.ok(buildSuccessPage(result.getPatientName()));
        } catch (Exception e) {
            return ResponseEntity.ok(buildErrorPage(e.getMessage()));
        }
    }

    // ── HTML pages (shown directly in the browser after clicking email CTA) ─

    private String buildSuccessPage(String patientName) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Invite Accepted — MediRemind</title>
              <style>
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                body {
                  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
                  background: linear-gradient(135deg, #edfafa 0%%, #f0fdf4 50%%, #f5f3ff 100%%);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 24px;
                }
                .card {
                  background: white;
                  border-radius: 28px;
                  padding: 52px 44px;
                  max-width: 460px;
                  width: 100%%;
                  text-align: center;
                  box-shadow: 0 20px 60px rgba(14,82,89,0.13), 0 0 0 1px rgba(14,82,89,0.05);
                  animation: pop 0.5s cubic-bezier(0.22,1,0.36,1) both;
                }
                @keyframes pop {
                  0%% { opacity: 0; transform: scale(0.88) translateY(24px); }
                  100%% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .icon-wrap {
                  width: 80px; height: 80px;
                  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
                  border-radius: 50%%;
                  display: flex; align-items: center; justify-content: center;
                  font-size: 40px;
                  margin: 0 auto 24px;
                  box-shadow: 0 0 0 12px rgba(34,197,94,0.08);
                  animation: pulse 2.5s ease-in-out infinite;
                }
                @keyframes pulse {
                  0%%, 100%% { box-shadow: 0 0 0 12px rgba(34,197,94,0.08); }
                  50%% { box-shadow: 0 0 0 20px rgba(34,197,94,0.04); }
                }
                h1 { font-size: 26px; font-weight: 700; color: #111827; margin-bottom: 12px; }
                .patient { color: #1ea3a8; font-weight: 700; }
                p { font-size: 15px; color: #6b7280; line-height: 1.7; margin-bottom: 20px; }
                .notify-box {
                  background: linear-gradient(135deg, #f0fdf4, #f5f3ff);
                  border: 1px solid #d1fae5;
                  border-radius: 16px;
                  padding: 20px 24px;
                  margin: 20px 0;
                  text-align: left;
                }
                .notify-box .label {
                  font-size: 11px; font-weight: 700; color: #15803d;
                  text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px;
                }
                .notify-item {
                  display: flex; align-items: center; gap: 10px;
                  font-size: 14px; color: #374151; padding: 5px 0;
                }
                .badge {
                  display: inline-flex; align-items: center; gap: 6px;
                  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
                  color: #15803d; font-size: 13px; font-weight: 700;
                  padding: 8px 20px; border-radius: 999px; margin-top: 8px;
                }
                .footer { font-size: 12px; color: #9ca3af; margin-top: 24px; }
                .footer strong { color: #1ea3a8; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="icon-wrap">✅</div>
                <h1>You're now a Guardian!</h1>
                <p>
                  You've accepted the invitation to monitor
                  <span class="patient">%s</span>'s health.
                  You'll receive email alerts automatically — no app needed.
                </p>
                <div class="notify-box">
                  <div class="label">You'll be notified about</div>
                  <div class="notify-item">💊 Medicine reminders</div>
                  <div class="notify-item">⚠️ Missed dose alerts</div>
                  <div class="notify-item">📅 Appointment reminders</div>
                  <div class="notify-item">📊 Weekly health reports</div>
                </div>
                <p>Everything arrives in your inbox. No account or install needed.</p>
                <span class="badge">✓ Invite accepted</span>
                <p class="footer">Powered by <strong>MediRemind</strong></p>
              </div>
            </body>
            </html>
            """.formatted(patientName);
    }

    private String buildErrorPage(String reason) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Invalid Link — MediRemind</title>
              <style>
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  background: linear-gradient(135deg, #fff1f1 0%%, #fafafa 100%%);
                  min-height: 100vh;
                  display: flex; align-items: center; justify-content: center;
                  padding: 24px;
                }
                .card {
                  background: white;
                  border-radius: 28px; padding: 52px 44px;
                  max-width: 460px; width: 100%%;
                  text-align: center;
                  box-shadow: 0 20px 60px rgba(0,0,0,0.10);
                  animation: pop 0.5s cubic-bezier(0.22,1,0.36,1) both;
                }
                @keyframes pop {
                  0%% { opacity: 0; transform: scale(0.88) translateY(24px); }
                  100%% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .icon-wrap {
                  width: 80px; height: 80px;
                  background: #fff1f1; border-radius: 50%%;
                  display: flex; align-items: center; justify-content: center;
                  font-size: 40px; margin: 0 auto 24px;
                }
                h1 { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 12px; }
                p  { font-size: 15px; color: #6b7280; line-height: 1.7; }
                .reason {
                  background: #fff1f1; border: 1px solid #fecaca;
                  border-radius: 12px; padding: 12px 16px;
                  margin: 16px 0; font-size: 13px; color: #dc2626;
                }
                .footer { font-size: 12px; color: #9ca3af; margin-top: 24px; }
                .footer strong { color: #1ea3a8; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="icon-wrap">❌</div>
                <h1>Link Not Valid</h1>
                <div class="reason">%s</div>
                <p>Please ask the patient to send a new invitation.</p>
                <p class="footer">Powered by <strong>MediRemind</strong></p>
              </div>
            </body>
            </html>
            """.formatted(reason != null ? reason : "This invite link has expired or already been used.");
    }
}
