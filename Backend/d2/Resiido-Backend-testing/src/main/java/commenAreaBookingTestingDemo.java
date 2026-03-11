import java.util.ArrayList;
import java.util.List;

// User class
class User {
    private String name;
    private String email;

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}

// Common Area class
class CommonArea {
    private String name;
    private boolean isBooked;

    public CommonArea(String name) {
        this.name = name;
        this.isBooked = false;
    }

    public String getName() {
        return name;
    }

    public boolean isBooked() {
        return isBooked;
    }

    public void setBooked(boolean booked) {
        isBooked = booked;
    }
}

// Booking System class
class BookingSystem {
    private List<CommonArea> areas;

    public BookingSystem() {
        areas = new ArrayList<>();
    }

    // Add a common area
    public void addCommonArea(CommonArea area) {
        areas.add(area);
    }

    // Book an area
    public void bookArea(String areaName, User user) {
        for (CommonArea area : areas) {
            if (area.getName().equalsIgnoreCase(areaName)) {
                if (!area.isBooked()) {
                    area.setBooked(true);
                    System.out.println("✅ " + user.getName() + " successfully booked " + area.getName());
                } else {
                    System.out.println("❌ Sorry, " + area.getName() + " is already booked.");
                }
                return;
            }
        }
        System.out.println("❌ Area " + areaName + " not found.");
    }

    // List all areas and their status
    public void listAreas() {
        System.out.println("\nCommon Areas:");
        for (CommonArea area : areas) {
            String status = area.isBooked() ? "Booked" : "Available";
            System.out.println("- " + area.getName() + " : " + status);
        }
        System.out.println();
    }
}

// Main class to test booking system
public class CommonAreaBookingDemo {
    public static void main(String[] args) {
        // Create users
        User alice = new User("Alice", "alice@example.com");
        User bob = new User("Bob", "bob@example.com");

        // Initialize booking system
        BookingSystem bookingSystem = new BookingSystem();

        // Add common areas
        bookingSystem.addCommonArea(new CommonArea("Conference Room"));
        bookingSystem.addCommonArea(new CommonArea("Gym"));
        bookingSystem.addCommonArea(new CommonArea("Community Hall"));

        // List areas
        bookingSystem.listAreas();

        // Book some areas
        bookingSystem.bookArea("Conference Room", alice);
        bookingSystem.bookArea("Gym", bob);
        bookingSystem.bookArea("Conference Room", bob); // Already booked

        // List areas after booking
        bookingSystem.listAreas();
    }
}