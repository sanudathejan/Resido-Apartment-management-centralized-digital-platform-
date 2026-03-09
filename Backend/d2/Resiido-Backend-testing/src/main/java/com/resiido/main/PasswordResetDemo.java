import java.util.HashMap;
import java.util.Random;
import java.util.Scanner;

public class PasswordResetDemo {

    static HashMap<String, String> users = new HashMap<>();
    static HashMap<String, Integer> resetCodes = new HashMap<>();

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        // Sample user
        users.put("user@gmail.com", "12345");

        System.out.println("=== Forgot Password Demo ===");

        System.out.print("Enter your email: ");
        String email = sc.nextLine();

        if (!users.containsKey(email)) {
            System.out.println("Email not found!");
            return;
        }

        // Generate reset code
        int code = generateCode();
        resetCodes.put(email, code);

        // Simulate email sending
        System.out.println("Reset code sent to email: " + code);

        System.out.print("Enter the reset code: ");
        int enteredCode = sc.nextInt();
        sc.nextLine();

        if (enteredCode != resetCodes.get(email)) {
            System.out.println("Invalid reset code!");
            return;
        }

        System.out.print("Enter new password: ");
        String newPassword = sc.nextLine();

        users.put(email, newPassword);

        System.out.println("Password successfully reset!");
    }

    public static int generateCode() {
        Random rand = new Random();
        return 100000 + rand.nextInt(900000);
    }
}