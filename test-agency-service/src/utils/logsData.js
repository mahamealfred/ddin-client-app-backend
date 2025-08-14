// services/logService.js
import sequelize from "../db/config.js";
import TransactionStatus from "../models/TransactionStatus.js";

// Insert log entry
export const insertLogs = async (
  transactionId,
  thirdpart_status,
  description,
  amount,
  agent_name,
  status,
  service_name,
  trxId,
  customerId = null,
  token = null
) => {
  try {
    await TransactionStatus.create({
      transactionId,
      thirdpart_status,
      service_name,
      status,
      description,
      amount,
      agent_name,
      transaction_reference: trxId,
      customerId,
      token,
    });
    console.log(" Data inserted into logs");
  } catch (error) {
    console.error("Error inserting into logs:", error.message);
  }
};

// Update log entry
export const updateLogs = async (transactionId, status, trxId) => {
  try {
    const [updated] = await TransactionStatus.update(
      { transactionId, status },
      { where: { transaction_reference: trxId } }
    );
    if (updated > 0) {
      console.log(" Update successful");
    } else {
      console.log(" No matching record found to update");
    }
  } catch (error) {
    console.error("Error updating logs:", error.message);
  }
};

// Select all completed logs
export const selectAllLogs = async () => {
  try {
    const results = await TransactionStatus.findAll({
      where: { status: "Complete" },
      attributes: ["ID"],
    });
    return results.map((row) => ({ ID: row.ID }));
  } catch (error) {
    console.error("Error fetching logs:", error.message);
    return [];
  }
};

// Insert into bulk service payment results (still raw SQL for now)
export const insertInBulkServicePayment = async (
  service_name,
  agent_name,
  amount,
  successCount,
  failureCount,
  description,
  status
) => {
  try {
    await sequelize.query(
      "INSERT INTO bulkservicepaymentresults (service_name, agent_name, amount, successCount, failureCount, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      {
        replacements: [
          service_name,
          agent_name,
          amount,
          successCount,
          failureCount,
          description,
          status,
        ],
      }
    );
    console.log("Bulk service payment result inserted");
  } catch (error) {
    console.error("Error inserting bulk service payment:", error.message);
  }
};
