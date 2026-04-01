package com.mediremind.service;

import com.mediremind.dto.request.MedicineRequest;
import com.mediremind.dto.response.MedicineResponse;
import com.mediremind.model.Medicine;
import com.mediremind.model.MedicineSchedule;
import com.mediremind.model.User;
import com.mediremind.repository.MedicineRepository;
import com.mediremind.repository.MedicineScheduleRepository;
import com.mediremind.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final MedicineScheduleRepository medicineScheduleRepository;
    private final SecurityUtils securityUtils;

    private MedicineResponse toResponse(Medicine medicine) {
        List<LocalTime> reminderTimes = medicineScheduleRepository
                .findByMedicineId(medicine.getId())
                .stream()
                .map(MedicineSchedule::getReminderTime)
                .toList();

        return MedicineResponse.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .dosage(medicine.getDosage())
                .frequency(medicine.getFrequency())
                .startDate(medicine.getStartDate())
                .endDate(medicine.getEndDate())
                .notes(medicine.getNotes())
                .prescriptionFile(medicine.getPrescriptionFile())
                .isActive(medicine.getIsActive())
                .reminderTimes(reminderTimes)
                .createdAt(medicine.getCreatedAt())
                .build();
    }

    @Transactional
    public MedicineResponse addMedicine(MedicineRequest request) {
        User user = securityUtils.getCurrentUser();

        Medicine medicine = Medicine.builder()
                .user(user)
                .name(request.getName())
                .dosage(request.getDosage())
                .frequency(request.getFrequency())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .notes(request.getNotes())
                .build();

        Medicine savedMedicine = medicineRepository.save(medicine);

        List<MedicineSchedule> schedules = request.getReminderTimes()
                .stream()
                .map(time -> MedicineSchedule.builder()
                        .medicine(savedMedicine)
                        .reminderTime(time)
                        .build())
                .toList();

        medicineScheduleRepository.saveAll(schedules);
        return toResponse(savedMedicine);
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicines() {
        User user = securityUtils.getCurrentUser();
        return medicineRepository.findByUserIdAndIsActiveTrue(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        User user = securityUtils.getCurrentUser();
        Medicine medicine = medicineRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        return toResponse(medicine);
    }

    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        User user = securityUtils.getCurrentUser();
        Medicine medicine = medicineRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        medicine.setName(request.getName());
        medicine.setDosage(request.getDosage());
        medicine.setFrequency(request.getFrequency());
        medicine.setStartDate(request.getStartDate());
        medicine.setEndDate(request.getEndDate());
        medicine.setNotes(request.getNotes());

        medicineRepository.save(medicine);

        medicineScheduleRepository.deleteByMedicineId(medicine.getId());

        List<MedicineSchedule> schedules = request.getReminderTimes()
                .stream()
                .map(time -> MedicineSchedule.builder()
                        .medicine(medicine)
                        .reminderTime(time)
                        .build())
                .toList();

        medicineScheduleRepository.saveAll(schedules);
        return toResponse(medicine);
    }

    @Transactional
    public void deleteMedicine(Long id) {
        User user = securityUtils.getCurrentUser();
        Medicine medicine = medicineRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        medicine.setIsActive(false);
        medicineRepository.save(medicine);
    }

    @Transactional
    public void updatePrescriptionFile(Long id, String fileName) {
        User user = securityUtils.getCurrentUser();
        Medicine medicine = medicineRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        medicine.setPrescriptionFile(fileName);
        medicineRepository.save(medicine);
    }
}