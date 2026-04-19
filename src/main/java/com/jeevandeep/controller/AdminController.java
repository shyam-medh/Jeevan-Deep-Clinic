package com.jeevandeep.controller;

import com.jeevandeep.model.ClinicSetting;
import com.jeevandeep.repository.ClinicSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private InMemoryUserDetailsManager userDetailsManager;

    @Autowired
    private ClinicSettingRepository settingRepository;

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters."));
        }

        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();

        // Verify the current password
        UserDetails currentUser = userDetailsManager.loadUserByUsername("doctor");
        if (!encoder.matches(currentPassword, currentUser.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Current password is incorrect."));
        }

        // Encode and update the new password in memory
        String encodedNew = encoder.encode(newPassword);
        UserDetails updatedUser = User.withUsername("doctor")
                .password(encodedNew)
                .roles("ADMIN")
                .build();
        userDetailsManager.updateUser(updatedUser);

        // Persist the encoded hash to the database so it survives server restarts
        ClinicSetting setting = settingRepository.findById("admin_password_hash")
                .orElse(new ClinicSetting("admin_password_hash", ""));
        setting.setValue(encodedNew);
        settingRepository.save(setting);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully!"));
    }
}
