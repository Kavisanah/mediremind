package com.mediremind.controller;

import com.mediremind.dto.request.MedicineRequest;
import com.mediremind.dto.response.ApiResponse;
import com.mediremind.dto.response.MedicineResponse;
import com.mediremind.service.FileStorageService;
import com.mediremind.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;
    private final FileStorageService fileStorageService;

    public MedicineController(MedicineService medicineService,
                              FileStorageService fileStorageService) {
        this.medicineService = medicineService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicineResponse>> addMedicine(
            @Valid @RequestBody MedicineRequest request) {
        MedicineResponse response = medicineService.addMedicine(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Medicine added successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicineResponse>>> getAllMedicines() {
        List<MedicineResponse> response = medicineService.getAllMedicines();
        return ResponseEntity
                .ok(ApiResponse.success("Medicines retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> getMedicineById(
            @PathVariable Long id) {
        MedicineResponse response = medicineService.getMedicineById(id);
        return ResponseEntity
                .ok(ApiResponse.success("Medicine retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponse>> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequest request) {
        MedicineResponse response = medicineService.updateMedicine(id, request);
        return ResponseEntity
                .ok(ApiResponse.success("Medicine updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(
            @PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity
                .ok(ApiResponse.success("Medicine deleted successfully"));
    }

    @PostMapping("/{id}/prescription")
    public ResponseEntity<ApiResponse<String>> uploadPrescription(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file);
        medicineService.updatePrescriptionFile(id, fileName);
        return ResponseEntity
                .ok(ApiResponse.success("Prescription uploaded successfully", fileName));
    }
}