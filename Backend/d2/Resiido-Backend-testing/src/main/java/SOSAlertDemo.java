// SOSDemo.java
import java.util.ArrayList;
import java.util.List;

// Represents a user
class User {
    private String name;
    private String phoneNumber;

    public User(String name, String phoneNumber) {
        this.name = name;
        this.phoneNumber = phoneNumber;
    }

    public String getName() {
        return name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }
}

// SOS system class
class SOSSystem {
    private List<User> emergencyContacts;

    public SOSSystem() {
        emergencyContacts = new ArrayList<>();
    }

    // Add emergency contact
    public void addEmergencyContact(User contact) {
        emergencyContacts.add(contact);
    }

    // Send SOS
    public void sendSOS(String message, User sender) {
        System.out.println("🚨 SOS ALERT from " + sender.getName() + "!");
        System.out.println("Message: " + message);

        for (User contact : emergencyContacts) {
            System.out.println("Notifying " + contact.getName() + " at " + contact.getPhoneNumber());
        }
        System.out.println("SOS sent successfully.\n");
    }
}

// Main class to test SOS system
public class SOSDemo {
    public static void main(String[] args) {
        // Create users
        User alice = new User("Alice", "+94123456789");
        User bob = new User("Bob", "+94119876543");

        // Initialize SOS system
        SOSSystem sosSystem = new SOSSystem();

        // Add emergency contacts
        sosSystem.addEmergencyContact(alice);
        sosSystem.addEmergencyContact(bob);

        // Simulate sending SOS
        User sender = new User("Jeny", "+94771234567");
        sosSystem.sendSOS("I need help immediately at Pettah!", sender);
    }
}