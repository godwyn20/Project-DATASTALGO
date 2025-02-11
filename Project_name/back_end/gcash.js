@PostMapping("/gcash/pay")
public String payWithGcash(@RequestBody PaymentRequest payment) {
    // Simulate payment processing
    if (payment.getAmount() <= 0) {
        return "Invalid payment amount.";
    }
    return "Payment of " + payment.getAmount() + " PHP successful via GCash!";
}

class PaymentRequest {
    private double amount;

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
}
