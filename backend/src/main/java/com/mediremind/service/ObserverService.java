package com.mediremind.service;

import com.mediremind.dto.request.ObserverInviteRequest;
import com.mediremind.dto.response.ObserverLinkResponse;
import com.mediremind.enums.ObserverStatus;
import com.mediremind.model.ObserverLink;
import com.mediremind.model.User;
import com.mediremind.repository.ObserverLinkRepository;
import com.mediremind.repository.UserRepository;
import com.mediremind.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ObserverService {

    private final ObserverLinkRepository observerLinkRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SecurityUtils securityUtils;

    @Transactional
    public ObserverLinkResponse inviteObserver(ObserverInviteRequest request) {
        User patient = securityUtils.getCurrentUser();

        if (observerLinkRepository.existsByPatientIdAndObserverEmailAndStatusNot(
                patient.getId(), request.getObserverEmail(), ObserverStatus.REVOKED)) {
            throw new IllegalStateException("Observer already invited or active.");
        }

        String token = UUID.randomUUID().toString();

        ObserverLink link = ObserverLink.builder()
                .patient(patient)
                .observerEmail(request.getObserverEmail())
                .relationshipLabel(request.getRelationshipLabel())
                .inviteToken(token)
                .notifyMedicineReminder(request.isNotifyMedicineReminder())
                .notifyMissedDose(request.isNotifyMissedDose())
                .notifyAppointment(request.isNotifyAppointment())
                .notifyWeeklyReport(request.isNotifyWeeklyReport())
                .status(ObserverStatus.PENDING)
                .build();

        observerLinkRepository.save(link);

        emailService.sendObserverInvite(
                request.getObserverEmail(),
                patient.getName(),
                request.getRelationshipLabel(),
                token
        );

        return toResponse(link);
    }

    // FIX 1: was only fetching ACTIVE — PENDING guardians never appeared.
    // FIX 2: added @Transactional(readOnly=true) — without it the Hibernate session
    // closes after the query, so calling link.getPatient().getName() in toResponse()
    // throws LazyInitializationException → 500 error → "Failed to load guardians".
    @Transactional(readOnly = true)
    public List<ObserverLinkResponse> getMyObservers() {
        User patient = securityUtils.getCurrentUser();
        return observerLinkRepository
                .findByPatientIdAndStatusIn(
                        patient.getId(),
                        List.of(ObserverStatus.ACTIVE, ObserverStatus.PENDING)
                )
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void revokeObserver(Long linkId) {
        User patient = securityUtils.getCurrentUser();
        ObserverLink link = observerLinkRepository.findById(linkId)
                .orElseThrow(() -> new RuntimeException("Observer link not found"));

        if (!link.getPatient().getId().equals(patient.getId())) {
            throw new RuntimeException("Not authorized to remove this observer.");
        }
        link.setStatus(ObserverStatus.REVOKED);
        observerLinkRepository.save(link);
    }

    @Transactional
    public ObserverLinkResponse acceptInvite(String token) {
        ObserverLink link = observerLinkRepository.findByInviteToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired invite link."));

        if (link.getStatus() != ObserverStatus.PENDING) {
            throw new RuntimeException("Invite is no longer valid.");
        }

        userRepository.findByEmail(link.getObserverEmail())
                .ifPresent(link::setObserver);

        link.setStatus(ObserverStatus.ACTIVE);
        link.setAcceptedAt(LocalDateTime.now());
        link.setInviteToken(null);
        observerLinkRepository.save(link);
        return toResponse(link);
    }

    public List<ObserverLinkResponse> getPatientsIWatch() {
        User observer = securityUtils.getCurrentUser();
        return observerLinkRepository
                .findByObserverIdAndStatus(observer.getId(), ObserverStatus.ACTIVE)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<String> getObserverEmailsForPatient(Long patientId, NotifyType type) {
        return observerLinkRepository
                .findByPatientIdAndStatus(patientId, ObserverStatus.ACTIVE)
                .stream()
                .filter(ol -> switch (type) {
                    case MEDICINE_REMINDER -> Boolean.TRUE.equals(ol.getNotifyMedicineReminder());
                    case MISSED_DOSE       -> Boolean.TRUE.equals(ol.getNotifyMissedDose());
                    case APPOINTMENT       -> Boolean.TRUE.equals(ol.getNotifyAppointment());
                    case WEEKLY_REPORT     -> Boolean.TRUE.equals(ol.getNotifyWeeklyReport());
                })
                .map(ObserverLink::getObserverEmail)
                .collect(Collectors.toList());
    }

    public enum NotifyType {
        MEDICINE_REMINDER, MISSED_DOSE, APPOINTMENT, WEEKLY_REPORT
    }

    private ObserverLinkResponse toResponse(ObserverLink link) {
        return ObserverLinkResponse.builder()
                .id(link.getId())
                .patientName(link.getPatient().getName())
                .observerEmail(link.getObserverEmail())
                .observerName(link.getObserver() != null ? link.getObserver().getName() : null)
                .relationshipLabel(link.getRelationshipLabel())
                .status(link.getStatus().name())
                .notifyMedicineReminder(link.getNotifyMedicineReminder())
                .notifyMissedDose(link.getNotifyMissedDose())
                .notifyAppointment(link.getNotifyAppointment())
                .notifyWeeklyReport(link.getNotifyWeeklyReport())
                .createdAt(link.getCreatedAt())
                .acceptedAt(link.getAcceptedAt())
                .build();
    }
}
