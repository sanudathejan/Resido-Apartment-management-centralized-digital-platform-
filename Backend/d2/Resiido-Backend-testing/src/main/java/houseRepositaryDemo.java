import java.util.ArrayList;
import java.util.List;

// House class
class House {
    private int id;
    private String address;
    private double price;
    private int bedrooms;

    public House(int id, String address, double price, int bedrooms) {
        this.id = id;
        this.address = address;
        this.price = price;
        this.bedrooms = bedrooms;
    }

    public int getId() {
        return id;
    }

    public String getAddress() {
        return address;
    }

    public double getPrice() {
        return price;
    }

    public int getBedrooms() {
        return bedrooms;
    }

    @Override
    public String toString() {
        return "House ID: " + id + ", Address: " + address + ", Price: $" + price + ", Bedrooms: " + bedrooms;
    }
}

// Repository class for House
class HouseRepository {
    private List<House> houses;

    public HouseRepository() {
        houses = new ArrayList<>();
    }

    // Add a new house
    public void addHouse(House house) {
        houses.add(house);
        System.out.println("✅ House added: " + house.getAddress());
    }

    // Remove a house by ID
    public void removeHouse(int id) {
        houses.removeIf(h -> h.getId() == id);
        System.out.println("✅ House with ID " + id + " removed.");
    }

    // Find a house by ID
    public House findHouseById(int id) {
        for (House h : houses) {
            if (h.getId() == id) return h;
        }
        return null;
    }

    // List all houses
    public void listHouses() {
        System.out.println("\nList of Houses:");
        for (House h : houses) {
            System.out.println(h);
        }
        System.out.println();
    }
}

// Demo class
public class HouseRepositoryDemo {
    public static void main(String[] args) {
        HouseRepository repo = new HouseRepository();

        // Add houses
        repo.addHouse(new House(1, "123 Pettah Street", 50000, 3));
        repo.addHouse(new House(2, "45 Galle Road", 75000, 4));
        repo.addHouse(new House(3, "78 Kandy Road", 60000, 3));

        // List all houses
        repo.listHouses();

        // Find a house
        House house = repo.findHouseById(2);
        if (house != null) {
            System.out.println("🔍 Found house: " + house);
        } else {
            System.out.println("❌ House not found.");
        }

        // Remove a house
        repo.removeHouse(1);

        // List after removal
        repo.listHouses();
    }
}