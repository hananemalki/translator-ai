package org.mql.ai.config;

import org.mql.ai.buisness.UserServiceDefault;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final UserServiceDefault userService;

    public SecurityConfig(@Lazy UserServiceDefault userService) {
        this.userService = userService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/api/translator/health").permitAll()
                .antMatchers("/api/translator/languages").permitAll()
                .antMatchers("/api/auth/signup").permitAll()
                .antMatchers("/api/auth/login").permitAll()
                .antMatchers("/api/auth/check-username/**").permitAll()
                .antMatchers("/api/complaints/types").permitAll()
                .antMatchers("/api/translator/translate/**").authenticated()
                .antMatchers("/api/complaints/all").hasRole("ADMIN")
                .antMatchers("/api/complaints/status/**").hasRole("ADMIN")
                .antMatchers("/api/complaints/stats").hasRole("ADMIN")
                .antMatchers("/api/complaints/*/status").hasRole("ADMIN")
                .antMatchers("/api/complaints/*/response").hasRole("ADMIN")
                .antMatchers("/api/complaints/*/priority").hasRole("ADMIN")
                .antMatchers("/api/auth/*/promote-to-admin").hasRole("ADMIN")  // ✅ Ajouté
                .antMatchers("/api/auth/users").authenticated()
                .antMatchers("/api/complaints/**").authenticated()
                .anyRequest().authenticated()
            .and()
            .httpBasic();

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}