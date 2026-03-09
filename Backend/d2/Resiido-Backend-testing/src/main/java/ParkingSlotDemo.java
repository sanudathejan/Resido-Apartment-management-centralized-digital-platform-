import java.util.ArrayList;
import java.util.List;

// ParkingSlot class
class ParkingSlot {
    private int slotId;
    private boolean isOccupied;
    private String vehicleNumber;

    public ParkingSlot(int slotId) {
        this.slotId = slotId;
        this.isOccupied = false;
        this.vehicleNumber = "";
    }

    public int getSlotId() {
        return slotId;
    }

    public boolean isOccupied() {
        return isOccupied;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    // Park a vehicle
    public void parkVehicle(String vehicleNumber) {
        if (!isOccupied) {
            this.vehicleNumber = vehicleNumber;
            this.isOccupied = true;
            System.out.println("✅ Vehicle " + vehicleNumber + " parked in slot " + slotId);
        } else {
            System.out.println("❌ Slot " + slotId + " is already occupied.");
        }
    }

    // Remove vehicle
    public void removeVehicle() {
        if (isOccupied) {
            System.out.println("✅ Vehicle " + vehicleNumber + " removed from slot " + slotId);
            this.vehicleNumber = "";
            this.isOccupied = false;
        } else {
            System.out.println("❌ Slot " + slotId + " is already empty.");
        }
    }

    @Override
    public String toString() {
        return "Slot ID: " + slotId + ", Status: " + (isOccupied ? "Occupied (" + vehicleNumber + ")" : "Available");
    }
}

// ParkingSlotRepository class
class ParkingSlotRepository {
    private List<ParkingSlot> slots;

    public ParkingSlotRepository() {
        slots = new ArrayList<>();
    }

    // Add a new parking slot
    public void addSlot(ParkingSlot slot) {
        slots.add(slot);
        System.out.println("✅ Added parking slot: " + slot.getSlotId());
    }

    // Find slot by ID
    public ParkingSlot findSlotById(int id) {
        for (ParkingSlot slot : slots) {
            if (slot.getSlotId() == id) return slot;
        }
        return null;
    }

    // List all slots
    public void listSlots() {
        System.out.println("\nParking Slots:");
        for (ParkingSlot slot : slots) {
            System.out.println(slot);
        }
        System.out.println();
    }
}

// Demo class
public class ParkingSlotDemo {
    public static void main(String[] args) {
        ParkingSlotRepository repo = new ParkingSlotRepository();

        // Add slots
        repo.addSlot(new ParkingSlot(1));
        repo.addSlot(new ParkingSlot(2));
        repo.addSlot(new ParkingSlot(3));

        // List slots
        repo.listSlots();

        // Park vehicles
        ParkingSlot slot1 = repo.findSlotById(1);
        if (slot1 != null) slot1.parkVehicle("ABC-1234");

        ParkingSlot slot2 = repo.findSlotById(2);
        if (slot2 != null) slot2.parkVehicle("XYZ-5678");

        // Try parking in occupied slot
        if (slot1 != null) slot1.parkVehicle("LMN-9999");

        // List slots after parking
        repo.listSlots();

        // Remove vehicle
        if (slot1 != null) slot1.removeVehicle();

        // List slots after removal
        repo.listSlots();
    }
}