package com.jeevandeep.model;

import javax.persistence.*;

@Entity
@Table(name = "clinic_settings")
public class ClinicSetting {

    @Id
    @Column(name = "setting_key", nullable = false, unique = true)
    private String key;

    @Column(name = "setting_value", nullable = false, length = 500)
    private String value;

    public ClinicSetting() {}

    public ClinicSetting(String key, String value) {
        this.key = key;
        this.value = value;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
