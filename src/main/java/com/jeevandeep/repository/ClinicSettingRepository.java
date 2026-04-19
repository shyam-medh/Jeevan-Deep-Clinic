package com.jeevandeep.repository;

import com.jeevandeep.model.ClinicSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicSettingRepository extends JpaRepository<ClinicSetting, String> {
}
