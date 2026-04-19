package com.jeevandeep.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF so our frontend Javascript can POST appointments freely
            .csrf().disable()
            
            // Define Authorization rules
            .authorizeHttpRequests((authz) -> authz
                // Patients are allowed to see the main page, static assets, and the admin UI skeleton
                .antMatchers("/", "/index.html", "/style.css", "/script.js", "/images/**", "/admin.html").permitAll()
                // Patients are allowed to POST their appointment forms
                .antMatchers(HttpMethod.POST, "/api/appointments").permitAll()
                
                // Doctors must be authenticated to fetch the appointment data
                .antMatchers(HttpMethod.GET, "/api/appointments").authenticated()
                .antMatchers(HttpMethod.DELETE, "/api/appointments/**").authenticated()
                
                // Any other unknown request must be authenticated as a fallback
                .anyRequest().authenticated()
            )
            // Use Form Login to connect to the custom Clinic Portal UI
            .formLogin()
                .loginPage("/admin.html")          // Point Spring to your custom UI
                .loginProcessingUrl("/perform_login") // The hidden API that validates the password
                .defaultSuccessUrl("/admin.html", true)
                .failureUrl("/admin.html?error=true")
                .permitAll()
            .and()
            .logout()
                .logoutUrl("/perform_logout")
                .logoutSuccessUrl("/admin.html")
                .permitAll();
            
        return http.build();
    }

    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        
        // Define the Doctor's Credentials
        UserDetails doctor = User.withUsername("doctor")
            .password(encoder.encode("adminpassword123"))
            .roles("ADMIN")
            .build();
            
        return new InMemoryUserDetailsManager(doctor);
    }
}
