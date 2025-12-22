package org.mql.ai.controllers;

import org.mql.ai.models.AuthRequest;
import org.mql.ai.models.AuthResponse;
import org.mql.ai.models.User;
import org.mql.ai.buisness.UserServiceDefault;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserServiceDefault userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody AuthRequest request) {
        try {
            if (request.getUsername() == null || request.getUsername().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Username is required"));
            }
            
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Email is required"));
            }
            
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Password must be at least 6 characters"));
            }
            
            User user = userService.registerUser( request.getUsername(), request.getEmail(),request.getPassword() );
            
            String token = Base64.getEncoder().encodeToString( (user.getUsername() + ":" + request.getPassword()).getBytes());
            
            AuthResponse response = new AuthResponse(true, "User registered successfully");
            response.setUsername(user.getUsername());
            response.setEmail(user.getEmail());
            response.setRoles(user.getRoles());
            response.setToken(token);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse(false, e.getMessage()));
        }
    }
 
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        try {
            if (request.getUsername() == null || request.getUsername().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Username is required"));
            }
            
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Password is required"));
            }
            
            User user = userService.findByUsername(request.getUsername());
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Invalid username or password"));
            }
            
            if (!userService.validateCredentials(request.getUsername(), request.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Invalid username or password"));
            }
            
            String token = Base64.getEncoder().encodeToString((user.getUsername() + ":" + request.getPassword()).getBytes());
            
            AuthResponse response = new AuthResponse(true, "Login successful");
            response.setUsername(user.getUsername());
            response.setEmail(user.getEmail());
            response.setRoles(user.getRoles());
            response.setToken(token);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AuthResponse(false, "Login failed: " + e.getMessage()));
        }
    }
   
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    
    @GetMapping("/check-username/{username}")
    public ResponseEntity<?> checkUsername(@PathVariable String username) {
        User user = userService.findByUsername(username);
        return ResponseEntity.ok(Map.of(
            "exists", user != null,
            "username", username
        ));
    }
    
    @PutMapping("/{userId}/promote-to-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity promoteToAdmin(@PathVariable Long userId) { 
        try {
            User user = userService.promoteToAdmin(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User promoted to admin successfully");
            response.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "roles", user.getRoles()
            ));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

   
}
