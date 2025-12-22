package org.mql.ai.buisness;

import java.util.List;

import org.mql.ai.models.User;
import org.springframework.stereotype.Service;

@Service
public interface UserService {
	User registerUser(String username, String email, String password) throws Exception;
    User findByUsername(String username);
    boolean validateCredentials(String username, String password);
    List<User> getAllUsers();
    boolean deleteUser(String username);
    User promoteToAdmin(Long userId);
}
