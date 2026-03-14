import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

// Customer class
class Customer {
    private String name;
    private String email;
    private String passwordHash; // store hashed password

    public Customer(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.passwordHash = hashPassword(password);
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    // Hash password using SHA-256
    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = md.digest(password.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    // Verify password
    public boolean verifyPassword(String password) {
        return this.passwordHash.equals(hashPassword(password));
    }
}

// SecuritySystem class to manage customers
class SecuritySystem {
    private List<Customer> customers;

    public SecuritySystem() {
        customers = new ArrayList<>();
    }

    // Add a new customer
    public void addCustomer(Customer customer) {
        customers.add(customer);
        System.out.println("✅ Customer " + customer.getName() + " added successfully.");
    }

    // Authenticate customer
    public void authenticate(String email, String password) {
        for (Customer c : customers) {
            if (c.getEmail().equalsIgnoreCase(email)) {
                if (c.verifyPassword(password)) {
                    System.out.println("✅ Authentication successful for " + c.getName());
                } else {
                    System.out.println("❌ Incorrect password for " + c.getName());
                }
                return;
            }
        }
        System.out.println("❌ Customer with email " + email + " not found.");
    }
}

// Demo class
public class CustomerSecurityDemo {
    public static void main(String[] args) {
        SecuritySystem securitySystem = new SecuritySystem();

        // Add customers
        Customer alice = new Customer("Alice", "alice@example.com", "AlicePass123");
        Customer bob = new Customer("Bob", "bob@example.com", "BobSecret456");

        securitySystem.addCustomer(alice);
        securitySystem.addCustomer(bob);

        // Authenticate customers
        securitySystem.authenticate("alice@example.com", "AlicePass123"); // correct
        securitySystem.authenticate("bob@example.com", "WrongPassword"); // incorrect
        securitySystem.authenticate("charlie@example.com", "NoUser"); // not found
    }
}