const request = require("supertest");
const app = require("../app");
const { connectDB, disconnectDB, mongoose } = require("../config/db");
const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");

/**
 * Integration Tests for Mini-Wallet Transfer Functionality
 *
 * Tests the complete transfer flow with atomicity guarantees:
 * - Alice starts with balance 100
 * - Bob starts with balance 50
 * - Alice sends 50 to Bob
 * - Verify Alice has 50 remaining
 * - Verify Bob has 100 total
 */

describe("Mini-Wallet Transfer Integration Tests", () => {
  let aliceId, bobId;

  // Setup: Connect to database
  beforeAll(async () => {
    try {
      await connectDB();
    } catch (error) {
      console.error("Database setup failed:", error);
      throw error;
    }
  });

  // Teardown: Close database connection
  afterAll(async () => {
    await disconnectDB();
  });

  // Clean up test data before each test
  beforeEach(async () => {
    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
  });

  describe("Complete Transfer Scenario: Alice -> Bob", () => {
    test("Should create Alice with balance 100", async () => {
      const response = await request(app).post("/api/users").send({
        name: "Alice",
        initial_balance: 100,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Alice");
      expect(response.body.data.balance).toBe(100);

      aliceId = response.body.data.user_id;
    });

    test("Should create Bob with balance 50", async () => {
      const response = await request(app).post("/api/users").send({
        name: "Bob",
        initial_balance: 50,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Bob");
      expect(response.body.data.balance).toBe(50);

      bobId = response.body.data.user_id;
    });

    test("Should transfer 50 from Alice to Bob atomically", async () => {
      // First create both users
      const aliceResponse = await request(app)
        .post("/api/users")
        .send({ name: "Alice", initial_balance: 100 });
      aliceId = aliceResponse.body.data.user_id;

      const bobResponse = await request(app)
        .post("/api/users")
        .send({ name: "Bob", initial_balance: 50 });
      bobId = bobResponse.body.data.user_id;

      // Perform transfer
      const transferResponse = await request(app).post("/api/transfer").send({
        from_user_id: aliceId,
        to_user_id: bobId,
        amount: 50,
      });

      expect(transferResponse.status).toBe(200);
      expect(transferResponse.body.success).toBe(true);
      expect(transferResponse.body.data.amount).toBe(50);
      expect(transferResponse.body.data.from_user_balance).toBe(50);
      expect(transferResponse.body.data.to_user_balance).toBe(100);

      // Verify Alice's balance
      const aliceBalanceResponse = await request(app).get(
        `/api/users/${aliceId}/balance`
      );

      expect(aliceBalanceResponse.status).toBe(200);
      expect(aliceBalanceResponse.body.data.balance).toBe(50);

      // Verify Bob's balance
      const bobBalanceResponse = await request(app).get(
        `/api/users/${bobId}/balance`
      );

      expect(bobBalanceResponse.status).toBe(200);
      expect(bobBalanceResponse.body.data.balance).toBe(100);
    });

    test("Should fail transfer with insufficient balance", async () => {
      // Create users
      const aliceResponse = await request(app)
        .post("/api/users")
        .send({ name: "Alice", initial_balance: 30 });
      aliceId = aliceResponse.body.data.user_id;

      const bobResponse = await request(app)
        .post("/api/users")
        .send({ name: "Bob", initial_balance: 50 });
      bobId = bobResponse.body.data.user_id;

      // Try to transfer more than Alice has
      const transferResponse = await request(app).post("/api/transfer").send({
        from_user_id: aliceId,
        to_user_id: bobId,
        amount: 50,
      });

      expect(transferResponse.status).toBe(400);
      expect(transferResponse.body.success).toBe(false);
      expect(transferResponse.body.error).toBe("Insufficient balance");

      // Verify balances remain unchanged
      const aliceBalanceResponse = await request(app).get(
        `/api/users/${aliceId}/balance`
      );
      expect(aliceBalanceResponse.body.data.balance).toBe(30);

      const bobBalanceResponse = await request(app).get(
        `/api/users/${bobId}/balance`
      );
      expect(bobBalanceResponse.body.data.balance).toBe(50);
    });

    test("Should fail transfer to non-existent user", async () => {
      // Create Alice only
      const aliceResponse = await request(app)
        .post("/api/users")
        .send({ name: "Alice", initial_balance: 100 });
      aliceId = aliceResponse.body.data.user_id;

      // Try to transfer to non-existent user (valid ObjectId format)
      const fakeId = new mongoose.Types.ObjectId();
      const transferResponse = await request(app).post("/api/transfer").send({
        from_user_id: aliceId,
        to_user_id: fakeId.toString(),
        amount: 50,
      });

      expect(transferResponse.status).toBe(404);
      expect(transferResponse.body.success).toBe(false);
      expect(transferResponse.body.error).toContain("not found");

      // Verify Alice's balance unchanged
      const aliceBalanceResponse = await request(app).get(
        `/api/users/${aliceId}/balance`
      );
      expect(aliceBalanceResponse.body.data.balance).toBe(100);
    });

    test("Should fail transfer with invalid amount", async () => {
      // Create users
      const aliceResponse = await request(app)
        .post("/api/users")
        .send({ name: "Alice", initial_balance: 100 });
      aliceId = aliceResponse.body.data.user_id;

      const bobResponse = await request(app)
        .post("/api/users")
        .send({ name: "Bob", initial_balance: 50 });
      bobId = bobResponse.body.data.user_id;

      // Try to transfer negative amount
      const transferResponse = await request(app).post("/api/transfer").send({
        from_user_id: aliceId,
        to_user_id: bobId,
        amount: -10,
      });

      expect(transferResponse.status).toBe(400);
      expect(transferResponse.body.success).toBe(false);
    });

    test("Should handle multiple transfers correctly", async () => {
      // Create users
      const aliceResponse = await request(app)
        .post("/api/users")
        .send({ name: "Alice", initial_balance: 100 });
      aliceId = aliceResponse.body.data.user_id;

      const bobResponse = await request(app)
        .post("/api/users")
        .send({ name: "Bob", initial_balance: 50 });
      bobId = bobResponse.body.data.user_id;

      // First transfer: Alice -> Bob (30)
      await request(app).post("/api/transfer").send({
        from_user_id: aliceId,
        to_user_id: bobId,
        amount: 30,
      });

      // Second transfer: Alice -> Bob (20)
      await request(app).post("/api/transfer").send({
        from_user_id: aliceId,
        to_user_id: bobId,
        amount: 20,
      });

      // Verify final balances
      const aliceBalanceResponse = await request(app).get(
        `/api/users/${aliceId}/balance`
      );
      expect(aliceBalanceResponse.body.data.balance).toBe(50);

      const bobBalanceResponse = await request(app).get(
        `/api/users/${bobId}/balance`
      );
      expect(bobBalanceResponse.body.data.balance).toBe(100);
    });

    test("Should prevent negative balance", async () => {
      // Create user with minimal balance
      const aliceResponse = await request(app)
        .post("/api/users")
        .send({ name: "Alice", initial_balance: 10 });
      aliceId = aliceResponse.body.data.user_id;

      const bobResponse = await request(app)
        .post("/api/users")
        .send({ name: "Bob", initial_balance: 0 });
      bobId = bobResponse.body.data.user_id;

      // Try to transfer more than available
      const transferResponse = await request(app).post("/api/transfer").send({
        from_user_id: aliceId,
        to_user_id: bobId,
        amount: 15,
      });

      expect(transferResponse.status).toBe(400);
      expect(transferResponse.body.error).toBe("Insufficient balance");

      // Verify no balance changed
      const aliceBalanceResponse = await request(app).get(
        `/api/users/${aliceId}/balance`
      );
      expect(aliceBalanceResponse.body.data.balance).toBe(10);
    });
  });

  describe("API Endpoint Tests", () => {
    test("GET /health should return OK", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body.status).toBe("OK");
    });

    test("GET /api/users should return all users", async () => {
      // Create test users
      await request(app)
        .post("/api/users")
        .send({ name: "Alice", initial_balance: 100 });

      await request(app)
        .post("/api/users")
        .send({ name: "Bob", initial_balance: 50 });

      const response = await request(app).get("/api/users");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    test("GET /api/users/:id/balance should return 400 for invalid ID format", async () => {
      const response = await request(app).get("/api/users/invalid_id/balance");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
