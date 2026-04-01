package com.mediremind.service;

import com.mediremind.dto.request.AppointmentRequest;
import com.mediremind.dto.response.AppointmentResponse;
import com.mediremind.enums.AppointmentStatus;
import com.mediremind.model.Appointment;
import com.mediremind.model.User;
import com.mediremind.repository.AppointmentRepository;
import com.mediremind.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final SecurityUtils securityUtils;

    private AppointmentResponse toResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .doctorName(appointment.getDoctorName())
                .location(appointment.getLocation())
                .appointmentDate(appointment.getAppointmentDate())
                .notes(appointment.getNotes())
                .status(appointment.getStatus())
                .createdAt(appointment.getCreatedAt())
                .build();
    }

    @Transactional
    public AppointmentResponse addAppointment(AppointmentRequest request) {
        User user = securityUtils.getCurrentUser();
        Appointment appointment = Appointment.builder()
                .user(user)
                .doctorName(request.getDoctorName())
                .location(request.getLocation())
                .appointmentDate(request.getAppointmentDate())
                .notes(request.getNotes())
                .build();
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return toResponse(savedAppointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        User user = securityUtils.getCurrentUser();
        return appointmentRepository
                .findByUserIdOrderByAppointmentDateAsc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getUpcomingAppointments() {
        User user = securityUtils.getCurrentUser();
        return appointmentRepository
                .findUpcomingAppointments(
                        user.getId(),
                        LocalDateTime.now(),
                        AppointmentStatus.SCHEDULED
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatus status) {
        User user = securityUtils.getCurrentUser();
        Appointment appointment = appointmentRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(status);
        appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        User user = securityUtils.getCurrentUser();
        Appointment appointment = appointmentRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointmentRepository.delete(appointment);
    }
}