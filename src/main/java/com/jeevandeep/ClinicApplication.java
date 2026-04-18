package com.jeevandeep;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ClinicApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicApplication.class, args);
        System.out.println("==================================================");
        System.out.println("🚀 Jeevan Deep Clinic App Started");
        System.out.println("🌐 Access the website at: http://localhost:8080");
        System.out.println("==================================================");
    }
}
