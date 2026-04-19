package com.jeevandeep.config;

import com.jeevandeep.repository.ClinicSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private ClinicSettingRepository settingRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .authorizeHttpRequests((authz) -> authz
                        .antMatchers("/", "/index.html", "/style.css", "/script.js", "/images/**", "/admin.html")
                        .permitAll()
                        .antMatchers(HttpMethod.POST, "/api/appointments", "/api/reviews", "/api/questions").permitAll()
                        .antMatchers(HttpMethod.GET, "/api/reviews/public", "/api/questions/public").permitAll()
                        .antMatchers(HttpMethod.GET, "/api/appointments").authenticated()
                        .antMatchers(HttpMethod.DELETE, "/api/appointments/**").authenticated()
                        .anyRequest().authenticated())
                .formLogin()
                .loginPage("/admin.html")
                .loginProcessingUrl("/perform_login")
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

        // Check if doctor has previously saved a custom password in the database
        String passwordHash = settingRepository.findById("admin_password_hash")
                .map(s -> s.getValue())
                .orElse(null);

        UserDetails doctor;
        if (passwordHash != null && !passwordHash.isEmpty()) {
            // Use the persisted hash directly (already encoded)
            doctor = User.withUsername("doctor")
                    .password(passwordHash)
                    .roles("ADMIN")
                    .build();
        } else {
            // Fall back to the default password: jeevan123
            doctor = User.withUsername("doctor")
                    .password(encoder.encode("jeevan123"))
                    .roles("ADMIN")
                    .build();
        }

        return new InMemoryUserDetailsManager(doctor);
    }
}
