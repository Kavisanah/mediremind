package com.mediremind.model;

import com.mediremind.enums.ObserverStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "observer_links", indexes = {
        @Index(name = "idx_ol_patient",  columnList = "patient_id"),
        @Index(name = "idx_ol_observer", columnList = "observer_id"),
        // FIX: removed unique = true — token is set to null after invite is accepted.
        // Multiple accepted invites all become null, which crashes MySQL unique constraint.
        @Index(name = "idx_ol_token",    columnList = "invite_token")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ObserverLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @ToString.Exclude
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "observer_id")
    @ToString.Exclude
    private User observer;

    @Column(name = "observer_email", nullable = false, length = 100)
    private String observerEmail;

    @Column(name = "relationship_label", length = 60)
    private String relationshipLabel;

    @Column(name = "invite_token", length = 128)
    private String inviteToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ObserverStatus status = ObserverStatus.PENDING;

    @Column(name = "notify_medicine_reminder") @Builder.Default
    private Boolean notifyMedicineReminder = true;

    @Column(name = "notify_missed_dose") @Builder.Default
    private Boolean notifyMissedDose = true;

    @Column(name = "notify_appointment") @Builder.Default
    private Boolean notifyAppointment = true;

    @Column(name = "notify_weekly_report") @Builder.Default
    private Boolean notifyWeeklyReport = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}
