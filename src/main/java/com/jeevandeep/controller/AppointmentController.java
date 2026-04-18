package com.jeevandeep.controller;

import com.jeevandeep.model.Appointment;
import com.jeevandeep.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;

    @Autowired
    public AppointmentController(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> bookAppointment(@RequestBody Appointment appointment) {
        // Save the appointment in the database
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        // Prepare JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Appointment successfully booked!");
        response.put("appointmentId", savedAppointment.getId());

        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<?> getAllAppointments() {
        return ResponseEntity.ok(appointmentRepository.findAll());
    }
}
